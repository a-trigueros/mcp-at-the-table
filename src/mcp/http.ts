import { type Request, type Response, type Express } from "express";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import { getLastEventId, getSessionId, isInitializeRequest } from "./requestUtils.ts";
import { buildTransport, closeAllTransports, getTransport, hasTransport } from "./transportUtils.ts";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";


// Send requests to the MCP
const buildMcpPostHandler = (buildServer: () => McpServer) =>
  async (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    let transport: StreamableHTTPServerTransport | null = null;


    if (hasTransport(sessionId)) {
      transport = getTransport(sessionId!);
    } else if (isInitializeRequest(req)) {
      transport = await buildTransport(buildServer)
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

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await closeAllTransports();
  console.log('Server shutdown complete');
  process.exit(0);
});


export function configureMcpRoutes(app: Express, buildServer: () => McpServer) {
  app.post("/mcp", buildMcpPostHandler(buildServer));
  app.get("/mcp", mcpGetHandler);
  app.delete("/mcp", mcpDeleteHandler);
}
