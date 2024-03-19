import { S3 } from 'aws-sdk';
import getFromS3 from '../../../../src/infrastructure/s3/s3ZipService';

describe('S3 Zip Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getSignedUrl if folder is defined', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';
    const mockPromise = jest
      .fn()
      .mockResolvedValue({ Body: 'Success!', ContentType: 'application/json' });
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;
    await getFromS3(mockS3, bucket, folder, adrDocumentId).catch(() => {});

    const firstCall = mockGetSignedUrlPromise.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg).toBe('getObject');
  });

  it('passes the expected key to getSignedUrl if folder is undefined', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder: string | undefined = undefined;
    const adrDocumentId = '1234';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/json' }));
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;
    await getFromS3(mockS3, bucket, folder, adrDocumentId).catch(() => {});

    const firstCall = mockGetSignedUrlPromise.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg).toBe('getObject');
  });

  it('passes the bucket to getSignedUrl', () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/json' }));
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;
    getFromS3(mockS3, bucket, folder, adrDocumentId).catch(() => {});

    const firstCall = mockGetSignedUrlPromise.mock.calls[0] as S3.GetObjectRequest[];
    const secondArg = firstCall[1];

    expect(secondArg.Bucket).toEqual(bucket);
  });

  it('returns the expected output', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue('Success!');

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    expect(await getFromS3(mockS3, bucket, folder, adrDocumentId)).toBe('Success!');
  });

  it('throws an error if there is no body in the response', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const adrDocumentId = '1234';
    const mockGetSignedUrlPromise = jest.fn().mockReturnValue(undefined);

    mockS3.getSignedUrlPromise = mockGetSignedUrlPromise;

    await expect(getFromS3(mockS3, bucket, folder, adrDocumentId)).rejects.toThrow();
  });
});
