# WebSocket Server Setup Guide

## Prerequisites
- Node.js installed
- Redis

## Installation Steps

### 1. Navigate to the Project Directory
```bash
cd websocket-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root with the following contents:
```
WEBSOCKET_PORT="YOUR_PORT"
```

Replace the placeholders with your actual:
- Port number

### 4. Build the Project
Compile TypeScript files:
```bash
npx tsc -b
```

### 5. Start the WebSocket Server
```bash
node dist/index.js
```

## Configuration Notes
- Verify network and firewall settings allow WebSocket connections