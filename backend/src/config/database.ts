import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log("✓ Connected to MongoDB");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    return mongoose.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("Failed to disconnect from MongoDB:", error);
  }
}
