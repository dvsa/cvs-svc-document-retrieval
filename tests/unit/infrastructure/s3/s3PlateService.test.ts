import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-payload-output-types';
import { sdkStreamMixin } from '@smithy/util-stream';
import { mockClient } from 'aws-sdk-client-mock';
import { Readable } from 'stream';
import getFromS3 from '../../../../src/infrastructure/s3/s3PlateService';

describe('S3 Plate Service', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('passes the expected key to getObject if folder is defined', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const plateSerialNumber = 'plate_123453';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    await getFromS3(s3, bucket, folder, plateSerialNumber).catch(() => {});

    const s3GetObjectStub = mockS3Client.commandCalls(GetObjectCommand);

    expect(s3GetObjectStub[0].args[0].input).toEqual({
      Bucket: bucket,
      Key: `${folder}/${plateSerialNumber}.pdf`,
    });
  });

  it('passes the expected key to getObject if folder is undefined', async () => {
    const bucket = 'bucket';
    const folder = undefined;
    const plateSerialNumber = 'plate_123453';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await getFromS3(s3, bucket, folder, plateSerialNumber).catch(() => {});

    const s3GetObjectStub = mockS3Client.commandCalls(GetObjectCommand);

    expect(s3GetObjectStub[0].args[0].input).toEqual({
      Bucket: bucket,
      Key: `${plateSerialNumber}.pdf`,
    });
  });

  it('returns the expected output', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const plateSerialNumber = 'plate_123453';

    const stream = new Readable();
    stream.push('Success!');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);

    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream as StreamingBlobPayloadOutputTypes, ContentType: 'application/octet-stream' });
    const responseBody = await getFromS3(s3, bucket, folder, plateSerialNumber);

    expect(await responseBody.transformToString()).toBe('Success!');
  });

  it('throws an error if the response is not a PDF', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const plateSerialNumber = 'plate_123453';

    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('Success!');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream as StreamingBlobPayloadOutputTypes, ContentType: 'image/jpg' });

    await expect(getFromS3(s3, bucket, folder, plateSerialNumber)).rejects.toThrow();
  });

  it('throws an error if there is no body in the response', async () => {
    const bucket = 'bucket';
    const folder = 'folder';
    const plateSerialNumber = 'plate_123453';
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    mockS3Client.on(GetObjectCommand).resolves({ ContentType: 'application/octet-stream' });

    await expect(getFromS3(s3, bucket, folder, plateSerialNumber)).rejects.toThrow();
  });
});
