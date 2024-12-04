FROM node:20-alpine
WORKDIR /app
COPY package* .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/index.js"]


