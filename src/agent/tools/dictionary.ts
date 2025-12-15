import { Tool } from '../tool';

export class DictionaryTool implements Tool {
    name = "Dictionary";
    description = "Look up the definition of an English word. Input should be a single word.";

    async execute(input: string): Promise<string> {
        const word = input.trim().toLowerCase();

        // Mock dictionary for MVP
        const mockDB: Record<string, string> = {
            "serendipity": "The occurrence and development of events by chance in a happy or beneficial way.",
            "ephemeral": "Lasting for a very short time.",
            "antigravity": "A hypothetical force that opposes gravity.",
            "agent": "A person or thing that takes an active role or produces a specified effect."
        };

        if (mockDB[word]) {
            return `Definition of "${word}": ${mockDB[word]}`;
        }

        return `Definition for "${word}" not found in local dictionary.`;
    }
}
