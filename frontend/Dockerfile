# Step 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code and build it
COPY . .
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the compiled static files from the build stage to Nginx's public folder
# Note: If you are using Vite, change "build" to "dist" below
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration to handle React routing and backend API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for public access
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]