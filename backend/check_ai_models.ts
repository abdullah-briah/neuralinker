import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('API Key missing');
        return;
    }
    try {
        // There isn't a direct listModels on genAI instance in some SDK versions,
        // but let's try the model manager if available, or just try to generate with a known working model.
        // Actually, the error message explicitly said "Call ListModels".
        // In the Node SDK, it's often unavailable directly.
        // Let's rely on trying a simple generation with a few likely candidates.

        const candidates = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
            'gemini-pro',
            'gemini-2.0-flash-exp'
        ];

        console.log("Testing models...");
        for (const modelName of candidates) {
            try {
                process.stdout.write(`Testing ${modelName}... `);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ Success!`);
            } catch (e: any) {
                console.log(`❌ Failed: ${e.message.split('[')[1]?.split(']')[0] || e.message}`);
            }
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

listModels();
