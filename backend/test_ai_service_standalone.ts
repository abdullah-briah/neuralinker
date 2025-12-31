
import 'dotenv/config'; // Load env vars
import { analyzeMatch } from './src/services/ai.service';

async function testAI() {
    console.log('Testing AI Service...');
    console.log(`API Key Loaded: ${!!process.env.GEMINI_API_KEY}`);

    // Mock Data
    const userProfile = {
        name: "Test User",
        title: "Frontend Developer",
        bio: "Experienced in React and Node.js",
        skills: ["React", "TypeScript", "Node.js", "CSS"]
    };

    const projectDetails = {
        title: "NeuraLinker Web App",
        description: "Building a futuristic platform for connecting minds.",
        skills: ["React", "Express", "Prisma"],
        category: "Tech"
    };

    try {
        const result = await analyzeMatch(userProfile, projectDetails);
        console.log('AI Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testAI();
