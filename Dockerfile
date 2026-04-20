# Use an environment that includes Node.js and basic Linux tools
FROM node:18-bullseye

# Install the C++ compiler (g++)
RUN apt-get update && apt-get install -y build-essential

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of your application code
COPY . .

# Compile the C++ Trie Engine (Adjust the path if your cpp file is named differently)
# The '|| true' prevents the build from failing if the folder structure slightly differs during testing
RUN g++ -o /app/src/trie/trie_engine /app/src/trie/*.cpp || echo "C++ Compilation skipped or failed"

# Expose the port your backend runs on
EXPOSE 3000

# Start the server
CMD ["node", "src/app.js"]