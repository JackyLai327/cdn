import sharp from "sharp";
import { IImageProcessor } from "./interfaces/imageProcessor";

export class ImageProcessor implements IImageProcessor {
  async resizeImage(
    buffer: Buffer,
    size: number,
    mimeType: string = "image/jpeg"
  ): Promise<Buffer> {
    const img = sharp(buffer).resize(size, size, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      return img
        .jpeg({
          quality: 88,
          chromaSubsampling: "4:4:4", // No colour degradation
          mozjpeg: true, // Better algorithm
          progressive: true, // Smaller file with better display
        })
        .toBuffer();
    }

    if (mimeType === "image/png") {
      return img
        .png({
          compressionLevel: 6, // Balanced compression
          adaptiveFiltering: true,
        })
        .toBuffer();
    }

    if (mimeType === "image/webp") {
      return img
        .webp({
          quality: 85,
          lossless: false,
        })
        .toBuffer();
    }

    if (mimeType === "image/avif") {
      return img
        .avif({
          quality: 60, // AVIF needs lower number
        })
        .toBuffer();
    }

    // Default: output JPEG as fallback
    return img
      .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toBuffer();
  }
}

export const imageProcessor = new ImageProcessor();
