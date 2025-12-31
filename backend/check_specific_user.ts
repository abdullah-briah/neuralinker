import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'abdullahboureh23@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
        }
    });

    if (user) {
        console.log(`User Found: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Avatar URL: ${user.avatarUrl}`);
    } else {
        console.log(`User with email ${email} not found.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
