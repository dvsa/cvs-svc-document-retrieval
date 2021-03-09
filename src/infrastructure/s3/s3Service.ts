import { S3 } from 'aws-sdk';
import IncorrectFileTypeError from '../../errors/IncorrectFileTypeError';
import NoBodyError from '../../errors/NoBodyError';

export default async (s3: S3, bucket: string, certId: string, vin: string): Promise<string> => {
  const response = await s3
    .getObject({
      Bucket: bucket,
      Key: `${certId}_${vin}`,
    })
    .promise();

  if (response.ContentType !== 'application/pdf') {
    throw new IncorrectFileTypeError();
  }

  if (response.Body) {
    return response.Body.toString();
  }

  throw new NoBodyError();
};
