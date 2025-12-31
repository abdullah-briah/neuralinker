import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@neuralinker.com';
    const password = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let admin = await prisma.user.findUnique({
        where: { email }
    });

    if (!admin) {
        console.log('Creating admin user...');
        admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                title: 'System Administrator'
            }
        });
    } else {
        console.log('Updating existing user to admin...');
        admin = await prisma.user.update({
            where: { email },
            data: {
                role: 'admin',
                password: hashedPassword // Reset password to ensure we know it
            }
        });
    }

    console.log(`Admin user ready: ${email} / ${password}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
