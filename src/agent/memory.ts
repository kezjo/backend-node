export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AgentMemory {
    addMessage(role: Message['role'], content: string): void;
    getHistory(): Message[];
    clear(): void;
}

export class SimpleMemory implements AgentMemory {
    private messages: Message[] = [];

    addMessage(role: Message['role'], content: string): void {
        this.messages.push({ role, content });
    }

    getHistory(): Message[] {
        // Return a copy to prevent mutation
        return [...this.messages];
    }

    clear(): void {
        this.messages = [];
    }
}
