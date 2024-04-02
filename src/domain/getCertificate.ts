/* eslint-disable  @typescript-eslint/no-unsafe-argument */
import { ServiceException } from '@smithy/smithy-client';
import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyResult } from 'aws-lambda';
import CertificateDetails from '../interfaces/CertificateDetails';
import getObjectFromS3 from '../infrastructure/s3/s3CertService';
import validate from '../utils/certificateValidationService';
import NoBodyError from '../errors/NoBodyError';
import TestNumberError from '../errors/TestNumberError';
import VinError from '../errors/VinError';
import MissingBucketNameError from '../errors/MissingBucketNameError';
import IncorrectFileTypeError from '../errors/IncorrectFileTypeError';
import MissingFolderNameError from '../errors/MissingFolderNameError';

function isAWSError(error: Error | ServiceException): error is ServiceException {
  return Object.prototype.hasOwnProperty.call(error, 'name') as boolean;
}

export default async (
  event: CertificateDetails,
  s3: S3Client,
  bucketName: string | undefined,
  folder: string | undefined,
  currentEnvironment: string | undefined,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!bucketName) {
      throw new MissingBucketNameError();
    }
    if (currentEnvironment !== 'local' && !folder) {
      throw new MissingFolderNameError();
    }

    console.log(`Validating: ${event.testNumber} - ${event.vin}`);
    validate(event);

    const file = await getObjectFromS3(s3, bucketName, folder, event.testNumber, event.vin);
    const response = await file.transformToString('base64');

    const headers = {
      'Content-type': 'application/pdf',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Origin',
      'X-XSS-Protection': '1; mode=block',
    };

    return {
      headers,
      statusCode: 200,
      body: response,
      isBase64Encoded: true,
    };
  } catch (e) {
    let code = 500;
    let message = '';

    // Split into 50x and 40x errors.
    if (e instanceof NoBodyError || e instanceof MissingBucketNameError || e instanceof MissingFolderNameError) {
      message = e.message;
    }

    if (e instanceof VinError || e instanceof TestNumberError) {
      code = 400;
      message = e.message;
    }

    if (e instanceof IncorrectFileTypeError) {
      code = 404;
      message = e.message;
    }

    if (isAWSError(e)) {
      // S3 error that the key does not exist
      if (['NoSuchKey'].includes(e.name)) {
        code = 404;
      }

      // Any other AWS errors we get will always be a 500 because it will be an error on our part.
      message = e.name;
    }

    console.error(code);
    console.error(message);

    return {
      statusCode: code,
      body: message,
    };
  }
};
