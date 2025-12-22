import { randomUUID } from "crypto";
import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js";
import { ICDNService } from "./interfaces/cdn.js";
import { measureCloudFrontDuration } from "./metrics.js";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const client = new CloudFrontClient({
  region: config.AWS_REGION || "ap-southeast-2",
});

export class CDNService implements ICDNService {
  async invalidatePaths(paths: string[]): Promise<void> {
    if (!config.ENABLE_CLOUDFRONT_INVALIDATION) {
      logger.debug(
        `CloudFront invalidation is disabled, skipping invalidation of ${paths.length} paths`
      );
      return;
    }

    if (!config.CLOUDFRONT_DISTRIBUTION_ID) {
      logger.warn(
        `CloudFront distribution ID is not configured, skipping invalidation of ${paths.length} paths`
      );
      return;
    }

    if (paths.length === 0) return;

    const result = await measureCloudFrontDuration(
      "invalidatePaths",
      async () => {
        const callerReference = randomUUID();

        const command = new CreateInvalidationCommand({
          DistributionId: config.CLOUDFRONT_DISTRIBUTION_ID,
          InvalidationBatch: {
            CallerReference: callerReference,
            Paths: {
              Quantity: paths.length,
              Items: paths,
            },
          },
        });

        const result = await client.send(command);
        logger.info(
          `CloudFront invalidation requested: ${JSON.stringify(result)}`
        );
      }
    );

    return result;
  }
}

export const cdnService = new CDNService();
