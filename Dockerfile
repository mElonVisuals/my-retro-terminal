# Build stage
FROM node:18-alpine as builder
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --production --frozen-lockfile

# Copy and build application
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.23-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Set environment variables for domain
ENV VIRTUAL_HOST=retrosh.melonvisuals.me \
    LETSENCRYPT_HOST=retrosh.melonvisuals.me \
    LETSENCRYPT_EMAIL=your_email@example.com \
    NODE_ENV=production

# Set permissions and create necessary directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]