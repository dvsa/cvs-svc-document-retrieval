import { S3 } from 'aws-sdk';
import NoBodyError from '../../errors/NoBodyError';

export default async (
  s3: S3,
  bucket: string,
  folder: string | undefined,
  adrDocumentId: string,
): Promise<S3.Body> => {
  const key = folder ? `${folder}/adr-documents/${adrDocumentId}.zip` : `/adr-documents/${adrDocumentId}.zip`;

  console.info(`Bucket name: ${bucket}`);
  console.info(`Item key: ${key}`);

  const params = { Bucket: bucket, Key: key };
  const response = await s3.getSignedUrlPromise('getObject', params);

  if (response) {
    return response;
  }

  throw new NoBodyError();
};
