const prisma = require("@aazhimin/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { generateToken } = require("../middleware/auth");

const oauthStateCookieName = "aazhimin_google_oauth_state";
const oauthStateMaxAgeSeconds = 10 * 60;

const normalizeEmail = (email) => (typeof email === "string" ? email.trim().toLowerCase() : "");

const safeRedirectPath = (next) => {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
};

const readGoogleOAuthConfig = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`}/api/auth/oauth/google/callback`;
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const stateSecret = process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET;

  if (!clientId || !clientSecret || !redirectUri || !stateSecret) {
    throw new AppError("Google OAuth provider is not configured", 503);
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    frontendUrl: frontendUrl.replace(/\/$/, ""),
    stateSecret,
  };
};

const signOAuthState = (payload, secret) => {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
};

const createOAuthState = (next, secret) => {
  const nonce = crypto.randomBytes(24).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      nonce,
      next: safeRedirectPath(next),
      expiresAt: Date.now() + oauthStateMaxAgeSeconds * 1000,
    })
  ).toString("base64url");

  return {
    nonce,
    value: `${payload}.${signOAuthState(payload, secret)}`,
  };
};

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName) {
      cookies[rawName] = decodeURIComponent(rawValue.join("="));
    }

    return cookies;
  }, {});
};

const readOAuthState = (state, cookieHeader, secret) => {
  if (typeof state !== "string" || !state.includes(".")) {
    throw new AppError("Invalid OAuth state", 400);
  }

  const [payload, signature] = state.split(".");
  const expectedSignature = signOAuthState(payload, secret);

  if (
    !signature ||
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    throw new AppError("Invalid OAuth state", 400);
  }

  let parsedState;

  try {
    parsedState = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new AppError("Invalid OAuth state", 400);
  }

  const cookies = parseCookies(cookieHeader);

  if (!parsedState.nonce || cookies[oauthStateCookieName] !== parsedState.nonce) {
    throw new AppError("Invalid OAuth state", 400);
  }

  if (!parsedState.expiresAt || Date.now() > parsedState.expiresAt) {
    throw new AppError("OAuth state has expired", 400);
  }

  return {
    next: safeRedirectPath(parsedState.next),
  };
};

const clearOAuthStateCookie = () => {
  return `${oauthStateCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
};

const exchangeGoogleCode = async (config, code) => {
  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new AppError("Failed to exchange Google OAuth code", 502);
  }
};

const readGoogleProfile = async (accessToken) => {
  try {
    const response = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new AppError("Failed to read Google OAuth profile", 502);
  }
};

const findOrCreateOAuthUser = async (profile) => {
  const email = normalizeEmail(profile.email);

  if (!email || profile.email_verified === false) {
    throw new AppError("Google account email is not verified", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          verificationStatus: true,
          status: true,
        },
      },
    },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      email,
      role: "BUYER",
    },
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          verificationStatus: true,
          status: true,
        },
      },
    },
  });
};

const buildOAuthCallbackUrl = (frontendUrl, token, next) => {
  const params = new URLSearchParams({
    access_token: token,
    next: safeRedirectPath(next),
  });

  return `${frontendUrl}/auth/oauth/callback#${params.toString()}`;
};

/**
 * Login endpoint for buyers and sellers
 * Expects: { email, password }
 * Returns: { user, token }
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  // Validate input
  if (!normalizedEmail || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          verificationStatus: true,
          status: true
        }
      }
    }
  });

  if (!user || !user.password) {
    // Use generic message to prevent user enumeration
    throw new AppError("Invalid email or password", 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = generateToken(user);

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;

  // Return user and token
  res.status(200).json({
    user: userWithoutPassword,
    token
  });
});

/**
 * Register a buyer (separate from seller registration)
 * Expects: { email, password, name, phone, address } (optional)
 * Returns: { user }
 */
const registerBuyer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  // Validate required fields
  if (!normalizedEmail || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with BUYER role
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      role: "BUYER",
    }
  });

  // Optionally create buyer profile (we don't have a separate buyer profile model yet)
  // For now, we just have the user

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    message: "Buyer registered successfully",
    userId: user.id,
    user: userWithoutPassword
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          verificationStatus: true,
          status: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ user: userWithoutPassword });
});

const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  res.status(200).json({
    message: "If an account exists for that email, password reset instructions will be sent."
  });
});

const startGoogleOAuth = asyncHandler(async (req, res) => {
  const config = readGoogleOAuthConfig();
  const state = createOAuthState(req.query.next, config.stateSecret);
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state.value);
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("prompt", "select_account");

  res.cookie(oauthStateCookieName, state.nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: oauthStateMaxAgeSeconds * 1000,
    path: "/",
  });
  res.redirect(authorizationUrl.toString());
});

const handleGoogleOAuthCallback = asyncHandler(async (req, res) => {
  const config = readGoogleOAuthConfig();
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";

  if (!code) {
    throw new AppError("Google OAuth code is required", 400);
  }

  const statePayload = readOAuthState(state, req.headers.cookie, config.stateSecret);
  const tokenSet = await exchangeGoogleCode(config, code);
  if (!tokenSet.access_token) {
    throw new AppError("Google OAuth token response is invalid", 502);
  }

  const profile = await readGoogleProfile(tokenSet.access_token);
  const user = await findOrCreateOAuthUser(profile);
  const token = generateToken(user);
  const redirectUrl = buildOAuthCallbackUrl(config.frontendUrl, token, statePayload.next);

  res.setHeader("Set-Cookie", clearOAuthStateCookie());
  res.redirect(redirectUrl);
});

module.exports = {
  login,
  registerBuyer,
  getCurrentUser,
  logout,
  forgotPassword,
  startGoogleOAuth,
  handleGoogleOAuthCallback
};
