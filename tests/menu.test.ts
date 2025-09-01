import { describe, it, expect, beforeAll } from "vitest";
import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import app from "../src/server";
import { checkNotNull } from "./utils";

const prisma = new PrismaClient();

describe("GET /menu/:qr", () => {
  let server: ReturnType<typeof Fastify>;

  beforeAll(() => {
    server = app;
  });

  it("should return menu for valid QR code", async () => {
    const venue = checkNotNull(
        await prisma.venue.findFirst(),
        "No venue found in database."
    );

    const res = await server.inject({
      method: "GET",
      url: `/menu/${venue.qrCode}`,
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.payload);
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBeGreaterThan(0);
    expect(json[0]).toHaveProperty("name");
  });

  it("should return 404 for invalid QR code", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/menu/invalidQR`,
    });

    expect(res.statusCode).toBe(404);
  });
});