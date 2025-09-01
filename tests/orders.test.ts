import { describe, it, expect } from "vitest";
import app from "../src/server";
import { PrismaClient } from "@prisma/client";
import { checkNotNull } from "./utils";

const prisma = new PrismaClient();

describe("POST /orders", () => {
    it("should create a new order", async () => {
        const venue = checkNotNull(
            await prisma.venue.findFirst({ include: { menuItems: true } }), 
            "No venue found in database"
        );

        const items = venue.menuItems.slice(0, 2).map((item) => ({
            itemId: item.id,
            quantity: 1,
        }));

        const res = await app.inject({
            method: "POST",
            url: "/orders",
            payload: {
                venueQr: venue.qrCode,
                name: "Test Order",
                items,
            },
        });

        expect(res.statusCode).toBe(200);
        const json = JSON.parse(res.payload);
        expect(json).toHaveProperty("id");
        expect(json.orderItems.length).toBe(items.length);
    });

    it("should fail with invalid itemId", async () => {
        const venue = checkNotNull(
            await prisma.venue.findFirst(),
            "No venue found in database"
        )
        const res = await app.inject({
            method: "POST",
            url: "/orders",
            payload: {
                venueQr: venue.qrCode,
                name: "Test Order",
                items: [{ itemId: "invalidId", quantity: 1 }],
            },
        });

        expect(res.statusCode).toBe(500);
    });
});