import { S3 } from 'aws-sdk';
import MissingBucketNameError from '../../../src/errors/MissingBucketNameError';
import PlateSerialNumberError from '../../../src/errors/PlateSerialNumberError';
import NoBodyError from '../../../src/errors/NoBodyError';
import PlateDetails from '../../../src/interfaces/PlateDetails';
import getPlate from '../../../src/domain/getPlate';
import IncorrectFileTypeError from '../../../src/errors/IncorrectFileTypeError';
import MissingFolderNameError from '../../../src/errors/MissingFolderNameError';

describe('getPlate', () => {
  it('returns an internal server error if the bucket is undefined', async () => {
    const response = await getPlate({} as PlateDetails, ({} as unknown) as S3, undefined, 'folder', 'test');
    const error = new MissingBucketNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if the folder is undefined', async () => {
    const response = await getPlate({} as PlateDetails, ({} as unknown) as S3, 'bucket', undefined, 'test');
    const error = new MissingFolderNameError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns a bad request if the plate serial number number is invalid', async () => {
    const event: PlateDetails = {
      plateSerialNumber: 'this is invalid',
    };
    const response = await getPlate(event, ({} as unknown) as S3, 'bucket', 'folder', 'test');
    const error = new PlateSerialNumberError();

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(error.message);
  });

  it('returns an internal server error if there is no Body in the S3 request', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.resolve({ ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', 'folder', 'test');
    const error = new NoBodyError();

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(error.message);
  });

  it('returns an 404 if the stored file is not a PDF', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'This is an image', ContentType: 'image/jpg' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', 'folder', 'test');
    const error = new IncorrectFileTypeError();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(error.message);
  });

  it('returns a not found error if the plate is not found', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'NoSuchKey' } as unknown) as Error)); // eslint-disable-line prefer-promise-reject-errors
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('NoSuchKey');
  });

  it('returns an internal server error if the S3 get fails for any other reason', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest.fn().mockReturnValue(Promise.reject(({ code: 'Generic Error' } as unknown) as Error)); // eslint-disable-line prefer-promise-reject-errors
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('Generic Error');
  });

  it('returns a successful response if everything works', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Plate Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Plate Content');
  });

  it('base64 encodes the response', async () => {
    const mockS3 = ({} as unknown) as S3;
    const body = Buffer.from('Plate Content');
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: body, ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', 'folder', 'test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(body.toString('base64'));
  });

  it('ignores the folder check if the current environment is "local". Required for local testing', async () => {
    const mockS3 = ({} as unknown) as S3;
    const mockPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve({ Body: 'Plate Content', ContentType: 'application/octet-stream' }));
    const mockGetObject = jest.fn().mockReturnValue({ promise: mockPromise });

    mockS3.getObject = mockGetObject;

    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };
    const response = await getPlate(event, mockS3, 'bucket', undefined, 'local');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Plate Content');
  });
});
