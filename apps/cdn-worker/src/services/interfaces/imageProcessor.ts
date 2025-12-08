export interface IImageProcessor {
  /**
   * Resize an image
   * @param buffer
   * @param size
   * @param mimeType? (image/jpeg, image/png, image/webp, image/avif)
   */
  resizeImage(buffer: Buffer, size: number, mimeType?: string): Promise<Buffer>
}
