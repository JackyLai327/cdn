import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js"
import morgan, { type StreamOptions } from "morgan";

// Use our winston custom logger instead of console.log
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = config.NODE_ENV || "development";
  return env !== "development";
}

export const httpLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
)
