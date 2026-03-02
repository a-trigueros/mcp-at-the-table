import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTaskMessageQueue, InMemoryTaskStore } from "@modelcontextprotocol/sdk/experimental/index.js";
import z from "zod";
import { getAvailableFood, addFood, updateFood, removeFood } from "../fridge/functions.ts";


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

  async function askUserForExpirationDate(foodName: string) {
    var response = await server.server.elicitInput({
      mode: 'form',
      message: `Please enter expiration date for ${foodName}`,
      requestedSchema: {
        type: "object",
        properties: {
          expiresAt: {
            type: "string",
            title: "Expiration date",
            description: "Expiration date (yyyy-MM-dd)",
          }
        },
        required: ["expiresAt"]
      }
    });

    const expiresAtStr = response?.content?.expiresAt as string;
    if (response.action === "accept"
      && /\d{4}-\d{1,2}-\d{1,2}/.test(expiresAtStr)) {

      const parsed = new Date(expiresAtStr);
      return parsed;
    }

    return undefined;
  }

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
    }, name => askUserForExpirationDate(name));
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

    const result = await updateFood(item, name => askUserForExpirationDate(name));

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

      var text = await getAvailableFood();

      return {
        contents: [{
          uri: "fridge://food",
          type: "text",
          text
        }]
      };
    }
  );

  server.registerPrompt("Recipes", {
    title: "recipes",
    description: "Suggest recipes based upon fridge content",
    argsSchema: {
      content: z.string().describe("The content to include in the recipe")
    }
  }, ({ content }) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `You're a chef specializing in zero-waste cooking.
Create three recipes that can be made using only the contents of your fridge.
Prioritize the ingredients that expire the soonest.
If a basic ingredient is missing (salt, pepper, oil), assume it's available.
Take into account the user input: ${content}`
        }
      }
      ]
    }
  });

  return server;
}

