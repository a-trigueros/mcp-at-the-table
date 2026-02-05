import express, { type Request, type Response } from "express";
import cors from "cors";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { server } from "./mcp/server.ts"
import { configureMcpRoutes } from "./mcp/http.ts";


const app = createMcpExpressApp();

// JSON parser middleware must be added before MCP handlers
app.use(express.json());

app.use(cors());
configureMcpRoutes(app, server);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
