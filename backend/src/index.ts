import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import apiRoutes from "./routes/api-routes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API Routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "CRM Extractor API",
    version: "1.0.0",
    status: "running",
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${config.nodeEnv}`);
  console.log(`✓ CORS Origin: ${config.corsOrigin}\n`);
});

export default app;
