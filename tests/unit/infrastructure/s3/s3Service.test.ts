import { S3 } from 'aws-sdk';
import getFromS3 from '../../../../src/infrastructure/s3/s3Service';

describe('S3 Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getObject if folder is defined', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const certNumber = 'cert123456';
    const vin = 'VIN2345AB';
    const mockPromise = jest
      .fn()
      .mockResolvedValue({ Body: 'Success!', ContentType: 'application/octet-stream' });
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;
    await getFromS3(mockS3, bucket, folder, certNumber, vin).catch(() => {});

    const firstCall = mockGetObject.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg.Key).toEqual(`${folder}/${certNumber}_${vin}.pdf`);
  });

  it('passes the expected key to getObject if folder is undefined', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = undefined;
    const certNumber = 'cert123456';
    const vin = 'VIN2345AB';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;
    await getFromS3(mockS3, bucket, folder, certNumber, vin).catch(() => {});

    const firstCall = mockGetObject.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg.Key).toEqual(`${certNumber}_${vin}.pdf`);
  });

  it('passes the bucket to getObject', () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const certNumber = 'cert123456';
    const vin = 'VIN2345AB';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;
    getFromS3(mockS3, bucket, folder, certNumber, vin).catch(() => {});

    const firstCall = mockGetObject.mock.calls[0] as S3.GetObjectRequest[];
    const firstArg = firstCall[0];

    expect(firstArg.Bucket).toEqual(bucket);
  });

  it('returns the expected output', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const certNumber = 'cert123456';
    const vin = 'VIN2345AB';
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    expect(await getFromS3(mockS3, bucket, folder, certNumber, vin)).toEqual('Success!');
  });

  it('throws an error if the response is not a PDF', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const certNumber = 'cert123456';
    const vin = 'VIN2345AB';
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ Body: 'Success!', ContentType: 'image/jpg' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    await expect(getFromS3(mockS3, bucket, folder, certNumber, vin)).rejects.toThrow();
  });

  it('throws an error if there is no body in the response', async () => {
    const mockS3 = ({} as unknown) as S3;
    const bucket = 'bucket';
    const folder = 'folder';
    const certNumber = 'cert123456';
    const vin = 'VIN2345AB';
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    await expect(getFromS3(mockS3, bucket, folder, certNumber, vin)).rejects.toThrow();
  });
});
