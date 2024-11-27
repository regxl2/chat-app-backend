# WebSocket Server Setup Guide

## Prerequisites
- Node.js installed
- MongoDB database
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
DATABASE_URL="YOUR_MONGODB_URL"
JWT_SECRET=ENTER_YOUR_JWT_SECRET_KEY
```

Replace the placeholders with your actual:
- MongoDB connection URL
- JWT secret key

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
- Ensure your MongoDB is running and accessible
- The JWT secret should match the one used in the API server
- Verify network and firewall settings allow WebSocket connections