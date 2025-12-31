import prisma from './prisma'; // استورد الملف اللي أنشأناه

export async function getAllUsers() {
    return await prisma.user.findMany();
}
