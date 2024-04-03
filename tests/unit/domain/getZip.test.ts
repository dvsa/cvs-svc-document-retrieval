import { S3Client } from '@aws-sdk/client-s3';
import * as presigner from '@aws-sdk/s3-request-presigner';
import getZip from '../../../src/domain/getZip';
import FileNameError from '../../../src/errors/FileNameError';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
import ZipDetails from '../../../src/interfaces/ZipDetails';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));
describe('getZip', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getZip({} as ZipDetails, ({} as unknown) as S3Client, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getZip({} as ZipDetails, ({} as unknown) as S3Client, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the file name is invalid', async () => {
    const event: ZipDetails = {
      adrDocumentId: undefined,
    };
    const response = await getZip(event, ({} as unknown) as S3Client, 'bucket', 'folder', 'test');
    const error = new FileNameError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce(undefined);

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, s3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the file is not found', async () => {
    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockRejectedValueOnce({ name: 'NoSuchKey' } as unknown as Error);

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockRejectedValueOnce({ name: 'Generic Error' } as unknown as Error);

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce('/adr-documents/1234.zip');

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('/adr-documents/1234.zip');
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce('Zip Content');

    const event: ZipDetails = {
      adrDocumentId: '1234',
    };
    const response = await getZip(event, s3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Zip Content');
  });
});
