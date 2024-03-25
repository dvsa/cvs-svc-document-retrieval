import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyResult } from 'aws-lambda';
import getCertificate from './getCertificate';
import getLetter from './getLetter';
import getPlate from './getPlate';

const {
  NODE_ENV, BUCKET, BRANCH,
} = process.env;

export default async (vin: string, testNumber: string, plateSerialNumber: string, systemNumber: string): Promise<APIGatewayProxyResult> => {
  const s3 = new S3Client(process.env.IS_OFFLINE && {
    forcePathStyle: true,
    // You will need to create your s3local profile (~/.aws/credentials) if you are not using any
    credentials: {
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
    },
    endpoint: 'http://localhost:4569',
  });

  const isCertificate = vin && testNumber && !plateSerialNumber && !systemNumber;
  const isPlate = plateSerialNumber && !vin && !testNumber && !systemNumber;
  const isLetter = !plateSerialNumber && vin && !testNumber && systemNumber;

  if (isCertificate) {
    console.info('Calling cert service');
    return getCertificate(
      {
        vin,
        testNumber,
      },
      s3,
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    );
  }

  if (isPlate) {
    console.info('Calling plate service');
    return getPlate(
      {
        plateSerialNumber,
      },
      s3,
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    );
  }

  if (isLetter) {
    console.info('Calling letter service');
    return getLetter(
      {
        vin,
        systemNumber,
      },
      s3,
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    );
  }

  return Promise.resolve({
    statusCode: 400,
    body: '',
  });
};
