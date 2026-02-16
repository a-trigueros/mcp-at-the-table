import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTaskMessageQueue, InMemoryTaskStore } from "@modelcontextprotocol/sdk/experimental/index.js";
import z from "zod";
import { getAvailableFood, addFood, toHumanReadeableText, updateFood, removeFood } from "../fridge/functions.ts";


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
      taskStore,
      taskMessageQueue: new InMemoryTaskMessageQueue()
    }
  );

  server.registerTool('addFood', {
    title: "Add food",
    description: 'Add food to the fridge and make it available to the fridge://food resource',
    inputSchema: z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string().optional(),
      expiresAt: z.string().pipe(z.coerce.date()).optional()
    })
  }, async ({ name, quantity, unit, expiresAt }) => {
    const result = await addFood({
      name,
      quantity,
      unit,
      expiresAt
    });
    return {
      content: [{
        type: "text",
        text: result
      }]
    }
  });

  server.registerTool("updateFood", {
    title: "Update food",
    description: "Update food, set new unit, quantity, and expiration date for a given identifier",
    inputSchema: z.object({
      id: z.uuid(),
      quantity: z.number(),
      unit: z.string().optional(),
      expiresAt: z.string().pipe(z.coerce.date()).optional()
    })
  }, async (item) => {
    const result = await updateFood(item);

    return {
      content: [{
        type: "text",
        text: result
      }]
    }
  });

  server.registerTool("removeFood", {
    title: "Remove food",
    description: "Remove food with a given id from the fridge",
    inputSchema: z.object({
      id: z.uuid(),
    })
  }, async (item) => {
    const result = await removeFood(item);

    return {
      content: [{
        type: "text",
        text: result
      }]
    }
  });

  server.registerResource(
    "list available food",
    "fridge://food",
    {
      title: "List available food",
      description: "List available food in the fridge as well as their expiration date",
      mimeType: "text"
    },
    async () => {

      var food = await getAvailableFood();

      return {
        contents: [{
          uri: "fridge://food",
          type: "text",
          text: food.map(item => `- ${toHumanReadeableText(item)}`).join("\n")
        }]
      };
    }
  );

  return server;
}

