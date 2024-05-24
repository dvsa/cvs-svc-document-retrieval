import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-payload-output-types';
import { sdkStreamMixin } from '@smithy/util-stream';
import { mockClient } from 'aws-sdk-client-mock';
import { Readable } from 'stream';
import getPlate from '../../../src/domain/getPlate';
import IncorrectFileTypeError from '../../../src/errors/IncorrectFileTypeError';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';
import NoBodyError from '../../../src/errors/NoBodyError';
import PlateSerialNumberError from '../../../src/errors/PlateSerialNumberError';
import PlateDetails from '../../../src/interfaces/PlateDetails';

describe('getPlate', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getPlate({} as PlateDetails, ({} as unknown) as S3Client, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getPlate({} as PlateDetails, ({} as unknown) as S3Client, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the plate serial number number is invalid', async () => {
    const event: PlateDetails = {
      plateSerialNumber: 'this is invalid',
    };
    const response = await getPlate(event, ({} as unknown) as S3Client, 'bucket', 'folder', 'test');
    const error = new PlateSerialNumberError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});
    mockS3Client.on(GetObjectCommand).resolves({ ContentType: 'application/octet-stream' });

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, s3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an 404 if the stored file is not a PDF', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('This is an image');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream as StreamingBlobPayloadOutputTypes, ContentType: 'image/jpg' });

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, s3, 'bucket', 'folder', 'test');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the plate is not found', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).rejects({ name: 'NoSuchKey' });

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    mockS3Client.on(GetObjectCommand).rejects({ name: 'Generic Error' });

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('Plate Content');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);
    const body = Buffer.from('Plate Content');

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream as StreamingBlobPayloadOutputTypes, ContentType: 'application/octet-stream' });

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, s3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const mockS3Client = mockClient(S3Client);
    const s3 = new S3Client({});

    const stream = new Readable();
    stream.push('Plate Content');
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);
    const body = Buffer.from('Plate Content');

    mockS3Client.on(GetObjectCommand).resolves({ Body: sdkStream as StreamingBlobPayloadOutputTypes, ContentType: 'application/octet-stream' });

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, s3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(body.toString('base64'));
  });
});
