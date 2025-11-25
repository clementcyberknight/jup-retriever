# Jup Retriever

## Overview

Jup Retriever is a Node.js application that fetches token information from the Jup API. It provides a simple API to retrieve details about various tokens on the Solana blockchain.

To prevent hitting API rate limits, the application implements a **request queuing system**. Instead of rejecting requests when limits are reached, it queues them and processes one request per second, ensuring reliable delivery for all inquiries.

Bro i just Built this for an AI Agent and to avoid rate limiting in otaku ai

## Project Structure

```
jup-retriever
├── src
│   ├── index.js          # Entry point of the application
│   ├── config
│   │   └── constants.js  # Constant values used throughout the application
│   ├── services
│   │   └── jupService.js # Service to fetch token information from Jup API
│   ├── routes
│   │   └── tokenRoutes.js # API routes for fetching token information
│   └── utils
│       ├── errorHandler.js # Error handling middleware
│       └── requestQueue.js # Request queuing utility
├── package.json          # NPM configuration file
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd jup-retriever
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

## Usage

### Fetch Token Information

To fetch information about a specific token, send a GET request to the following endpoint:

```
GET /api/tokens?query=<TOKEN_MINT_ADDRESS>
```

Replace `<TOKEN_MINT_ADDRESS>` with the mint address of the token you want to retrieve information for.

### Example

```bash
curl "http://localhost:3000/api/tokens?query=So11111111111111111111111111111111111111112"
```

## License

This project is licensed under the MIT License.
