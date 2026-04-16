defmodule PhoenixMcp.MCP.Server do
  use Hermes.Server,
    name: "phoenix-mcp",
    version: "1.0.0",
    capabilities: [:tools]

  component(PhoenixMcp.MCP.Greeter)
end
