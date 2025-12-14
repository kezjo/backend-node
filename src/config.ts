import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    LLM_API_KEY: process.env.LLM_API_KEY || '',
};

// SAFETY CHECK
// This ensures we never accidentally use a real API key when existing in a test environment.
const isTestEnv = config.NODE_ENV === 'test';
const apiKey = config.LLM_API_KEY;

if (isTestEnv && apiKey && !apiKey.startsWith('sk-test-') && !apiKey.startsWith('MOCK_')) {
    throw new Error("CRITICAL SECURITY: Real API Key detected in TEST environment. Aborting startup.");
}

console.log(`[Config] Loaded configuration for env: ${config.NODE_ENV}`);
