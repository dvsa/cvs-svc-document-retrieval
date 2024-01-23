import express, { Request, Response } from 'express';
import documentRequestFactory from '../../domain/documentRequestFactory';

const app = express();

const { API_VERSION } = process.env;

// Debug router before we start proxying  requests from /v<x> psth
app.get('/', (_request, res) => {
  res.send({ ok: true });
});

app.get('/version', (_request, res) => {
  res.send({ version: API_VERSION });
});

app.get('/document-retrieval', (req: Request, res: Response) => {
  const {
    vinNumber, plateSerialNumber, testNumber, systemNumber, fileName,
  } = req.query;

  documentRequestFactory(vinNumber as string, testNumber as string, plateSerialNumber as string, systemNumber as string, fileName as string)
    .then(({ statusCode, headers, body }) => {
      res.status(statusCode);

      if (headers) {
        res.header(headers);
      }

      res.send(body);
    })
    .catch((e: Error) => {
      console.error(e.message);
      res.status(500).send(e.message);
    });
});

app.all('/document-retrieval', (_request, res: Response) => {
  res.status(405).send();
});

export { app };
