# Use the official Node.js image based on Alpine
FROM node:22.9.0-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the dashboard code to the working directory
COPY . .

# Build the application
RUN yarn build

# Start the dashboard
CMD ["yarn", "start"]
