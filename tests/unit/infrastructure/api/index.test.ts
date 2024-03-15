/* eslint-disable  @typescript-eslint/no-unused-vars */
import supertest from 'supertest';
import { app } from '../../../../src/infrastructure/api';
import getCertificate from '../../../../src/domain/getCertificate';
import getPlate from '../../../../src/domain/getPlate';
import getLetter from '../../../../src/domain/getLetter';
import getZip from '../../../../src/domain/getZip';
import getFile from "../../../../src/domain/getFile";

// TODO Define Mock strategy
describe('API', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('should return a 404 if the route is not recognised', async () => {
    const result = await supertest(app).get('/not-a-route');

    expect(result.status).toBe(404);
  });

  describe('/', () => {
    test("should return '{ok: true}' when hitting '/' route", async () => {
      const result = await supertest(app).get('/');
      const resultContent = JSON.parse(result.text) as { ok: boolean };

      expect(result.status).toBe(200);
      expect(resultContent).toHaveProperty('ok');
      expect(resultContent.ok).toBe(true);
    });
  });
});

describe('/document-retrieval', () => {
  it('returns a 400 if the vin is missing from the querystring', async () => {
    const result = await supertest(app).get('/document-retrieval?testNumber=1234');

    expect(result.status).toBe(400);
  });

  it('returns a 405 if the method is not supported', async () => {
    const resultPost = await supertest(app).post('/document-retrieval?testNumber=1234');

    expect(resultPost.status).toBe(405);

    const resultPut = await supertest(app).put('/document-retrieval?testNumber=1234');

    expect(resultPut.status).toBe(405);

    const resultPatch = await supertest(app).patch('/document-retrieval?testNumber=1234');

    expect(resultPatch.status).toBe(405);

    const resultDelete = await supertest(app).delete('/document-retrieval?testNumber=1234');

    expect(resultDelete.status).toBe(405);
  });

  describe('returns a 400 if the querystring formats are incorrect', () => {
    it('returns a 400 if the test number is missing from the querystring when fetching a certificate', async () => {
      const result = await supertest(app).get('/document-retrieval?vinNumber=1234');
      expect(result.status).toBe(400);
    });

    it('returns a 400 if querystring is in the wrong format', async () => {
      const result = await supertest(app).get('/document-retrieval?vinNumber=1234&testNumber=1234&plateSerialNumber=1234&systemNumber=1234');
      expect(result.status).toBe(400);
    });
  });

  it('returns the expected body and status from the getCertificate call', async () => {
    (getCertificate as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&testNumber=1234');

    expect(result.status).toBe(200);
    expect(result.text).toBe('this is a test');
  });

  it('adds the header returned from the getCertificate call', async () => {
    (getCertificate as jest.Mock) = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'this is a test',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&testNumber=1234');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/pdf');
  });

  it('returns the expected body and status from the getPlate call', async () => {
    (getPlate as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?plateSerialNumber=1234');

    expect(result.status).toBe(200);
    expect(result.text).toBe('this is a test');
  });

  it('adds the header returned from the getPlate call', async () => {
    (getPlate as jest.Mock) = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'this is a test',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    const result = await supertest(app).get('/document-retrieval?plateSerialNumber=1234');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/pdf');
  });

  it('returns the expected body and status from the getLetter call', async () => {
    (getLetter as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&systemNumber=1234');

    expect(result.status).toBe(200);
    expect(result.text).toBe('this is a test');
  });

  it('adds the header returned from the getLetter call', async () => {
    (getLetter as jest.Mock) = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'this is a test',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&systemNumber=1234');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/pdf');
  });

  it('returns the expected body and status from the getFile call', async () => {
    (getFile as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?fileName=abc123');
    expect(result.status).toBe(200);
    expect(result.text).toBe('this is a test');
  });

  it('adds the header returned from the getFile call', async () => {
    (getFile as jest.Mock) = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'this is a test',
      headers: {
        'Content-Type': 'application/zip',
      },
    });
    const result = await supertest(app).get('/document-retrieval?fileName=abc123');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/zip');
  });

  it('returns the expected body and status from the getZip call', async () => {
    (getZip as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?adrDocumentId=1234');

    expect(result.status).toBe(200);
    expect(result.text).toBe('this is a test');
  });

  it('adds the header returned from the getZip call', async () => {
    (getZip as jest.Mock) = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'this is a test',
      headers: {
        'Content-Type': 'application/zip',
      },
    });
    const result = await supertest(app).get('/document-retrieval?adrDocumentId=1234');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/zip');
  });

  it('should catch error and log error message', async () => {
    (getCertificate as jest.Mock) = jest.fn().mockRejectedValue(new Error('Error message'));
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&testNumber=1234');
    expect(result.status).toBe(500);
  });
});
