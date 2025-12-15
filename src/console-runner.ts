import { LLMFactory } from './llm-factory';
import { Agent } from './agent/agent';
import { SimpleMemory } from './agent/memory';
import { DictionaryTool } from './agent/tools/dictionary';
import { TUTOR_SYSTEM_PROMPT } from './personas/tutor';
import { LLMResponse, MockLLMProvider, globalTokenStats } from './llm-provider';

// Local counter for the Tutor app
let tutorApiCallCount = 0;

// Extend MockLLMProvider locally for this demo to simulate a Tutor response
class TutorMockLLMProvider extends MockLLMProvider {
    async generate(prompt: string): Promise<LLMResponse> {
        tutorApiCallCount++;
        console.log(`[Counter] Tutor API Request #${tutorApiCallCount} - START`);
        console.log(`[TutorMockLLM] Generating response...`);

        let content = "";

        if (prompt.includes("serendipity") && !prompt.includes("OBSERVATION:")) {
            content = "ACTION: Dictionary INPUT: serendipity";
        }
        else if (prompt.includes("OBSERVATION:")) {
            content = "It means a happy accident! Isn't that a lovely word?";
        }
        else if (prompt.includes("I goes to the store")) {
            content = "That's great! What did you buy?\n\n---\n**Correction:** 'I **went** to the store' (Past tense)";
        }
        else {
            content = "Hello! I am your English Tutor. How are you today?";
        }

        return Promise.resolve({
            content,
            // Add fake usage to demonstrate token counting
            usage: {
                promptTokens: prompt.length / 4, // rapid approximation 
                completionTokens: content.length / 4,
                totalTokens: (prompt.length + content.length) / 4
            }
        }).then(res => {
            console.log(`[Counter] Tutor API Request #${tutorApiCallCount} - END`);

            // Update Token Stats
            globalTokenStats.prompt += res.usage.promptTokens;
            globalTokenStats.completion += res.usage.completionTokens;
            globalTokenStats.total += res.usage.totalTokens;

            console.log(`[Stats] Tokens - Prompt: ${globalTokenStats.prompt.toFixed(0)}, Completion: ${globalTokenStats.completion.toFixed(0)}, Total: ${globalTokenStats.total.toFixed(0)}`);

            return res;
        });
    }
}

async function main() {
    console.log('--- ENGLISH TUTOR MVP STARTED ---');

    // 1. Setup Provider
    // Use Real Provider if configured, otherwise fallback to TutorMock for demo
    // const llm = new TutorMockLLMProvider(); 

    // Switch to Real Provider for production/testing with API Key
    const { RealLLMProvider } = await import('./llm-provider');
    const { config } = await import('./config');

    let llm: any;
    if (config.LLM_API_KEY) {
        console.log("Using Real Gemini Provider...");
        llm = new RealLLMProvider(config.LLM_API_KEY);
    } else {
        console.log("Using Mock Tutor Provider (No API Key found)...");
        llm = new TutorMockLLMProvider();
    }

    // 2. Setup Tools
    const tools = [new DictionaryTool()];

    // 3. Setup Agent with Tutor Persona
    const memory = new SimpleMemory();
    const agent = new Agent(llm, memory, tools, TUTOR_SYSTEM_PROMPT);

    // 4. Interaction Simulation
    const inputs = [
        "Hi! I goes to the store yesterday.",  // Trigger grammar correction
        "What does serendipity mean?"          // Trigger tool usage
    ];

    for (const input of inputs) {
        console.log(`\nStudent: ${input}`);
        const response = await agent.run(input);
        console.log(`Tutor:\n${response}`);
    }
}

main();
