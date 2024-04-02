import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import IncorrectFileTypeError from '../../errors/IncorrectFileTypeError';
import NoBodyError from '../../errors/NoBodyError';

export default async (
  s3: S3Client,
  bucket: string,
  folder: string | undefined,
  fileName: string,
): Promise<StreamingBlobPayloadOutputTypes> => {
  const key = folder ? `${folder}/${fileName}.pdf` : `${fileName}.pdf`;

  console.info(`Bucket name: ${bucket}`);
  console.info(`Item key: ${key}`);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);

  if (response.ContentType !== 'application/octet-stream' && response.ContentType !== 'application/pdf') {
    console.error(`Incorrect content-type: ${response.ContentType}`);
    throw new IncorrectFileTypeError();
  }

  if (response.Body) {
    return response.Body;
  }

  throw new NoBodyError();
};
