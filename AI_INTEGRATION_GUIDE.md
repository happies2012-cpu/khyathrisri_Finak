# AI Integration Guide

This project now includes integrated support for OpenAI, Google Gemini, and Local LLMs (via Ollama), as well as a Model Context Protocol (MCP) server foundation.

## 1. Setup

### Environment Variables
Open your `.env` file and fill in the following keys:

```bash
# AI Configuration
OPENAI_API_KEY=sk-...                # Your OpenAI API Key
GEMINI_API_KEY=AIza...               # Your Google Gemini API Key
LOCAL_LLM_URL=http://localhost:11434 # URL for your local Ollama instance
```

### Local LLM (Ollama)
If you want to use the local LLM integration:
1.  Install [Ollama](https://ollama.com/).
2.  Run a model, for example `llama3`:
    ```bash
    ollama run llama3
    ```
3.  Ensure it is running on the default port `11434`.

## 2. API Usage

All AI endpoints require authentication (Bearer Token).

### OpenAI Chat
**Endpoint:** `POST /api/ai/openai/chat`

```bash
curl -X POST http://localhost:3001/api/ai/openai/chat \
  -H "Authorization: Bearer YOUR_jwt_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain web hosting in one sentence.",
    "model": "gpt-4-turbo-preview"
  }'
```

### Gemini Chat
**Endpoint:** `POST /api/ai/gemini/chat`

```bash
curl -X POST http://localhost:3001/api/ai/gemini/chat \
  -H "Authorization: Bearer YOUR_jwt_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the benefits of VPS?",
    "model": "gemini-pro"
  }'
```

### Local LLM Chat
**Endpoint:** `POST /api/ai/local/chat`

```bash
curl -X POST http://localhost:3001/api/ai/local/chat \
  -H "Authorization: Bearer YOUR_jwt_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a python script to check disk usage.",
    "model": "llama3"
  }'
```

## 3. MCP Server (Model Context Protocol)

The project includes an MCP server implementation that allows AI agents to interact with the platform's tools (e.g., checking domains, listing accounts).

### Running the MCP Server
To start the MCP server in standalone mode (typically used by an agent connecting via stdio):

```bash
npx tsx server/services/ai/mcp.ts
```

### Capabilities
Currently implemented tools:
*   `get_hosting_accounts`: Lists hosting accounts for a user.
*   `check_domain_availability`: Checks if a domain is available.

You can extend `server/services/ai/mcp.ts` to add more tools that interact with your database using the shared `prisma` instance.
