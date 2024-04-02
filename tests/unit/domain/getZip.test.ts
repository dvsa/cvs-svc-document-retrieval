import { S3 } from 'aws-sdk';
import getZip from '../../../src/domain/getZip';
import FileNameError from '../../../src/errors/FileNameError';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
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
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue(undefined);

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the file is not found', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockGetSignedUrlPromise = jest.fn().mockRejectedValue({ code: 'NoSuchKey' } as unknown as Error);

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockGetSignedUrlPromise = jest.fn().mockRejectedValue(({ code: 'Generic Error' } as unknown as Error));

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue('Certificate Content');

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

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
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue(body);

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue('Zip Content');

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, mockS3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Zip Content');
  });
});
