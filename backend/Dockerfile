# Upgrade the base image to a version that ships with Node 22+ natively
FROM ghcr.io/puppeteer/puppeteer:23.10.1

# Switch to root to configure permissions
USER root

WORKDIR /app

# Set Puppeteer cache directory to project folder
ENV PUPPETEER_CACHE_DIR=/app/.cache

# Copy package files
COPY package*.json ./

# Install packages (ignoring scripts during dependency download to keep cache clean)
RUN npm ci --only=production --ignore-scripts

# Copy application files
COPY . .


# Adjust permissions for Puppeteer's default running user
RUN chown -R pptruser:pptruser /app

# Switch back to Puppeteer user for secure execution
USER pptruser

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
