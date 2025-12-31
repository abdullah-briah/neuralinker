
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Checking AIInsights...');
    const insights = await prisma.aIInsight.findMany();
    console.log(`Found ${insights.length} AIInsight records.`);
    if (insights.length > 0) {
        console.log('Sample:', insights[0]);
    } else {
        console.log('No AI insights found.');
    }

    console.log('Checking Recent JoinRequests...');
    const requests = await prisma.joinRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { aiInsight: true }
    });

    requests.forEach(r => {
        console.log(`Request ${r.id}: Status=${r.status}, HasInsight=${!!r.aiInsight}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
