const AWS = require('aws-sdk');
const response = require('../cfn-response');
const s3 = new AWS.S3();

/**
 * A lambda function for a custom resource that assigns events to the passed S3
 * bucket. This shouldn't be async as the cfn-response module calls constext.done
 */
exports.setupEventHandler = (event, context) => {
  try {
    console.log("Running setup event handler");
    console.debug(JSON.stringify(event));
    const requestType = event.RequestType;
    const bucket = event.ResourceProperties.Bucket;
    const lambdaARN = event.ResourceProperties.LambdaArn;

    if (requestType == 'Delete') {
      console.log("Returning without action due to Delete")
      return response.send(event, context, response.SUCCESS, {});
    }

    params = {
      Bucket: bucket,
      NotificationConfiguration: {
        LambdaFunctionConfigurations: [{
          LambdaFunctionArn: lambdaARN,
          Events: ['s3:ObjectCreated:*']
        }]
      }
    };

    const responseData = {};
    s3.putBucketNotificationConfiguration(params, function (error, data) {
      if (error) {
        console.log("Error creating event");
        console.error(error);
        response.send(event, context, response.FAILED, {});
      } else {
        console.log("Successfully created event");
        response.send(event, context, response.SUCCESS, responseData);
      }
    });
  } catch (error) {
    console.error(error);
    response.send(event, context, response.FAILED, {});
  }
};
