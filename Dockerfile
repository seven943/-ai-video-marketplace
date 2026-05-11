FROM node:18-alpine

WORKDIR /app

# Copy root package files and workspace package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all workspace dependencies
RUN npm ci

# Copy prisma schema and generate client
COPY backend/prisma ./backend/prisma/
RUN cd backend && npx prisma generate

# Copy backend source
COPY backend ./backend/

RUN cd backend && npm run build

EXPOSE 3001

CMD ["node", "backend/dist/main.js"]
