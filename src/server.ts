import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";

const app = Fastify();
const prisma = new PrismaClient();

app.get("/menu/:qr", async (req, reply) => {
  const { qr } = req.params as { qr: string };

  const venue = await prisma.venue.findUnique({
    where: { qrCode: qr },
    include: { menuItems: true },
  });

  if (!venue) {
    return reply.status(404).send({ error: "Venue not found" });
  }

  return venue.menuItems;
});

app.post("/orders", async (req, reply) => {
  const body = req.body as {
    venueQr: string;
    name: string; // np. "Zamówienie od klienta 1"
    items: { itemId: string; quantity: number; notes?: string }[];
  };

  // znajdź lokal po QR
  const venue = await prisma.venue.findUnique({
    where: { qrCode: body.venueQr },
    include: { menuItems: true },
  });

  if (!venue) {
    return reply.status(404).send({ error: "Venue not found" });
  }

  // policz total
  let total = 0;
  const orderItemsData = body.items.map((i) => {
    const menuItem = venue.menuItems.find((m) => m.id === i.itemId);
    if (!menuItem) throw new Error(`MenuItem ${i.itemId} not found`);
    total += Number(menuItem.price) * i.quantity;
    return {
      itemId: i.itemId,
      quantity: i.quantity,
      notes: i.notes,
    };
  });

  // stwórz zamówienie
  const order = await prisma.order.create({
    data: {
      venueId: venue.id,
      name: body.name,
      total,
      status: "PENDING",
      orderItems: {
        create: orderItemsData,
      },
    },
    include: { orderItems: true },
  });

  return order;
});

app.listen({ port: 3000 }, () => {
  console.log("🚀 Server running on http://localhost:3000");
});