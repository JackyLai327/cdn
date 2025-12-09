import hpp from "hpp";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import compression from "compression";
import { logger } from "./lib/logger.js";
import { config } from "./config/index.js";
import filesRoutes from "./routes/files.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { limiter } from "./middlewares/rateLimiter.js";
import devAuthRoutes from "./routes/auth.routes.js";
import { authMiddleware } from "./middlewares/auth.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

const app: express.Application = express();

// Middlewares

// Security and Core
app.use(helmet());
app.use(cors({
  origin: config.NODE_ENV === "production" ? "https://app.easy-cdn.com" : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(compression());

// Logging and Tagging
app.use(httpLogger)
app.use((req, res, next) => {
  const id = uuidv4();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
})

// Traffic Control
app.use(limiter);

// Parsing and Sanitization
app.use(express.json({ limit: "10mb" }));
app.use(hpp());

// Routes (no auth required)
app.use("/api/auth", devAuthRoutes);

// Auth Middleware
app.use(authMiddleware);

// Routes (auth required)
app.use("/api", healthRoutes);
app.use("/api/files", filesRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = Number(config.APP_PORT) || 3000

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`, {
    env: config.NODE_ENV
  });
});
