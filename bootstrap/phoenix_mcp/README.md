# what is this

It’s a  bootstrap demo server for mcp in elixir/phoenix

# bootstrap

install elixir and phoenix: https://hexdocs.pm/phoenix/swapping_databases.html#using-phx-new

The project has been bootstraped using sqlite3 database.

```sh
mix deps.get
mix phx.server
# starts the server on localhost:4000

# test it mith modelcontextprotocol/inspector
 npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:4000/mcp

# register it into claude

claude mcp  add --transport http phoenix_mcp http://localhost:4000/mcp

# remove it
claude mcp remove phoenix_mcp

```


# PhoenixMcp

To start your Phoenix server:

* Run `mix setup` to install and setup dependencies
* Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

* Official website: https://www.phoenixframework.org/
* Guides: https://hexdocs.pm/phoenix/overview.html
* Docs: https://hexdocs.pm/phoenix
* Forum: https://elixirforum.com/c/phoenix-forum
* Source: https://github.com/phoenixframework/phoenix
