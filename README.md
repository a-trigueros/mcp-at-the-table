# what is it in there


- bootstrap: minimal examples of mcp-server
- demo: toy mcp-server for managing your fridge content



# Usefull links:

* https://github.com/aaif-goose/goose


# mcp dev tool (inspector)

doc here: https://modelcontextprotocol.io/docs/tools/inspector

```
npx @modelcontextprotocol/inspector

# with preconfigured mcp url:

npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3000/mcp
```

# start fridge-toy mcp server

```sh
cd demo/typescript
npm run dev
```

mcp server starts on port 3000


# register mcp server with claude

```sh
claude mcp  add --transport http frigo http://localhost:3000/mcp

# remove it
claude mcp remove frigo
```

