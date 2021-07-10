# Installing Attachment Scanner S3 Serverless

Automatically scan an S3 bucket for Viruses, Malware and other malicious files.

The application is called `attachment-scanner-s3-serverless` in the AWS
Serverless Application Repository.

1. Head to www.attachmentscanner.com and get an API key to use.
2. Install the application (https://console.aws.amazon.com/serverlessrepo#/available-applications)
    * Add your API token (`AttachmentScannerAPIToken`)
    * Add the name of your S3 Bucket (`AppBucketName`)
    * Select the desired action to take if malware is found (`AttachmentScannerAction`)
        (see actions below).

That's it. Now when files are created in the bucket they will be scanned.

## Actions

During installation, you can choose an action from the following:

| Action    | Description |
|-----------|-------------|
| `LOG`     | The default action. No action occurs when malware is found. Results are logged to AWS CloudWatch.
| `TAG`     | Tags objects in S3 with scan results (`as-scan-id` & `as-scan-status`).
| `DELETE`  | Any malicious files are automatically deleted from the S3 Bucket.


[AttachmentScanner]: https://www.attachmentscanner.com
