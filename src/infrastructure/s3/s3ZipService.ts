import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import NoBodyError from '../../errors/NoBodyError';

export default async (
  s3: S3Client,
  bucket: string,
  folder: string | undefined,
  adrDocumentId: string,
): Promise<string> => {
  const key = folder ? `${folder}/adr-documents/${adrDocumentId}.zip` : `adr-documents/${adrDocumentId}.zip`;

  console.info(`Bucket name: ${bucket}`);
  console.info(`Item key: ${key}`);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await getSignedUrl(s3, command); // expires in default 900 seconds

  if (response) {
    return response;
  }

  throw new NoBodyError();
};
