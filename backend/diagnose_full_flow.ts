
import 'dotenv/config'; // Ensure env is loaded first
import { PrismaClient } from '@prisma/client';
import { createRequest } from './src/services/joinRequests.service';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Full Flow Diagnosis...');

    // 1. Create Mock User
    const user = await prisma.user.create({
        data: {
            name: "Diagnosis User",
            email: `diag_${Date.now()}@test.com`,
            password: "hashedpassword",
            title: "AI Specialist",
            skills: ["TensorFlow", "Python", "Node.js"],
            bio: "I build AI agents."
        }
    });
    console.log('✅ Mock User Created:', user.id);

    // 2. Create Mock Project (Owner = User for simplicity, or different user)
    // We need a different owner to trigger notification
    const owner = await prisma.user.create({
        data: {
            name: "Project Owner",
            email: `owner_${Date.now()}@test.com`,
            password: "hashedpassword",
        }
    });

    const project = await prisma.project.create({
        data: {
            title: "Test Project for AI",
            description: "We need AI experts.",
            category: "Tech",
            skills: "Python, AI",
            ownerId: owner.id
        }
    });
    console.log('✅ Mock Project Created:', project.id);

    // 3. Trigger Join Request (This calls AI Service implicitly)
    console.log('🔄 Calling createRequest()...');
    try {
        const request = await createRequest(project.id, user.id);
        console.log('✅ Join Request Created:', request.id);

        // 4. Verify AI Insight
        console.log('🔍 Verifying AI Insight in DB...');
        const insight = await prisma.aIInsight.findUnique({
            where: { joinRequestId: request.id }
        });

        if (insight) {
            console.log('🎉 SUCCESS! AI Insight Found:', insight);
            console.log('Score:', insight.score);
            console.log('Result:', insight.result);
        } else {
            console.error('❌ FAILURE: No AI Insight matched to this request.');
        }

    } catch (error) {
        console.error('❌ FAILURE in createRequest:', error);
    }

    // Cleanup
    console.log('🧹 Cleaning up...');
    await prisma.joinRequest.deleteMany({ where: { projectId: project.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, owner.id] } } });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
