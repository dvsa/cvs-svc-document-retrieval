import { S3 } from 'aws-sdk';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
import IncorrectFileTypeError from '../../../src/errors/IncorrectFileTypeError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';
import getZip from '../../../src/domain/getZip';
import FileNameError from '../../../src/errors/FileNameError';
import ZipDetails from '../../../src/interfaces/ZipDetails';

describe('getZip', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getZip({} as ZipDetails, ({} as unknown) as S3, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getZip({} as ZipDetails, ({} as unknown) as S3, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the file name is invalid', async () => {
    const event: ZipDetails = {
      adrDocumentId: undefined,
    };
    const response = await getZip(event, ({} as unknown) as S3, 'bucket', 'folder', 'test');
    const error = new FileNameError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an 404 if the stored file is not a ZIP', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'This is an image', ContentType: 'image/jpg' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the file is not found', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'NoSuchKey' } as unknown) as Error));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'Generic Error' } as unknown) as Error));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

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

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

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

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Zip Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Zip Content');
  });
});
