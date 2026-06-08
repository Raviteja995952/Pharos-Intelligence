# Pharos Risk Intelligence Agent

An AI-powered risk analysis platform for the Pharos blockchain. It analyzes wallets, tokens, contracts, and transactions, and generates intelligent risk assessment reports using OpenAI's GPT models and EVM-compatible tooling.

## Features

- **Wallet Analyzer:** Evaluates transaction history, age, interaction patterns, and large transfers to generate a Trust Score.
- **Token Analyzer:** Assesses holder concentration, liquidity, and trading activity to determine token health.
- **Contract Analyzer:** Checks verification status, ownership, upgradeability, and admin privileges for security risks.
- **Transaction Analyzer:** Analyzes value transferred and contract interactions to identify unusual behavior.
- **AI Intelligence Layer:** Uses OpenAI to interpret raw blockchain data and generate simple, human-readable risk reports with clear recommendations.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript, Viem, OpenAI
- **Infrastructure:** Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- OpenAI API Key

### Environment Setup

1. In the `backend` directory, create a `.env` file (or copy the example):
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PHAROS_RPC_URL=https://rpc.pharos.xyz
   PORT=3001
   ```

2. (Optional) In the `frontend` directory, create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Running with Docker

You can easily spin up the full stack using Docker Compose:

```bash
docker-compose up --build
```
- Frontend will be available at: http://localhost:4173
- Backend will be available at: http://localhost:3001

### Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture Notes

- **Mocked Data:** Currently, some blockchain interactions (like historical transaction counts or token holder concentrations) are simulated using `Math.random()` in `blockchainService.ts` because accessing deep historical data requires a dedicated indexer (like PharosScan API) which wasn't fully integrated yet.
- **Risk Engine:** The precise scoring rules are implemented in `src/services/riskEngine.ts`.
