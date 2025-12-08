# Hickups and Debugs

## File not found but file exists in the the bucket

### Debug (File Not Found)

1. Check file actually exists (not just the metadata)
2. Check path names
3. Check metadata matches file
4. Check container communication
   (Host machine uses localhost but containers use container_names to communicate to each other)

### Fix (File Not Found)

- MinIo sits on port 9000
- Worker was using localhost:9090 to search for files in MinIO
- Fixed by using minio:9000

## Requesting file from MinIO through Nginx got 403 Forbidden

### Debug (403 Forbidden)

1. Check Nginx configuration
2. Check MinIO configuration
3. Check file permissions

### Fix (403 Forbidden)

1. Bucket was private by default
2. Needed to set bucket to public (not though UI)
3. Run interactive shell in MinIO container with MinIO Client
    `docker run -it --entrypoint /bin/sh --network=local_default minio/mc`
4. Configure alias
    `mc alias set local http://minio:9000 minio minio123`
5. Apply bucket policy
    `mc anonymous set download local/cdn-processed`

## Files kept being downloaded automatically instead of displaying in browser when cdn URL is opened in browser

### Debug (Files kept being downloaded automatically instead of displaying in browser when cdn URL is opened in browser)

1. Check headers of response
2. Check Content-Type header
3. Check Content-Disposition header

### Fix (Files kept being downloaded automatically instead of displaying in browser when cdn URL is opened in browser)

1. Content header (after process) is not correctly set
2. Undefined content-header confuses browser
