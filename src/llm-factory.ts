import { LLMProvider, MockLLMProvider, RealLLMProvider } from './llm-provider';
import { config } from './config';

export class LLMFactory {
    static createProvider(): LLMProvider {
        if (config.NODE_ENV === 'test') {
            console.log('[LLMFactory] Using MockLLMProvider due to test environment.');
            return new MockLLMProvider();
        }

        console.log('[LLMFactory] Using RealLLMProvider.');
        return new RealLLMProvider(config.LLM_API_KEY);
    }
}
