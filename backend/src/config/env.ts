import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/crm_extractor",
  googleApiKey: process.env.GOOGLE_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  isDevelopment: process.env.NODE_ENV !== "production",
};

if (!config.googleApiKey) {
  console.warn(
    "WARNING: GOOGLE_API_KEY is not set. AI extraction will not work."
  );
}
