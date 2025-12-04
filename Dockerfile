# -----------------------------------------------------------------------------
# STAGE 1: Build the React Application
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files and config
COPY package.json package-lock.json ./
# CRITICAL: Copy .npmrc so npm can authenticate with the Tiptap registry
COPY .npmrc ./

# 2. Install dependencies
# Using 'npm ci' is faster and more reliable for builds than 'npm install'
RUN npm ci

# 3. Copy the rest of the application code
COPY . .

# 4. Build arguments
# These allow you to pass environment variables during the build process
ARG VITE_SUPABASE_PROJECT_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SCRIPTS_API_URL

# 5. Set environment variables for the build
ENV VITE_SUPABASE_PROJECT_URL=$VITE_SUPABASE_PROJECT_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SCRIPTS_API_URL=$VITE_SCRIPTS_API_URL

# 6. Build the application (Generates /dist folder)
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: Serve with Nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine

# 1. Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy the built React app from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 4. Expose port 80
EXPOSE 80

# 5. Start Nginx
CMD ["nginx", "-g", "daemon off;"]