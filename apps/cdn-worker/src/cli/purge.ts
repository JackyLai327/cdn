import { purger } from "../cron/purger.js";
import { logger } from "../../lib/logger.js";

const run = async () => {
  logger.info("Purger: starting schedule loop");
  await purger.run();
}

run().catch(error => {
  logger.error("Purger: error running purge", error);
  process.exit(1);
});
