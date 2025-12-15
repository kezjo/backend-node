import { LLMProvider, LLMResponse } from '../llm-provider';
import { AgentMemory, Message } from './memory';
import { Tool } from './tool';

export class Agent {
    private llm: LLMProvider;
    private memory: AgentMemory;
    private tools: Tool[];
    private systemPrompt: string;

    constructor(llm: LLMProvider, memory: AgentMemory, tools: Tool[] = [], systemPrompt: string = "You are a helpful assistant.") {
        this.llm = llm;
        this.memory = memory;
        this.tools = tools;
        this.systemPrompt = systemPrompt;
    }

    async run(input: string, maxTurns = 5): Promise<string> {
        this.memory.addMessage('user', input);

        let currentTurn = 0;

        while (currentTurn < maxTurns) {
            currentTurn++;
            const history = this.memory.getHistory();
            const promptContext = this.formatHistory(history);

            const response: LLMResponse = await this.llm.generate(promptContext);
            const content = response.content;

            // Log the raw assistant response to memory
            this.memory.addMessage('assistant', content);

            // Check for Tool Action
            // Expected format: ACTION: ToolName INPUT: <input string>
            const actionMatch = content.match(/ACTION:\s*(\w+)\s*INPUT:\s*(.*)/);

            if (actionMatch) {
                const toolName = actionMatch[1];
                const toolInput = actionMatch[2].trim();

                console.log(`[Agent] Detected action: Use ${toolName} with input "${toolInput}"`);

                const tool = this.tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());

                if (tool) {
                    const result = await tool.execute(toolInput);
                    const observation = `OBSERVATION: ${result}`;
                    console.log(`[Agent] Tool output: ${result}`);

                    // Feed observation back to LLM
                    this.memory.addMessage('system', observation);
                } else {
                    const errorMsg = `OBSERVATION: Error - Tool ${toolName} not found.`;
                    this.memory.addMessage('system', errorMsg);
                }
                // Continue the loop to let the LLM see the observation and respond
            } else {
                // No action, final response
                return content;
            }
        }

        return "Agent stopped due to max turns limit.";
    }

    private formatHistory(history: Message[]): string {
        let systemPrompt = `${this.systemPrompt}\n`;

        if (this.tools.length > 0) {
            systemPrompt += "You have access to the following tools:\n";
            this.tools.forEach(t => {
                systemPrompt += `- ${t.name}: ${t.description}\n`;
            });
            systemPrompt += "To use a tool, you MUST use this format:\n";
            systemPrompt += "ACTION: ToolName INPUT: tool input here\n";
            systemPrompt += "Example: ACTION: Calculator INPUT: 50 * 2\n";
            systemPrompt += "When you have the answer, respond normally without the ACTION keyword.\n";
        }

        const historyStr = history.map(msg => {
            if (msg.role === 'system') return `SYSTEM: ${msg.content}`;
            return `${msg.role.toUpperCase()}: ${msg.content}`;
        }).join('\n');

        return `${systemPrompt}\n${historyStr}\nASSISTANT:`;
    }
}
