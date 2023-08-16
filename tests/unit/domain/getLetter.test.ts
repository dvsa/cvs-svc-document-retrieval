import { S3 } from 'aws-sdk';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
import VinError from '../../../src/errors/VinError';
import LetterDetails from '../../../src/interfaces/LetterDetails';
import IncorrectFileTypeError from '../../../src/errors/IncorrectFileTypeError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';
import getLetter from '../../../src/domain/getLetter';
import SystemNumberError from '../../../src/errors/SystemNumberError';

describe('getLetter', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getLetter({} as LetterDetails, ({} as unknown) as S3, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getLetter({} as LetterDetails, ({} as unknown) as S3, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the system number is invalid', async () => {
    const event: LetterDetails = {
      systemNumber: 'this is invalid',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, ({} as unknown) as S3, 'bucket', 'folder', 'test');
    const error = new SystemNumberError();

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the VIN is invalid', async () => {
    const event: LetterDetails = {
      systemNumber: '123456',
      vin: '',
    };
    const response = await getLetter(event, ({} as unknown) as S3, 'bucket', 'folder', 'test');
    const error = new VinError();

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', 'folder', 'test');
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

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', 'folder', 'test');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the letter is not found', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'NoSuchKey' } as unknown) as Error)); // eslint-disable-line prefer-promise-reject-errors
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'Generic Error' } as unknown) as Error)); // eslint-disable-line prefer-promise-reject-errors
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Letter Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('Letter Content');
  });

  it('base64 encodes the response', async () => {
    const mockS3 = ({} as unknown) as S3;
    const body = Buffer.from('Letter Content');
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: body, ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Letter Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: LetterDetails = {
      systemNumber: '123456',
      vin: 'JN21AAZ34U0200098',
    };
    const response = await getLetter(event, mockS3, 'bucket', undefined, 'local');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('Letter Content');
  });
});
