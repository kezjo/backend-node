import { config } from './config';
import { LLMFactory } from './llm-factory';

async function main() {
    try {
        console.log('--- SYSTEM STARTUP ---');
        console.log(`Environment: ${config.NODE_ENV}`);

        // 1. Dependency Injection via Factory
        const llmService = LLMFactory.createProvider();

        // 2. Business Logic Usage
        const prompt = "Explain quantum computing";
        console.log(`\nUser Query: ${prompt}`);

        const response = await llmService.generate(prompt);

        console.log('\n--- RESPONSE RECEIVED ---');
        console.log(`Content: ${response.content}`);
        console.log(`Usage: ${JSON.stringify(response.usage)}`);

    } catch (error: any) {
        console.error('\n!!! CRITICAL ERROR !!!');
        console.error(error.message);
        process.exit(1);
    }
}

main();
