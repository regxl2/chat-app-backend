# API Server Setup Guide

## Prerequisites
- Node.js installed
- MongoDB database
- Gmail account (for email services)
- Redis

## Installation Steps

### 1. Navigate to the Project Directory
```bash
cd api-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root with the following contents:
```
API_SERVER_PORT=YOUR_PORT_NUMBER
DATABASE_URL=YOUR_MONGODB_URL
GMAIL_USER=ENTER_YOUR_GMAIL_USER
GMAIL_PASS=ENTER_YOUR_GMAIL_PASS
JWT_SECRET=ENTER_YOUR_JWT_SECRET_KEY
```

Replace the placeholders with your actual:
- Port number
- MongoDB connection URL
- Gmail credentials
- JWT secret key

### 4. Build the Project
Compile TypeScript files:
```bash
npx tsc -b
```

### 5. Start the Server
```bash
node dist/index.js
```

## Configuration Notes
- Ensure your MongoDB is running and accessible
- The JWT secret should be a long, random string
- Gmail credentials are used for sending emails