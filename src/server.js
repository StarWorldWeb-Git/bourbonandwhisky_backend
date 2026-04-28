import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "../lib/prisma.js";

async function startServer() {
  try {
   
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected successfully");

    const app = createApp();

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Database connection error: Could not connect to MySQL/MariaDB. Please ensure XAMPP MySQL is running.");
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

startServer();
