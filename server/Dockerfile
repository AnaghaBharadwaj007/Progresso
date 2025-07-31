# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./


# Install production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . ./

# Expose the port your Express app listens on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]