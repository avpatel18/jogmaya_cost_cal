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
# Copy only manifests for better caching
COPY package.json yarn.lock .yarnrc.yml ./

# Copy prisma schema so postinstall generation works
COPY prisma ./prisma/

# Install dependencies immutably
# We do NOT disable scripts because esbuild and prisma need them
RUN yarn install --no-immutable # Allow yarn.lock to be updated if out of sync, resolving YN0028 error

# Copy application source
COPY . .

# Build the Next.js app
RUN yarn build

# Expose and launch
EXPOSE 3000
CMD ["yarn", "start"]
