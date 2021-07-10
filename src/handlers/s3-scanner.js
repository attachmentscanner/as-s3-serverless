const AWS = require('aws-sdk');
const axios = require('axios').default;
const s3 = new AWS.S3();

/**
 * A Lambda function that gets a signed URL for the new item
 */
exports.s3AttachmentScannerHandler = async (event, context) => {
  const keys = event.Records.map(handleRecord);

  return Promise.all(keys).then(() => {
    console.debug('Complete');
  });
};

/**
 * Process a single record entry in the event, scans the requested file and makes
 * the call to process the result of the scan.
 * @param {any} record The event record from the S3 event
 */
const handleRecord = async (record) => {
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;
  const params = { Bucket: bucket, Key: key, Expires: 60 };
  const url = await s3.getSignedUrlPromise('getObject', params);

  console.debug('The URL is', url);

  const host = process.env.AS_SCAN_URL || "https://us-east-1.attachmentscanner.com/v0.1/scans";
  const res = await axios.post(host,
    { url: url }, {
      headers: {
        Authorization: `Bearer ${process.env.AS_TOKEN}`
      }
  });

  console.log(`Status: ${res.status}`);
  console.log(`Data: ${JSON.stringify(res.data)}`);

  return performAction(bucket, key, res.data);
};

/**
 * Performs the action on the given bucket and key given the AttachmentScanner
 * response and status.
 * @param {string} bucket
 * @param {string} key the item key
 * @param {object} response The AttachmentScanner HTTP response
 */
const performAction = async (bucket, key, response) => {
  const status = response.status;
  const matches = response.matches;
  const scanID = response.id;
  const action = process.env.AS_ACTION;

  console.log(`${bucket}/${key}: action: ${action} ${status} (${JSON.stringify(matches)})`);

  switch (action) {
    case "DELETE":
      return deleteFile(bucket, key, status);
    case "TAG":
      return tagObject(bucket, key, scanID, status);
    default:
      console.log(`No Action taken (${action})`);
      return;
  }
};

/**
 * Deletes the given file from AWS following a found scan status
 * @param {string} bucket The AWS Bucket name
 * @param {string} key The AWS key
 * @param {string} status The AttachmentScanner status
 */
const deleteFile = async (bucket, key, status) => {
  if (status == 'found') {
    const params = { Bucket: bucket, Key: key };
    console.log(`DELETE ${bucket}/${key}`);
    const deleted = await s3.deleteObject(params).promise();
    return deleted;
  }

  console.log('Status not `found` so no action');
  return;
};

/**
 * Tags the given file with scan results
 * @param {string} bucket The AWS Bucket name
 * @param {string} key The AWS key
 * @param {string} scanID The AttachmentScanner Scan ID
 * @param {string} status The AttachmentScanner status
 */
const tagObject = async (bucket, key, scanID, status) => {
  const existing = await s3.getObjectTagging({ Bucket: bucket, Key: key }).promise();
  console.log(`Current Tags: ${JSON.stringify(existing)}`);

  const tags = existing || { TagSet: [] };
  tags.TagSet.push(
    { Key: 'as-scan-id', Value: scanID },
    { Key: 'as-scan-status', Value: status }
  );

  const result = await s3.putObjectTagging({
    Bucket: bucket, Key: key, Tagging: tags
  }).promise();

  console.log(`Tagged: ${JSON.stringify(tags)}: ${JSON.stringify(result)}`);
  return result;
};
