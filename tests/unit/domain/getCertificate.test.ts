import { S3 } from 'aws-sdk';
import CertificateNumberError from '../../../src/errors/CertificateNumberError';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
import VinError from '../../../src/errors/VinError';
import CertificateDetails from '../../../src/interfaces/CertificateDetails';
import getCertificate from '../../../src/domain/getCertificate';
import IncorrectFileTypeError from '../../../src/errors/IncorrectFileTypeError';

describe('getCertificate', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getCertificate({} as CertificateDetails, ({} as unknown) as S3, undefined);
    const error = new MissingBucketNameError();

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the certificate number is invalid', async () => {
    const event: CertificateDetails = {
      testNumber: 'this is invalid',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, ({} as unknown) as S3, 'bucket');
    const error = new CertificateNumberError();

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the VIN is invalid', async () => {
    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: '',
    };
    const response = await getCertificate(event, ({} as unknown) as S3, 'bucket');
    const error = new VinError();

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/pdf' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket');
    const error = new NoBodyError();

    expect(response.statusCode).toEqual(500);
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
    const response = await getCertificate(event, mockS3, 'bucket');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toEqual(404);
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
    const response = await getCertificate(event, mockS3, 'bucket');

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual('NoSuchKey');
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
    const response = await getCertificate(event, mockS3, 'bucket');

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Certificate Content', ContentType: 'application/pdf' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: CertificateDetails = {
      testNumber: 'W10I02544',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getCertificate(event, mockS3, 'bucket');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(Buffer.from('Certificate Content').toString('base64'));
  });
});
