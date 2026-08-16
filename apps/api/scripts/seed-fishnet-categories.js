const prisma = require("@fishnet/database");

const categories = [
  "Fishing Nets",
  "Fishing Lines",
  "Fishing Hooks",
  "Fishing Rods",
  "Fishing Reels",
  "Fishing Lures",
  "Fishing Tackle",
];

async function seedCategories() {
  await Promise.all(
    categories.map((name) => prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    }))
  );

  console.log(`Seeded ${categories.length} fishnet categories.`);
}

seedCategories()
  .catch((error) => {
    console.error("Unable to seed fishnet categories:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
