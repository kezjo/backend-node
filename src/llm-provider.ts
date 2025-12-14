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

export class RealLLMProvider implements LLMProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generate(prompt: string): Promise<LLMResponse> {
        console.log(`[RealLLMProvider] Calling remote API with key ${this.apiKey.substring(0, 4)}...`);
        // SIMULATION OF REAL NETWORK CALL
        // In a real app, this would use axios or fetch to call OpenAI/Anthropic
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    content: `Real completion for: "${prompt}"`,
                    usage: {
                        promptTokens: 10,
                        completionTokens: 20,
                        totalTokens: 30
                    }
                });
            }, 1000);
        });
    }
}

export class MockLLMProvider implements LLMProvider {
    async generate(prompt: string): Promise<LLMResponse> {
        console.log(`[MockLLMProvider] Returning instant mock response.`);
        return Promise.resolve({
            content: "MOCKED RESPONSE: This avoids network costs.",
            usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
            }
        });
    }
}
