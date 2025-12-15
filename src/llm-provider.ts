export interface LLMResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMProvider {
    generate(prompt: string): Promise<LLMResponse>;
}

import * as fs from 'fs';
import * as path from 'path';

const USAGE_FILE = path.join(process.cwd(), '.usage.json');

function loadUsage(): number {
    try {
        if (fs.existsSync(USAGE_FILE)) {
            const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
            return data.count || 0;
        }
    } catch (e) {
        console.error("Failed to load usage stats", e);
    }
    return 0;
}

function saveUsage(count: number) {
    try {
        fs.writeFileSync(USAGE_FILE, JSON.stringify({ count, lastUpdated: new Date().toISOString() }, null, 2));
    } catch (e) {
        console.error("Failed to save usage stats", e);
    }
}

export let globalRequestCounter = loadUsage();
export const globalTokenStats = {
    prompt: 0,
    completion: 0,
    total: 0
};

import { GoogleGenerativeAI } from '@google/generative-ai';

export class RealLLMProvider implements LLMProvider {
    private client: GoogleGenerativeAI;
    private model: any; // Type 'any' to avoid strict type issues without full build setup, or use GenerativeModel if available
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        console.log("DEBUG: Initialized RealLLMProvider with model: gemini-2.0-flash-exp");
    }

    async generate(prompt: string): Promise<LLMResponse> {
        globalRequestCounter++;
        saveUsage(globalRequestCounter);
        console.log(`[Counter] API Request #${globalRequestCounter} - START`);
        console.log(`[RealLLMProvider] Calling Google Gemini API...`);

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Gemini doesn't always return token stats in the basic response object in all versions,
            // but we can request it or approximate if missing. 
            // For now we check if 'usageMetadata' exists.
            const usageMetadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };

            console.log(`[Counter] API Request #${globalRequestCounter} - END`);

            // Update Token Stats
            // Note: Gemini field names might slightly differ (promptTokenCount vs promptTokens)
            const pTokens = usageMetadata.promptTokenCount || 0;
            const cTokens = usageMetadata.candidatesTokenCount || 0; // or candidatesTokenCount
            const tTokens = usageMetadata.totalTokenCount || (pTokens + cTokens);

            globalTokenStats.prompt += pTokens;
            globalTokenStats.completion += cTokens;
            globalTokenStats.total += tTokens;

            console.log(`[Stats] Tokens - Prompt: ${globalTokenStats.prompt}, Completion: ${globalTokenStats.completion}, Total: ${globalTokenStats.total}`);

            return {
                content: text,
                usage: {
                    promptTokens: pTokens,
                    completionTokens: cTokens,
                    totalTokens: tTokens
                }
            };
        } catch (error: any) {
            console.error("[RealLLMProvider] Error calling Gemini:", error);

            // Check for Quota Exceeded (429)
            if (error.message && error.message.includes('429')) {
                console.warn("[RealLLMProvider] Quota Exceeded! Returning fallback message.");
                return {
                    content: "⚠️ **System Alert**: My brain is currently overloaded (API Quota Exceeded). Please give me a minute to rest and try again.",
                    usage: {
                        promptTokens: 0,
                        completionTokens: 0,
                        totalTokens: 0
                    }
                };
            }

            throw error;
        }
    }
}

export class MockLLMProvider implements LLMProvider {
    async generate(prompt: string): Promise<LLMResponse> {
        globalRequestCounter++;
        saveUsage(globalRequestCounter);
        console.log(`[Counter] API Request #${globalRequestCounter} - START`);
        console.log(`[MockLLMProvider] Checking prompt for triggers...`);

        let content = "MOCKED RESPONSE: I can help you with that.";

        // Simple heuristic for demo purposes:
        // If prompt mentions "Calculate" and hasn't seen an OBSERVATION yet, return ACTION.
        if (prompt.includes("Calculate") && !prompt.includes("OBSERVATION:")) {
            // Extract numbers approximately to make it look dynamic (optional)
            content = "ACTION: Calculator INPUT: 50 * 3";
        }
        else if (prompt.includes("OBSERVATION: 150")) {
            content = "The answer is 150.";
        }

        return Promise.resolve({
            content: content,
            usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
            }
        }).then((response) => {
            console.log(`[Counter] API Request #${globalRequestCounter} - END`);

            // Update Token Stats
            globalTokenStats.prompt += response.usage.promptTokens;
            globalTokenStats.completion += response.usage.completionTokens;
            globalTokenStats.total += response.usage.totalTokens;

            console.log(`[Stats] Tokens - Prompt: ${globalTokenStats.prompt}, Completion: ${globalTokenStats.completion}, Total: ${globalTokenStats.total}`);

            return response;
        });
    }
}
