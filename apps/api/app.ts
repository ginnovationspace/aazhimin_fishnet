// Global error handler
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { addRequestId, requestLogger, errorLogger, securityLogger } from './middleware/requestLogger';
import { authenticate } from './middleware/auth';
import { generalLimiter, authLimiter, registerLimiter, userManagementLimiter, uploadLimiter, searchLimiter, orderLimiter } from './middleware/rateLimiter';
import productsRouter from './routes/products';
import productImagesRouter from './routes/productImages';
import categoryRouter from './routes/category';
import searchRouter from './routes/search';
import mainImageRouter from './routes/mainImages';
import userRouter from './routes/users';
import orderRouter from './routes/customer_orders';
import slugRouter from './routes/slugs';
import orderProductRouter from './routes/customer_order_product';
import wishlistRouter from './routes/wishlist';
import notificationsRouter from './routes/notifications';
import merchantRouter from './routes/merchant';
import bulkUploadRouter from './routes/bulkUpload';
import marketplaceOrderRouter from './routes/marketplaceOrder';
import authRouter from './routes/auth';
import sellerOrderRouter from './routes/sellerOrder';
import sellerProductsRouter from './routes/sellerProducts';
import sellerRouter from './routes/seller';
import paymentWebhookRouter from './routes/paymentWebhook';
import paymentsRouter from './routes/payments';
import buyerOrderRouter from './routes/buyerOrder';
import reviewRouter from './routes/review';
import adminRouter from './routes/admin';

// Prefer the repository environment file, then use an API-local file only as
// a fallback. dotenv does not overwrite existing values by default.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app: Express = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Add request ID to all requests
app.use(addRequestId);

// Security logging (check for suspicious patterns)
app.use(securityLogger);

// Standard request logging
app.use(requestLogger);

// Error logging (only logs 4xx and 5xx responses)
app.use(errorLogger);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    process.env.NEXTAUTH_URL,
    process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

// CORS configuration with origin validation
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        } else {
          // Reject other origins
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies and authorization headers
};

// Apply general rate limiting to all routes
app.use(generalLimiter);
app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload());
// Apply specific rate limiters to different route groups
app.use("/api/users", userManagementLimiter);
app.use("/api/search", searchLimiter);
app.use("/api/orders", orderLimiter);
app.use('/api/order-product', orderProductRouter);
app.use("/api/images", uploadLimiter);
app.use("/api/main-image", uploadLimiter);
// app.use("/api/wishlist", wishlistLimiter);
// app.use("/api/products", productLimiter);
// app.use("/api/merchants", productLimiter);
app.use("/api/bulk-upload", uploadLimiter);
// Apply stricter rate limiting to authentication-related routes
app.use("/api/users/email", authLimiter); // For login attempts via email lookup
// Apply admin rate limiting to admin routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/images", productImagesRouter);
app.use("/api/main-image", mainImageRouter);
app.use("/api/users", userRouter);
app.use("/api/search", searchRouter);
app.use("/api/orders", orderRouter);
app.use("/api/slugs", slugRouter);
app.use("/api/wishlist", authenticate, wishlistRouter);
app.use("/api/notifications", authenticate, notificationsRouter);
app.use("/api/merchants", merchantRouter);
app.use("/api/bulk-upload", bulkUploadRouter);
app.use("/api/marketplace-orders", marketplaceOrderRouter); // New route mount
app.use("/api/auth", authRouter); // Auth route mount
app.use("/api/v1/auth", authRouter); // OAuth compatibility route mount
app.use("/api/seller", registerLimiter, sellerRouter); // Seller registration routes
app.use("/api/seller", sellerOrderRouter); // Seller order route mount
app.use("/api/seller/products", sellerProductsRouter); // Seller products route mount
app.use("/api/payment-webhook", paymentWebhookRouter); // Payment webhook route mount
app.use("/api/payment", paymentsRouter); // Payment route mount used by checkout
app.use("/api/payments", paymentsRouter); // Plural payment route compatibility
app.use("/api/buyer", buyerOrderRouter); // Buyer order route mount
app.use("/api/review", reviewRouter); // Review route mount
app.use("/api/admin", adminRouter); // Admin route mount
// Health check endpoint (no rate limiting)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        rateLimiting: 'enabled',
        requestId: (req as any).reqId
    });
});
// Rate limit info endpoint
app.get('/rate-limit-info', (req: Request, res: Response) => {
    res.status(200).json({
        general: '100 requests per 15 minutes',
        auth: '5 login attempts per 15 minutes',
        register: '3 registrations per hour',
        upload: '10 uploads per 15 minutes',
        search: '30 searches per minute',
        orders: '15 order operations per 15 minutes',
        wishlist: '20 operations per 5 minutes',
        products: '60 requests per minute',
        requestId: (req as any).reqId
    });
});
// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
        requestId: (req as any).reqId
    });
});
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }
  const statusCode = 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';

    if (statusCode >= 500) {
      console.error(`[${new Date().toISOString()}] Error:`, err);
    } else {
      console.warn(
        `[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.originalUrl}: ${message}`
      );
    }

    res.status(statusCode).json({
      error: message,
      requestId: (req as any).reqId
    });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Rate limiting and request logging enabled for all endpoints');
    console.log('Logs are being written to server/logs/ directory');
});

export default app;
