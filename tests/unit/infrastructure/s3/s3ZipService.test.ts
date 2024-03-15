import { S3 } from 'aws-sdk';
import getFromS3 from '../../../../src/infrastructure/s3/s3ZipService';

describe('S3 Zip Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getObject if folder is defined', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = '1234';
    const mockPromise = jest
      .fn()
      .mockResolvedValue({ Body: 'Success!', ContentType: 'application/octet-stream' });
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;
    await getFromS3(mockS3, bucket, folder, fileName).catch(() => {});

    const firstCall = mockGetObject.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg.Key).toBe(`${folder}/${fileName}.zip`);
  });

  it('passes the expected key to getObject if folder is undefined', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = undefined;
    const fileName = '1234';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await getFromS3(mockS3, bucket, folder, fileName).catch(() => {});

    const firstCall = mockGetObject.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg.Key).toBe(`${fileName}.zip`);
  });

  it('passes the bucket to getObject', () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = '1234';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;
    getFromS3(mockS3, bucket, folder, fileName).catch(() => {});

    const firstCall = mockGetObject.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg.Bucket).toEqual(bucket);
  });

  it('returns the expected output', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = '1234';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    expect(await getFromS3(mockS3, bucket, folder, fileName)).toBe('Success!');
  });

  it('throws an error if the response is not a ZIP', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = '1234';
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'image/jpg' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    await expect(getFromS3(mockS3, bucket, folder, fileName)).rejects.toThrow();
  });

  it('throws an error if there is no body in the response', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = '1234';
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    await expect(getFromS3(mockS3, bucket, folder, fileName)).rejects.toThrow();
  });
});