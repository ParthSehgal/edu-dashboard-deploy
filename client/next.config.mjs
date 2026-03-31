import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let backendPort = '5000'; // Default fallback

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const portMatch = envContent.match(/^PORT\s*=\s*([0-9]+)/m);
    if (portMatch && portMatch[1]) {
      backendPort = portMatch[1];
    }
  }
} catch (error) {
  console.warn('Could not read parent .env file');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: `http://localhost:${backendPort}/api`,
    NEXT_PUBLIC_BACKEND_PORT: backendPort
  }
};

export default nextConfig;
