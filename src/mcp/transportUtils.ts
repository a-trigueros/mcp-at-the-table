import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { randomUUID } from "crypto";

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

export function hasTransport(sessionId: string | null) {
  return !!(sessionId && transports[sessionId]);
}

export function getTransport(sessionId: string) {
  return transports[sessionId]!;
}

export async function buildTransport(server: McpServer) {

  const eventStore = new InMemoryEventStore();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    eventStore, // Enable resumability
    onsessioninitialized: sessionId => {
      // Store the transport by session ID when session is initialized
      // This avoids race conditions where requests might come in before the session is stored console.log(`Session initialized with ID: ${sessionId}`);
      transports[sessionId] = transport;
    }
  });

  transport.onclose = () => {
    const sid = transport.sessionId;
    if (sid && transports[sid]) {
      console.log(`Transport closed for session ${sid}, removing from transports map`);
      delete transports[sid];
    }
  }


  await server.connect(transport as Transport);

  return transport;
}

export async function closeAllTransports() {

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId]!.close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
}

