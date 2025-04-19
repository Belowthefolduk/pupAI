# Use the official Node.js 18 image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm-dev \
    libgtk-3-0 \
    && apt-get clean

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]
