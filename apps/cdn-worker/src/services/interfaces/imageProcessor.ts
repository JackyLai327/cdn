export interface IImageProcessor {
  /**
   * Resize an image
   * @param buffer
   * @param size
   */
  resizeImage(buffer: Buffer, size: number): Promise<Buffer>
}
