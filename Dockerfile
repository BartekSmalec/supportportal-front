# Use the official Node.js 16.x LTS image as the base image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install --force

# Copy the rest of the application code to the working directory
COPY . /app

# Build the Angular application for production
RUN npm run build -- 
# --configuration=production

# Use nginx as the web server to serve the built Angular application
FROM nginx:alpine

# Copy the built Angular application to the default Nginx document root directory
COPY --from=0 /app/dist/supportportal-front /usr/share/nginx/html

# Expose port 80 for the Nginx web server
EXPOSE 80

# Start the Nginx web server
CMD ["nginx", "-g", "daemon off;"]
