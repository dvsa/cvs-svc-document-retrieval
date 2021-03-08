import supertest from 'supertest';
import { app } from '../../../../src/infrastructure/api';
import getCertificate from '../../../../src/domain/getCertificate';

// TODO Define Mock strategy
describe('API', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  describe('GET', () => {
    test("should return '{ok: true}' when hitting '/' route", async () => {
      const result = await supertest(app).get('/');
      const resultContent = JSON.parse(result.text) as { ok: boolean };

      expect(result.status).toEqual(200);
      expect(resultContent).toHaveProperty('ok');
      expect(resultContent.ok).toEqual(true);
    });
  });
});

describe('/document-retrieval', () => {
  it('returns a 400 if the vin is missing from the querystring', async () => {
    const result = await supertest(app).get('/document-retrieval?certificateNumber=1234');

    expect(result.status).toEqual(400);
  });

  it('returns a 400 if the certificate number is missing from the querystring', async () => {
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234');

    expect(result.status).toEqual(400);
  });

  it('returns the expected body and status from the getCertificate call', async () => {
    (getCertificate as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&certificateNumber=1234');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('this is a test');
  });

  it('adds the header returned from the getCertificate call', async () => {
    (getCertificate as jest.Mock) = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'this is a test',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&certificateNumber=1234');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/pdf');
  });
});
