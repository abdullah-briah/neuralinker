
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB Write for AIInsight...');

    // Find a recent join request to attach to
    const request = await prisma.joinRequest.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!request) {
        console.error('No JoinRequest found to test with.');
        return;
    }

    console.log(`Attaching insight to JoinRequest: ${request.id}`);

    try {
        const insight = await prisma.aIInsight.create({
            data: {
                type: 'match_compatibility',
                joinRequestId: request.id,
                score: 88,
                result: {
                    score: 88,
                    reason: "Test reason from standalone script."
                }
            }
        });
        console.log('Successfully created AIInsight:', insight);
    } catch (error) {
        console.error('Failed to create AIInsight:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
