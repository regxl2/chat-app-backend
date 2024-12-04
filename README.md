# Chat App Backend

This is the backend for the Chat App, built to handle API requests and real-time WebSocket communication.

## Tech Stack
- **TypeScript**: For type-safe development.
- **Express**: For routing and handling HTTP requests.
- **MongoDB**: As the database to store user data and messages.
- **Redis**: Used as a Pub/Sub system for managing real-time WebSocket connections.
- **WebSocket**: For real-time messaging between users.
- **Nodemailer**: For OTP verification via email.

## Prerequisites
Make sure you have the following installed:
- Node.js
- npm
- MongoDB running locally or remotely
- Redis for Pub/Sub messaging

## Setup without Docker 

### 1. Clone the repository:
```bash
   git clone https://github.com/regxl2/chat-app-backend.git
   cd chat-app-backend
```

### 2. Install dependencies
Navigate to the api-server and websocket-server directories and install dependencies by following given instructions in respective README files.

## Setup with Docker
If you prefer using Docker, follow these instructions to set up the project using docker-compose.

### 1. Prerequisites
Ensure you have Docker and Docker Compose installed. You can download them from:
- Docker
- Docker Compose

### 2. Clone the repository:
```bash
   git clone https://github.com/regxl2/chat-app-backend.git
   cd chat-app-backend
```

### 3. Configure Environment Variables:
Create a `.env` file in the project root with the following contents:
```
GMAIL_USER=ENTER_YOUR_GMAIL_USER
GMAIL_PASS=ENTER_YOUR_GMAIL_PASS
JWT_SECRET=ENTER_YOUR_JWT_SECRET_KEY
```
Replace the placeholders with your actual:
- Gmail credentials
- JWT secret key

### 4. Run the project with Docker Compose:
Use the provided docker-compose.yml file to spin up the services:
```bash
   docker-compose up
```

### 5. Access the services:
   - API server: http://localhost:8080
   - WebSocket server: ws://localhost:3001

### 6. Stopping the services:
To stop the services and remove the containers, use:
```bash
   docker-compose down
```


