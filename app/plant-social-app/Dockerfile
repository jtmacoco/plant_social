# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Expo
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Expo dev server ports
# 8081 - Metro bundler
# 19000 - Expo dev tools
# 19006 - Expo web
EXPOSE 8081 19000 19006

# Set environment variable to allow connections from any host
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start the Expo development server
#CMD ["npm", "start"]
CMD ["npx", "expo", "start", "--lan"]