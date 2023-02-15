import { S3 } from 'aws-sdk';
import IncorrectFileTypeError from '../../errors/IncorrectFileTypeError';
import NoBodyError from '../../errors/NoBodyError';

export default async (
  s3: S3,
  bucket: string,
  folder: string | undefined,
  plateSerialNumber: string,
): Promise<S3.Body> => {
  const key = folder ? `${folder}/${plateSerialNumber}.pdf` : `${plateSerialNumber}.pdf`;

  console.info(`Bucket name: ${bucket}`);
  console.info(`Item key: ${key}`);

  const response = await s3
    .getObject({
      Bucket: bucket,
      Key: key,
    })
    .promise();

  if (response.ContentType !== 'application/octet-stream' && response.ContentType !== 'application/pdf') {
    // TODO: Cover this in case we encrypt the plates as octet stream or some other form
    console.error(`Incorrect content-type: ${response.ContentType}`);
    throw new IncorrectFileTypeError();
  }

  if (response.Body) {
    return response.Body;
  }

  throw new NoBodyError();
};
