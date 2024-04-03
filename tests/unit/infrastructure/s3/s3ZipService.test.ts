import { S3Client } from '@aws-sdk/client-s3';
import * as presigner from '@aws-sdk/s3-request-presigner';
import getFromS3 from '../../../../src/infrastructure/s3/s3ZipService';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3 Zip Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getSignedUrl if folder is defined', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';

    const s3 = new S3Client({});
    const mockGetsignedUrl = jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce('Success!');

    const response = await getFromS3(s3, bucket, folder, adrDocumentId).catch(() => {});
    const firstCall = mockGetsignedUrl.mock.calls[0];
    expect(firstCall[1].input).toEqual({
      Bucket: bucket,
      Key: `${folder}/adr-documents/${adrDocumentId}.zip`,
    });
    expect(response).toBe('Success!');
  });

  it('passes the expected key to getSignedUrl if folder is undefined', async () => {
    const bucket = 'bucket';
    const folder: string | undefined = undefined;
    const adrDocumentId = '1234';

    const s3 = new S3Client({});
    const mockGetsignedUrl = jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce('Success!');

    await getFromS3(s3, bucket, folder, adrDocumentId).catch(() => {});
    const firstCall = mockGetsignedUrl.mock.calls[0];
    expect(firstCall[1].input).toEqual({
      Bucket: bucket,
      Key: `adr-documents/${adrDocumentId}.zip`,
    });
  });

  it('returns the expected output', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';

    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce('Success!');

    expect(await getFromS3(s3, bucket, folder, adrDocumentId)).toBe('Success!');
  });

  it('throws an error if there is no body in the response', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';
    const s3 = new S3Client({});
    jest.spyOn(presigner, 'getSignedUrl').mockResolvedValueOnce(undefined);

    await expect(getFromS3(s3, bucket, folder, adrDocumentId)).rejects.toThrow();
  });
});
