// Load environment variables FIRST
require("dotenv").config();

// Import app (Express setup)
const app = require("./src/app");

// Import DB connection
const connectDB = require("./src/config/db");

// Connect to MongoDB
connectDB();

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});