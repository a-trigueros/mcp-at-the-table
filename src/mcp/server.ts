import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTaskMessageQueue, InMemoryTaskStore } from "@modelcontextprotocol/sdk/experimental/index.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

const taskStore = new InMemoryTaskStore();


export const buildServer = () => {
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

  return server;
}
