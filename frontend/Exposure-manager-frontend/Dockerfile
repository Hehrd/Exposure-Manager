# Use Alpine-based Node for minimal size
FROM node:20-alpine

WORKDIR /app

# 1) Install deps
COPY package.json package-lock.json ./
RUN npm ci

# 2) Copy your source
COPY . .

# 3) Expose Vite’s default dev port
EXPOSE 5173

# 4) Start the Vite dev server on 0.0.0.0
CMD ["npm", "run", "dev"]
