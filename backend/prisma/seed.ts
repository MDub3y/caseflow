import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const operatorPassword = await bcrypt.hash('Operator@123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@caseflow.com' },
        update: {},
        create: {
            email: 'admin@caseflow.com',
            password: hashedPassword,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User'
        },
    });

    await prisma.user.upsert({
        where: { email: 'operator@caseflow.com' },
        update: {},
        create: {
            email: 'operator@caseflow.com',
            password: operatorPassword,
            role: 'OPERATOR',
            firstName: 'Operator',
            lastName: 'One'
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());