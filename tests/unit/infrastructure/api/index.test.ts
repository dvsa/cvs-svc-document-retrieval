import supertest from 'supertest';
import { app } from '../../../../src/infrastructure/api';
import getCertificate from '../../../../src/domain/getCertificate';

// TODO Define Mock strategy
describe('API', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  it('should return a 404 if the route is not recognised', async () => {
    const result = await supertest(app).get('/not-a-route');

    expect(result.status).toEqual(404);
  });

  describe('/', () => {
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
    const result = await supertest(app).get('/document-retrieval?testNumber=1234');

    expect(result.status).toEqual(400);
  });

<<<<<<< HEAD
  it('returns a 405 if the method is not supported', async () => {
    const resultPost = await supertest(app).post('/document-retrieval?testNumber=1234');

    expect(resultPost.status).toEqual(405);

    const resultPut = await supertest(app).put('/document-retrieval?testNumber=1234');

    expect(resultPut.status).toEqual(405);

    const resultPatch = await supertest(app).patch('/document-retrieval?testNumber=1234');

    expect(resultPatch.status).toEqual(405);

    const resultDelete = await supertest(app).delete('/document-retrieval?testNumber=1234');

    expect(resultDelete.status).toEqual(405);
=======
  it('returns a 501 if the method is not supported', async () => {
    const resultPost = await supertest(app).post('/document-retrieval?testNumber=1234');

    expect(resultPost.status).toEqual(501);

    const resultPut = await supertest(app).put('/document-retrieval?testNumber=1234');

    expect(resultPut.status).toEqual(501);

    const resultPatch = await supertest(app).patch('/document-retrieval?testNumber=1234');

    expect(resultPatch.status).toEqual(501);

    const resultDelete = await supertest(app).delete('/document-retrieval?testNumber=1234');

    expect(resultDelete.status).toEqual(501);
>>>>>>> feat(cvsb-19156): update route and add tests for /document-retrieval, audit fix
  });

  it('returns a 400 if the test number is missing from the querystring', async () => {
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234');

    expect(result.status).toEqual(400);
  });

  it('returns the expected body and status from the getCertificate call', async () => {
    (getCertificate as jest.Mock) = jest.fn().mockResolvedValue({ statusCode: 200, body: 'this is a test' });
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&testNumber=1234');

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
    const result = await supertest(app).get('/document-retrieval?vinNumber=1234&testNumber=1234');

    expect(result.headers).toHaveProperty('content-type');
    expect(result.get('content-type')).toContain('application/pdf');
  });
});
