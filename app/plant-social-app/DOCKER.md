## Docker Setup for Plant Social App

### What Docker Does for This Project

The Docker configuration containerizes your Expo React Native app, including:
- **Node.js 20 Alpine**: A lightweight Linux environment with Node.js pre-installed
- **Dependencies**: All npm packages are installed inside the container
- **Development Server**: Runs the Expo development server with Metro bundler
- **Port Mapping**: Exposes ports for local access to the dev server and web interface

### Files Created

1. **Dockerfile** - Defines how to build the container image
2. **.dockerignore** - Specifies files to exclude from the container (node_modules, logs, etc.)
3. **docker-compose.yml** - Orchestrates the container with convenient settings for development

---

## How to Run with Docker

### Prerequisites

Make sure you have Docker and Docker Desktop installed:
- [Download Docker Desktop](https://www.docker.com/products/docker-desktop)

### Method 1: Using Docker Compose (Recommended)

Docker Compose simplifies running the container with pre-configured settings.

```bash
cd /Users/dhananjaysurti/hackathon/plant_social/app/plant-social-app

# Build and start the container
docker-compose up

# To start in background mode
docker-compose up -d

# To stop the container
docker-compose down
```

**What happens:**
- Docker builds the image from the Dockerfile
- Starts a container with volume mounting for live code reloading
- Exposes all necessary ports
- Runs the Expo dev server inside the container

### Method 2: Using Docker Directly

If you prefer more control, build and run manually:

```bash
# Build the Docker image
docker build -t plant-social-app .

# Run the container
docker run -p 8081:8081 -p 19000:19000 -p 19006:19006 \
  -v $(pwd):/app \
  -v /app/node_modules \
  plant-social-app
```

---

## Accessing Your App

Once the container is running, you can access your app through different interfaces:

| Interface | URL | Purpose |
|-----------|-----|---------|
| **Web** | http://localhost:19006 | Access your app in a web browser |
| **Expo Dev Tools** | http://localhost:19000 | Manage dev client and remote debugging |
| **Metro Bundler** | http://localhost:8081 | JavaScript bundler (backend service) |

### Live Reloading

The container includes **volume mounting**, which means:
- Any changes you make to files on your local machine are automatically reflected in the container
- You don't need to rebuild the image or restart the container to see code changes
- Just refresh the browser to see updates

---

## Container Details

### What Runs Inside

```dockerfile
FROM node:20-alpine          # Lightweight Linux + Node.js
WORKDIR /app                 # Sets working directory
npm install                  # Installs all dependencies
npm start                    # Runs: expo start (development server)
```

### Port Mapping

- **8081** - Metro bundler (JavaScript bundler for React Native)
- **19000** - Expo dev client and management tools
- **19006** - Expo web development server

### Environment Variables

- `EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0` - Allows external connections to the dev server
- `REACT_NATIVE_PACKAGER_HOSTNAME=localhost` - Network configuration

---

## Common Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View Docker images
docker images

# Stop a running container
docker stop <container_id>

# Remove a container
docker rm <container_id>

# View container logs
docker logs <container_id>

# View live container logs
docker logs -f <container_id>

# Remove unused images and containers
docker system prune
```

---

## Troubleshooting

### Port Already in Use

If you get an error like "bind: address already in use", another service is using the port:

```bash
# Find what's using the port (example for 19006)
lsof -i :19006

# Kill the process
kill -9 <PID>

# Or use a different port
docker run -p 8081:8081 -p 19000:19000 -p 19007:19006 plant-social-app
```

### Clearing Docker Cache

To rebuild without cache:

```bash
docker build --no-cache -t plant-social-app .
```

### Checking Container Logs

```bash
docker logs -f <container_id>
```

This shows real-time output from the Expo dev server.

---

## Development Workflow

1. **Start the container**:
   ```bash
   docker-compose up
   ```

2. **Open your browser** to http://localhost:19006

3. **Edit your code** in your editor (files automatically sync)

4. **Save your changes** - the app hot-reloads in the browser

5. **Stop when done**:
   ```bash
   docker-compose down
   ```

---

## Production Considerations

The current Dockerfile is optimized for **development**. For production, you would:
- Use a build stage to minimize image size
- Remove development dependencies
- Serve the app through a reverse proxy (Nginx)
- Use environment-specific configurations

For production deployments, consider using a multi-stage build that outputs a static web build instead of running the dev server.
