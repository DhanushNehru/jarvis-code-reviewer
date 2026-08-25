# Stage 1: Build the React/Vite application
FROM node:22 AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error

# Copy source code
COPY . .

# Pass the backend API URL as an environment variable during the build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the optimized production static files
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine

# Copy our custom Nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run defaults to port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
