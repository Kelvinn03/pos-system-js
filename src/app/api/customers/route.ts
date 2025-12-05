import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - List all customers with optional search and tier filter
export async function GET(req: Request) {
    try {
        console.log("Fetching customers...");
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const tier = searchParams.get("tier") || "";
        const customerId = searchParams.get("id");

        // Get single customer with transactions
        if (customerId) {
            console.log(`Fetching customer with ID: ${customerId}`);
            try {
                const customer = await prisma.customer.findUnique({
                    where: { id: parseInt(customerId) },
                    include: {
                        transactions: {
                            include: {
                                items: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                            orderBy: { createdAt: "desc" },
                            take: 10,
                        },
                    },
                });

                if (!customer) {
                    console.log(`Customer with ID ${customerId} not found`);
                    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
                }

                console.log(`Found customer: ${customer.name}`);
                return NextResponse.json(customer);
            } catch (err) {
                console.error("Error fetching single customer:", err);
                return NextResponse.json({ error: "Error fetching customer details" }, { status: 500 });
            }
        }

        // Build where clause for filtering
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        if (tier) {
            where.tier = tier;
        }

        console.log("Fetching customers with filters:", { search, tier });
        
        const customers = await prisma.customer.findMany({
            where,
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        console.log(`Found ${customers.length} customers`);
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error in GET /api/customers:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch customers" },
            { status: 500 }
        );
    }
}

// POST - Create new customer
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Check if email already exists
        if (email) {
            const existing = await prisma.customer.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json({ error: "Email already exists" }, { status: 400 });
            }
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                loyaltyPoints: 0,
                tier: "BRONZE",
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}

// PUT - Update customer
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, email, phone, loyaltyPoints, tier } = body;

        if (!id) {
            return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
        }

        // Check email uniqueness if changed
        if (email) {
            const existing = await prisma.customer.findFirst({
                where: {
                    email,
                    NOT: { id: parseInt(id) },
                },
            });
            if (existing) {
                return NextResponse.json({ error: "Email already exists" }, { status: 400 });
            }
        }

        // Calculate tier based on loyalty points if points are being updated
        let calculatedTier = tier;
        if (loyaltyPoints !== undefined && !tier) {
            if (loyaltyPoints >= 10000) calculatedTier = "PLATINUM";
            else if (loyaltyPoints >= 5000) calculatedTier = "GOLD";
            else if (loyaltyPoints >= 1000) calculatedTier = "SILVER";
            else calculatedTier = "BRONZE";
        }

        const customer = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email: email || null,
                phone: phone || null,
                ...(loyaltyPoints !== undefined && { loyaltyPoints: parseInt(loyaltyPoints) }),
                ...(calculatedTier && { tier: calculatedTier }),
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
    }
}

// DELETE - Remove customer
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
        }

        // First, disconnect customer from transactions
        await prisma.transaction.updateMany({
            where: { customerId: parseInt(id) },
            data: { customerId: null },
        });

        await prisma.customer.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
    }
}
