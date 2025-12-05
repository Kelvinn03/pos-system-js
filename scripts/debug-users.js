
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Users ---');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`User: ${user.email}, ID: ${user.id}, Role: ${user.role}`);
        console.log(`Hash: ${user.passwordHash.substring(0, 20)}...`);
    }

    console.log('\n--- Testing Bcrypt ---');
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log(`Test Password: ${password}`);
    console.log(`Generated Hash: ${hash}`);
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Comparison Result: ${isValid}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
