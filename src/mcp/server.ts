import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTaskMessageQueue, InMemoryTaskStore } from "@modelcontextprotocol/sdk/experimental/index.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";
import { getAvailableFood } from "../fridge/functions.ts";

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

  server.registerResource(
    "list available food",
    "fridge://food",
    {
      title: "List available food",
      description: "List available food in the fridge as well as their expiration date",
      mimeType: "application/json"
    },
    async () => {

      var food = await getAvailableFood();

      return {
        contents: [{
          uri: "fridge://food",
          type: "text",
          text: JSON.stringify(food)
        }]
      };
    }
  );

  return server;
}
