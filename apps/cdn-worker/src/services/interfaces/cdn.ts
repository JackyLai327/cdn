export interface ICDNService {
  /**
   * Invalidates the given paths in the CDN
   * @param paths Array of paths to invalidate
   */
  invalidatePaths(paths: string[]): Promise<void>
}
