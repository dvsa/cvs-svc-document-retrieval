import { Readable } from 'stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { mockClient } from 'aws-sdk-client-mock';
import getFromS3 from '../../../../src/infrastructure/s3/s3LetterService';

describe('S3 Letter Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getObject if folder is defined', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    const bucket = 'bucket';
    const folder = 'folder';
    const systemNumber = '123456';
    const vin = 'VIN2345AB';

    await getFromS3(s3, bucket, folder, systemNumber, vin).catch(() => {});

    const s3GetObjectStub = mockS3Client.commandCalls(GetObjectCommand);

    // s3GetObjectStub[0] here refers to the first call of GetObjectCommand
    expect(s3GetObjectStub[0].args[0].input).toEqual({
      Bucket: bucket,
      Key: `${folder}/letter_${systemNumber}_${vin}.pdf`,
    });
  });

  it('passes the expected key to getObject if folder is undefined', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    const bucket = 'bucket';
    const folder = undefined;
    const systemNumber = '123456';
    const vin = 'VIN2345AB';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await getFromS3(s3, bucket, folder, systemNumber, vin).catch(() => {});

    const s3GetObjectStub = mockS3Client.commandCalls(GetObjectCommand);

    // s3GetObjectStub[0] here refers to the first call of GetObjectCommand
    expect(s3GetObjectStub[0].args[0].input).toEqual({
      Bucket: bucket,
      Key: `letter_${systemNumber}_${vin}.pdf`,
    });
  });

  it('returns the expected output', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const systemNumber = '123456';
    const vin = 'VIN2345AB';

    const stream = new Readable();
    stream.push('Success!');
    stream.push(null); // end of stream
    const sdkStream = sdkStreamMixin(stream);

    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'application/octet-stream' });
    const responseBody = await getFromS3(s3, bucket, folder, systemNumber, vin);

    expect(await responseBody.transformToString()).toBe('Success!');
  });

  it('throws an error if the response is not a PDF', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const systemNumber = '123456';
    const vin = 'VIN2345AB';

    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('Success!');
    stream.push(null); // end of stream
    const sdkStream = sdkStreamMixin(stream);

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'image/jpg' });

    await expect(getFromS3(s3, bucket, folder, systemNumber, vin)).rejects.toThrow();
  });

  it('throws an error if there is no body in the response', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const systemNumber = '123456';
    const vin = 'VIN2345AB';

    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    mockS3Client.on(GetObjectCommand).resolves({ ContentType: 'application/octet-stream' });

    await expect(getFromS3(s3, bucket, folder, systemNumber, vin)).rejects.toThrow();
  });
});
