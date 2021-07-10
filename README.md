# Attachment Scanner S3 Serverless

This repo provides an application written using the AWS Server Application
Model (SAM) that automatically scans the provided S3 bucket for viruses and
malware whenever a file is uploaded (s3:ObjectCreated:*) with zero code.

The core of the application is a Javascript
[Lambda function](./src/handlers/s3-scanner.js) that makes:
  * a call to [AttachmentScanner](https://www.attachmentscanner.com)
  * scans the uploaded file for Viruses and Malware;
  * and then takes the appropriate action based on the result of the scan.

## Installing the Application / Function

The `attachment-scanner-s3-serverless` application can be installed from
the AWS Serverless Application Repository. Make sure to check
*'Show apps that create custom IAM roles or resource policies'* as the
application requires IAM Permissions to access S3 and invoke the function.

Take a look at the [Installation](./installation.md) file to install the
application in your AWS account and scan your S3 bucket with zero code.

## Working with the code

If you've checked out the git repository you can use the following to build
and invoke the S3ScanFunction locally:

```shell
sam build --use-container
sam local invoke S3ScanFunction --event ./events/event-s3.json --profile PROFILE --parameter-overrides AttachmentScannerAPIToken=TOKEN AttachmentScannerAction=LOG
```
