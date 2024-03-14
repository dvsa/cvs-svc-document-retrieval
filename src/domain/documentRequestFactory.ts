import AWS, { S3 } from 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda';
import getCertificate from './getCertificate';
import getLetter from './getLetter';
import getPlate from './getPlate';
import getFile from './getFile';
import getZip from './getZip';

const {
  NODE_ENV, BUCKET, BRANCH,
} = process.env;

export default async (vin: string, testNumber: string, plateSerialNumber: string, systemNumber: string, fileName: string, adrDocumentId: string): Promise<APIGatewayProxyResult> => {
  const s3 = new S3(
    process.env.IS_OFFLINE && {
      s3ForcePathStyle: true,
      // You will need to create your s3local profile (~/.aws/credentials) if you are not using any
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      endpoint: new AWS.Endpoint('http://localhost:4569'),
    },
  );

  const isCertificate = vin && testNumber && !plateSerialNumber && !systemNumber && !fileName && !adrDocumentId;
  const isPlate = plateSerialNumber && !vin && !testNumber && !systemNumber && !fileName && !adrDocumentId;
  const isLetter = !plateSerialNumber && vin && !testNumber && systemNumber && !fileName && !adrDocumentId;
  const isFile = fileName && !plateSerialNumber && !vin && !testNumber && !systemNumber && !adrDocumentId;
  const isZip = adrDocumentId && !plateSerialNumber && !vin && !testNumber && !systemNumber && !fileName;

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

  if (isFile) {
    console.info('Calling file retrieval service');
    return getFile(
      {
        fileName,
      },
      s3,
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    );
  }

  if (isZip) {
    console.info('Calling zip retrieval service');
    return getZip(
      {
        adrDocumentId,
      },
      s3,
      `cvs-cert-${BUCKET}`,
      BRANCH.concat('/adr-documents'),
      NODE_ENV,
    );
  }

  return Promise.resolve({
    statusCode: 400,
    body: '',
  });
};
