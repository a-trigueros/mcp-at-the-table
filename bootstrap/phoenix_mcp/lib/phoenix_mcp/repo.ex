defmodule PhoenixMcp.Repo do
  use Ecto.Repo,
    otp_app: :phoenix_mcp,
    adapter: Ecto.Adapters.SQLite3
end
