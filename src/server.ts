
import express, { type Request, type Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getLastEventId, getSessionId, isInitializeRequest } from "./requestUtils.ts";
import { buildTransport, closeAllTransports, getTransport, hasTransport } from "./transportUtils.ts";
import { InMemoryTaskMessageQueue, InMemoryTaskStore } from "@modelcontextprotocol/sdk/experimental/index.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";



const app = createMcpExpressApp();

// JSON parser middleware must be added before MCP handlers
app.use(express.json());

const taskStore = new InMemoryTaskStore();

const server = new McpServer(
  {
    name: 'tame-your-fridge',
    version: '1.0.0',
    //TODO: icon with a fridge / food / or sick people
    icons: [{ src: './mcp.svg', sizes: ['512x512'], mimeType: 'image/svg+xml' }],
    websiteUrl: 'https://github.com/a-trigueros/mcp-at-the-table'
  },
  {
    capabilities: { logging: {}, tasks: { requests: { tools: { call: {} } } } },
    // capabilities: { logging: {} },
    taskStore, // Enable task support
    taskMessageQueue: new InMemoryTaskMessageQueue()
  }
);


// Register a simple tool that returns a greeting
server.registerTool(
  'greet',
  {
    title: 'Greeting Tool', // Display name for UI
    description: 'A simple greeting tool',
    inputSchema: {
      name: z.string().describe('Name to greet')
    }
  },
  async ({ name }): Promise<CallToolResult> => {
    return {
      content: [
        {
          type: 'text',
          text: `Hello, ${name}!`
        }
      ]
    };
  }
);


// Send requests to the MCP
const mcpPostHandler = async (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  let transport: StreamableHTTPServerTransport | null = null;


  if (hasTransport(sessionId)) {
    transport = getTransport(sessionId!);
  } else if (isInitializeRequest(req)) {
    transport = await buildTransport(server)
  }

  if (!transport) {
    // Invalid request - no session ID or not initialization request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided'
      },
      id: null
    });
    return;
  }

  try {
    await transport.handleRequest(req, res, req.body);
  }
  catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
};

// Resume session
const mcpGetHandler = async (req: Request, res: Response) => {

  const sessionId = getSessionId(req);
  if (!hasTransport(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  // Check for Last-Event-ID header for resumability
  const lastEventId = getLastEventId(req)
  if (lastEventId) {
    console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
  } else {
    console.log(`Establishing new SSE stream for session ${sessionId}`);
  }

  const transport = getTransport(sessionId!);
  await transport.handleRequest(req, res);
}

// Terminate session
const mcpDeleteHandler = async (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  if (!hasTransport(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Received session termination request for session ${sessionId}`);

  try {
    const transport = getTransport(sessionId!);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }

}

app.use(cors())
app.post("/mcp", mcpPostHandler);
app.get("/mcp", mcpGetHandler);
app.delete("/mcp", mcpDeleteHandler);

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await closeAllTransports();
  console.log('Server shutdown complete');
  process.exit(0);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
