import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Agent } from './agent/agent';
import { SimpleMemory } from './agent/memory';
import { DictionaryTool } from './agent/tools/dictionary';
import { TUTOR_SYSTEM_PROMPT } from './personas/tutor';
import { MockLLMProvider, RealLLMProvider } from './llm-provider';
import { config } from './config';

const app = express();
app.use(cors());
app.use(express.static('public')); // Serve static files if we have them later

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize LLM Provider
let llmProvider: any;
if (config.LLM_API_KEY) {
    console.log("Using Real Gemini Provider...");
    llmProvider = new RealLLMProvider(config.LLM_API_KEY);
} else {
    console.log("Using Mock Tutor Provider (No API Key found)...");
    llmProvider = new MockLLMProvider();
}

// In-memory session store (very simple for MVP)
// Map<socketId, Agent>
const agentSessions = new Map<string, Agent>();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a fresh agent for this session
    // We could reuse agents if we had user IDs, but for now 1 socket = 1 fresh agent
    const memory = new SimpleMemory();
    const tools = [new DictionaryTool()];
    const agent = new Agent(llmProvider, memory, tools, TUTOR_SYSTEM_PROMPT);

    agentSessions.set(socket.id, agent);

    // Initial Greeting
    agent.run("Hello", 1).then(response => {
        // Usually the "Hello" prompt might be internal to prime the agent, 
        // or we just send a static welcome. 
        // For this tutor, let's just send a welcome message directly.
        socket.emit('chat:response', "Hello! I am your AI English Tutor. How can I help you today?");
    });

    socket.on('chat:message', async (msg: string) => {
        console.log(`[${socket.id}] User: ${msg}`);

        const userAgent = agentSessions.get(socket.id);
        if (!userAgent) return;

        try {
            // Notify frontend that the bot is thinking
            socket.emit('status', 'thinking');

            // Run the agent loop
            const response = await userAgent.run(msg);
            socket.emit('chat:response', response);
        } catch (err) {
            console.error("Error processing message:", err);
            socket.emit('error', "Something went wrong processing your message.");
        } finally {
            socket.emit('status', 'idle');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        agentSessions.delete(socket.id);
    });
});

app.get('/health', (req, res) => {
    res.send({ status: 'ok', time: new Date().toISOString() });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n--- SERVER RUNNING ---`);
    console.log(`Listening on http://localhost:${PORT}`);
});
