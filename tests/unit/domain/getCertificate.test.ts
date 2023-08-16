import { S3 } from 'aws-sdk';
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
    const response = await getCertificate({} as CertificateDetails, ({} as unknown) as S3, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getCertificate({} as CertificateDetails, ({} as unknown) as S3, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the certificate number is invalid', async () => {
    const event: CertificateDetails = {
      testNumber: 'this is invalid',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, ({} as unknown) as S3, 'bucket', 'folder', 'test');
    const error = new TestNumberError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the VIN is invalid', async () => {
    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: '',
    };
    const response = await getCertificate(event, ({} as unknown) as S3, 'bucket', 'folder', 'test');
    const error = new VinError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an 404 if the stored file is not a PDF', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'This is an image', ContentType: 'image/jpg' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', 'folder', 'test');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the certificate is not found', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'NoSuchKey' } as unknown) as Error)); // eslint-disable-line prefer-promise-reject-errors
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'Generic Error' } as unknown) as Error)); // eslint-disable-line prefer-promise-reject-errors
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Certificate Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Certificate Content');
  });

  it('base64 encodes the response', async () => {
    const mockS3 = ({} as unknown) as S3;
    const body = Buffer.from('Certificate Content');
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: body, ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Certificate Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Certificate Content');
  });
});
