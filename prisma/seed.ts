import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Tworzymy admina
  const admin = await prisma.admin.upsert({
    where: { email: "demo@food.pl" },
    update: {},
    create: {
      email: "demo@food.pl",
      password: "hashedpassword", // placeholder
      venues: {
        create: [
          {
            name: "Foodtruck Demo 1",
            qrCode: "demo123",
            settings: {
              create: {
                brandColor: "#FF0000",
                logoUrl: "https://example.com/logo1.png",
                currency: "PLN",
                language: "pl",
                kioskToken: "kiosk-demo-1",
              },
            },
            menuItems: {
              create: [
                { name: "Burger", price: 25.0, category: "Fast food", isAvailable: true },
                { name: "Frytki", price: 10.0, category: "Fast food", isAvailable: true },
                { name: "Cola", price: 8.0, category: "Napoje", isAvailable: true },
              ],
            },
          },
          {
            name: "Foodtruck Demo 2",
            qrCode: "demo456",
            settings: {
              create: {
                brandColor: "#00FF00",
                logoUrl: "https://example.com/logo2.png",
                currency: "PLN",
                language: "pl",
                kioskToken: "kiosk-demo-2",
              },
            },
            menuItems: {
              create: [
                { name: "Hot Dog", price: 15.0, category: "Fast food", isAvailable: true },
                { name: "Chips", price: 7.0, category: "Fast food", isAvailable: true },
                { name: "Sok", price: 6.0, category: "Napoje", isAvailable: true },
              ],
            },
          },
        ],
      },
    },
    include: {
      venues: {
        include: { menuItems: true, settings: true },
      },
    },
  });

  console.log("Seed done ✅ Admin and venues created:", admin);

  // Przykładowe zamówienie dla pierwszego lokalu
  const firstVenue = admin.venues[0];
  const order = await prisma.order.create({
    data: {
      venueId: firstVenue.id,
      name: "Zamówienie demo 1",
      total: 25 + 10, // Burger + Frytki
      status: "PENDING",
      orderItems: {
        create: [
          { itemId: firstVenue.menuItems[0].id, quantity: 1 },
          { itemId: firstVenue.menuItems[1].id, quantity: 1 },
        ],
      },
    },
    include: { orderItems: true },
  });

  console.log("Sample order created:", order);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });