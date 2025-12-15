
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // For listing models we need to use the model manager if available in this SDK version
    // or just try to instantiate a model. But correct way in newer SDKs:
    // Actually the SDK might not expose listModels directly on the main class easily in all versions.
    // Let's try the direct HTTP approach if SDK fails, but SDK usually has it on the client or a specific manager.
    // Checking SDK docs for 0.21+: usually it's not directly on client instance.
    // Wait, genAI.getGenerativeModel is for getting a model. 
    // To list models, it's often effectively a different endpoint.

    try {
        console.log("Fetching available models...");
        // In some versions it is accessed via a ModelManager, but to be safe and simple,
        // let's try to just hit the REST endpoint since we have the key, 
        // OR try a known working model like 'gemini-pro' just to test connectivity vs model existence.

        // However, a robust way is to use 'fetch' directly to the list endpoint to be 100% sure what the API sees.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else if (data.models) {
            console.log("--- AVAILABLE MODELS ---");
            data.models.forEach((m: any) => {
                // Filter for generateContent supported models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
            console.log("------------------------");
        } else {
            console.log("No models returned or unexpected format:", data);
        }
    } catch (error) {
        console.error("Failed to list models:", error);
    }
}

listModels();
