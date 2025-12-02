import winston from "winston";
import { config } from "../config/index.js";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colours = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colours);

const format = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
  }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
      return `${timestamp} ${level}: ${message} ${metaString}`;
    }
  )
);

const transports = [
  new winston.transports.Console({
    format: config.NODE_ENV === "production"
      ? winston.format.json()
      : format
  })
]

export const logger = winston.createLogger({
  level: config.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format,
  transports,
})
