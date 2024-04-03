/* eslint-disable  @typescript-eslint/no-unsafe-argument */
import { Readable } from 'stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { mockClient } from 'aws-sdk-client-mock';
import getFromS3 from '../../../../src/infrastructure/s3/s3FileService';

describe('S3 File Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getObject if folder is defined', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = 'adr_pass_123_2024-01-22T11:48:16.035Z';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    await getFromS3(s3, bucket, folder, fileName).catch(() => {});

    const s3GetObjectStub = mockS3Client.commandCalls(GetObjectCommand);
    expect(s3GetObjectStub[0].args[0].input).toEqual({
      Bucket: bucket,
      Key: `${folder}/${fileName}.pdf`,
    });
  });

  it('passes the expected key to getObject if folder is undefined', async () => {
    const bucket = 'bucket';
    const folder = undefined;
    const fileName = 'adr_pass_123_2024-01-22T11:48:16.035Z';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    await getFromS3(s3, bucket, folder, fileName).catch(() => {});

    const s3GetObjectStub = mockS3Client.commandCalls(GetObjectCommand);

    expect(s3GetObjectStub[0].args[0].input).toEqual({
      Bucket: bucket,
      Key: `${fileName}.pdf`,
    });
  });

  it('returns the expected output', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = 'adr_pass_123_2024-01-22T11:48:16.035Z';
    const stream = new Readable();
    stream.push('Success!');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);

    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'application/octet-stream' });
    const responseBody = await getFromS3(s3, bucket, folder, fileName);

    expect(await responseBody.transformToString()).toBe('Success!');
  });

  it('throws an error if the response is not a PDF', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = 'adr_pass_123_2024-01-22T11:48:16.035Z';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    const stream = new Readable();
    stream.push('Success!');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream, ContentType: 'image/jpg' });

    await expect(getFromS3(s3, bucket, folder, fileName)).rejects.toThrow();
  });

  it('throws an error if there is no body in the response', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const fileName = 'adr_pass_123_2024-01-22T11:48:16.035Z';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    mockS3Client.on(GetObjectCommand).resolves({ ContentType: 'application/octet-stream' });

    await expect(getFromS3(s3, bucket, folder, fileName)).rejects.toThrow();
  });
});
