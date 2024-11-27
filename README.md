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

## Setup

### 1. Clone the repository:
```bash
git clone https://github.com/regxl2/chat-app-backend.git
cd chat-app-backend