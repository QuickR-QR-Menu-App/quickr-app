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

app.listen({ port: 3000 }, () => {
  console.log("🚀 Server running on http://localhost:3000");
});