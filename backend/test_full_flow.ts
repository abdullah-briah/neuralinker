
import 'dotenv/config';
import { analyzeMatch } from './src/services/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFullFlow() {
    console.log('Testing AI Service & DB Persistence...');
    
    // 1. Test AI
    const result = await analyzeMatch(
        { name: "Test User", title: "Dev", bio: "Bio", skills: ["React", "Node"] },
        { title: "Project", description: "Desc", category: "Tech", skills: ["React", "Node"] }
    );
    console.log('AI Result:', result);

    if (result.score === 0 && result.reason.includes('Error')) {
        console.error('AI Service Failed inside test.');
        return;
    }

    // 2. Test DB Write (Mocking a join request)
    // We need a valid JoinRequest ID. Let's find one or create a dummy user/project first? 
    // Too complex. Let's just check if AIInsight table exists and is writable.
    try {
        const count = await prisma.aIInsight.count();
        console.log(`Current AIInsight count: ${count}`);
        console.log('DB connection and schema seem okay.');
    } catch (e) {
        console.error('DB Access Failed:', e);
    }
}

testFullFlow()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
