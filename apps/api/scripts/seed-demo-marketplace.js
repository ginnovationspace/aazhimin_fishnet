const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

const prisma = require("@fishnet/database");

const password = "FishnetDemo!2026";
const categoryNames = [
  "Fishing Nets",
  "Fishing Lines",
  "Fishing Hooks",
  "Fishing Rods",
  "Fishing Reels",
  "Fishing Lures",
  "Fishing Tackle",
];

const sellers = [
  { name: "Coastal Net Works", email: "seller1@fishnet.demo", city: "Kochi" },
  { name: "Harbor Gear Supply", email: "seller2@fishnet.demo", city: "Chennai" },
  { name: "Bluewater Fishing Co.", email: "seller3@fishnet.demo", city: "Visakhapatnam" },
  { name: "Riverline Nets", email: "seller4@fishnet.demo", city: "Kolkata" },
  { name: "Ocean Catch Equipment", email: "seller5@fishnet.demo", city: "Mangaluru" },
];

const productTemplates = [
  { title: "Premium Gill Net", netType: "gill-nets", material: "Nylon", meshSize: "50 mm", price: 1800 },
  { title: "Hand Cast Fishing Net", netType: "cast-nets", material: "Monofilament", meshSize: "25 mm", price: 1400 },
  { title: "Commercial Seine Net", netType: "seine-nets", material: "HDPE", meshSize: "75 mm", price: 4200 },
  { title: "Heavy Duty Drag Net", netType: "drag-nets", material: "Polyethylene", meshSize: "60 mm", price: 3600 },
  { title: "Multi Layer Trammel Net", netType: "trammel-nets", material: "Nylon", meshSize: "40 mm", price: 2800 },
];

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function runWithDatabaseRetry(operation) {
  const attempts = 5;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionFailure = error?.code === "P1001" || error?.name === "PrismaClientInitializationError";

      if (!isConnectionFailure || attempt === attempts) {
        throw error;
      }

      const waitSeconds = attempt * 3;
      console.warn(`Database connection attempt ${attempt} failed. Retrying in ${waitSeconds} seconds...`);
      await prisma.$disconnect();
      await delay(waitSeconds * 1000);
    }
  }
}

async function seedDemoMarketplace() {
  const passwordHash = await bcrypt.hash(password, 12);
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    }))
  );
  const fishingNetsCategory = categories.find((category) => category.name === "Fishing Nets");

  await prisma.user.upsert({
    where: { email: "admin@fishnet.demo" },
    update: { password: passwordHash, role: "ADMIN" },
    create: { email: "admin@fishnet.demo", password: passwordHash, role: "ADMIN" },
  });

  for (const [sellerIndex, seller] of sellers.entries()) {
    const user = await prisma.user.upsert({
      where: { email: seller.email },
      update: { password: passwordHash, role: "SELLER" },
      create: { email: seller.email, password: passwordHash, role: "SELLER" },
    });

    const merchant = await prisma.merchant.upsert({
      where: { userId: user.id },
      update: {
        name: seller.name,
        email: seller.email,
        address: seller.city,
        verificationStatus: "APPROVED",
        status: "ACTIVE",
      },
      create: {
        userId: user.id,
        name: seller.name,
        description: `Approved demo seller based in ${seller.city}.`,
        email: seller.email,
        phone: `90000000${sellerIndex + 1}`,
        address: seller.city,
        verificationStatus: "APPROVED",
        verificationSubmittedAt: new Date(),
        verificationReviewedAt: new Date(),
      },
    });

    for (const [productIndex, template] of productTemplates.entries()) {
      const slug = `demo-${sellerIndex + 1}-${productIndex + 1}-${template.netType}`;
      await prisma.product.upsert({
        where: { slug },
        update: {
          title: `${template.title} — ${seller.name}`,
          price: template.price + sellerIndex * 150,
          inStock: 20 + productIndex * 5,
        },
        create: {
          slug,
          title: `${template.title} — ${seller.name}`,
          mainImage: "product_placeholder.jpg",
          price: template.price + sellerIndex * 150,
          rating: 4,
          description: `${template.title} for coastal, river, and commercial fishing use.`,
          manufacturer: seller.name,
          inStock: 20 + productIndex * 5,
          categoryId: fishingNetsCategory.id,
          merchantId: merchant.id,
          netType: template.netType,
          meshSize: template.meshSize,
          netLength: 30 + productIndex * 10,
          netHeight: 2 + productIndex,
          material: template.material,
          color: productIndex % 2 === 0 ? "Green" : "White",
          usage: productIndex < 3 ? "Commercial Fishing" : "Freshwater Fishing",
          waterType: productIndex < 3 ? "Marine" : "Freshwater",
          countryOfOrigin: "India",
          weight: 2 + productIndex,
          customizationAvailability: productIndex % 2 === 0,
          shippingInformation: "Dispatches within 2 business days.",
        },
      });
    }
  }

  const [adminCount, sellerCount, productCount] = await Promise.all([
    prisma.user.count({ where: { email: "admin@fishnet.demo" } }),
    prisma.user.count({ where: { email: { in: sellers.map((seller) => seller.email) } } }),
    prisma.product.count({ where: { slug: { startsWith: "demo-" } } }),
  ]);

  console.log(`Demo data ready: ${adminCount} admin, ${sellerCount} sellers, ${productCount} products.`);
}

runWithDatabaseRetry(seedDemoMarketplace)
  .catch((error) => {
    console.error("Unable to seed demo marketplace:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
