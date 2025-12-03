import sharp from "sharp";
import { IImageProcessor } from "./interfaces/imageProcessor";

export class ImageProcessor implements IImageProcessor {
  async resizeImage(buffer: Buffer, size: number): Promise<Buffer> {
    return sharp(buffer).resize(size).toBuffer();
  }
}

export const imageProcessor = new ImageProcessor();
