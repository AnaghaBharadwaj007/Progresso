# Stage 1: Build the React application
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./

# Build the React app for production
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle client-side routing and proxy backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]