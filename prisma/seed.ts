import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Admin + venue
  const admin = await prisma.admin.upsert({
    where: { email: "demo@food.pl" },
    update: {},
    create: {
      email: "demo@food.pl",
      password: "hashedpassword", // placeholder
      venues: {
        create: {
          name: "Foodtruck Demo",
          qrCode: "demo123",
          menuItems: {
            create: [
              { name: "Burger", price: 25.0, category: "Fast food" },
              { name: "Frytki", price: 10.0, category: "Fast food" },
              { name: "Cola", price: 8.0, category: "Napoje" },
            ],
          },
        },
      },
    },
  });

  console.log("Seed done", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });