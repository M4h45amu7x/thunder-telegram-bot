# Use the official Bun image
FROM oven/bun:1.1.30

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lockb files to the working directory
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN bun run build

# Expose the port on which the app will run
EXPOSE 8080

# Start the application
CMD ["bun", "run", "start"]
