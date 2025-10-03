# Use Debian-based Node 20 to satisfy engines and native deps
FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Set envs
ENV NODE_ENV=production
ENV PORT=3000

# Enable Corepack to manage Yarn version from package.json:packageManager
RUN corepack enable

# Copy only manifests for better caching
COPY package.json yarn.lock .yarnrc.yml ./

# Avoid running lifecycle scripts (e.g., prisma generate) before sources are copied
ENV YARN_ENABLE_SCRIPTS=false

# Install dependencies immutably
RUN yarn install --immutable --check-cache

# Copy application source
COPY . .

# Re-enable scripts and run postinstall now that schema and sources are present
ENV YARN_ENABLE_SCRIPTS=true
RUN yarn postinstall

# Build the Next.js app
RUN yarn build

# Expose and launch
EXPOSE 3000
CMD ["yarn", "start"]
