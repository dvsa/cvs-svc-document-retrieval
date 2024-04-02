import { Readable } from 'stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { sdkStreamMixin } from '@smithy/util-stream';
import TestNumberError from '../../../src/errors/TestNumberError';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
import VinError from '../../../src/errors/VinError';
import CertificateDetails from '../../../src/interfaces/CertificateDetails';
import getCertificate from '../../../src/domain/getCertificate';
import IncorrectFileTypeError from '../../../src/errors/IncorrectFileTypeError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';

describe('getCertificate', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getCertificate({} as CertificateDetails, ({} as unknown) as S3Client, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getCertificate({} as CertificateDetails, ({} as unknown) as S3Client, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the certificate number is invalid', async () => {
    const event: CertificateDetails = {
      testNumber: 'this is invalid',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, ({} as unknown) as S3Client, 'bucket', 'folder', 'test');
    const error = new TestNumberError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the VIN is invalid', async () => {
    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: '',
    };
    const response = await getCertificate(event, ({} as unknown) as S3Client, 'bucket', 'folder', 'test');
    const error = new VinError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    mockS3Client.on(GetObjectCommand).resolves({ ContentType: 'application/octet-stream' });

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, s3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an 404 if the stored file is not a PDF', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('This is an image');
    stream.push(null); // end of stream
    const sdkStream = sdkStreamMixin(stream);

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'image/jpg' });

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, s3, 'bucket', 'folder', 'test');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the certificate is not found', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).rejects({ name: 'NoSuchKey' });

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).rejects({ name: 'Generic Error' });

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('Certificate Content');
    stream.push(null); // end of stream
    const sdkStream = sdkStreamMixin(stream);
    const body = Buffer.from('Certificate Content');

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'application/octet-stream' });

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    // const mockS3 = ({} as unknown) as S3;
    // const mockPromise = jest
    //   .fn()
    //   .mockReturnValue(Promise.resolve({ Body: 'Certificate Content', ContentType: 'application/octet-stream' }));
    // const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    // mockS3.getObject = mockGetObject;
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('Certificate Content');
    stream.push(null); // end of stream
    const sdkStream = sdkStreamMixin(stream);
    const body = Buffer.from('Certificate Content');

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'application/octet-stream' });

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, s3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(body.toString('base64'));
  });
});
