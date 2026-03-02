import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTaskMessageQueue, InMemoryTaskStore } from "@modelcontextprotocol/sdk/experimental/index.js";
import z from "zod";

const taskStore = new InMemoryTaskStore();

export const buildServer = () => {
  const server = new McpServer(
    {
      name: 'Have fun!',
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

  server.registerTool('say-hello', {
    title: "Say hello",
    description: 'Say hello to the server',
    inputSchema: z.object({
      name: z.string().describe("The name to greet"),
    })

  }, async ({ name }) => {
    const greeting = `Hello ${name}`;
    console.log(greeting);

    return {
      content: [{
        type: "text",
        text: `Greeting to ${name}: done !`
      }]
    }
  });

  server.registerResource("Get the first lines of 'Lorem Ipsum'",
    "lorem://ipsum",
    {
      title: "Get first lines of lorem ipsum",
      description: "Just for fun and returning some data",
      mimeType: "text"
    },
    async () => {
      return {
        contents: [{
          uri: "lorem://ipsum",
          type: "text",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }]
      };
    }
  );

  server.registerPrompt("Ask for something", {
    title: "magicball",
    description: "Suggest a response using the magic ball",
    argsSchema: {
      content: z.string().describe("The question to ask")
    }
  }, ({ content }) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `You are a magic 8 ball. Answer the user question.
The question is : ${content}`
        }
      }
      ]
    }
  });

  return server;
}

