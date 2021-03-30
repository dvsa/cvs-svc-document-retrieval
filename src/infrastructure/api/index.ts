import { S3 } from 'aws-sdk';
import express, { Request, Response } from 'express';
import getCertificate from '../../domain/getCertificate';

const app = express();

const {
  API_VERSION, NODE_ENV, BUCKET, BRANCH,
} = process.env;

// Debug router before we start proxying  requests from /v<x> psth
app.get('/', (_request, res) => {
  res.send({ ok: true });
});

app.get('/version', (_request, res) => {
  res.send({ version: API_VERSION });
});

app.get('/document-retrieval', (req: Request, res: Response) => {
  if (!req.query.vinNumber || !req.query.testNumber) {
    res.status(400).end();

    return;
  }

  getCertificate(
    {
      vin: req.query.vinNumber as string,
      testNumber: req.query.testNumber as string,
    },
    new S3(),
    `cvs-cert-${BUCKET}`,
    BRANCH,
    NODE_ENV,
  )
    .then((responseDetails) => {
      res.status(responseDetails.statusCode);

      if (responseDetails.headers) {
        res.header(responseDetails.headers);
      }

      res.send(responseDetails.body);
    })
    .catch((e: Error) => {
      console.error(e.message);
      res.status(500).send(e.message);
    });
});

app.all('/document-retrieval', (_request, res: Response) => {
  res.status(501).send();
});

export { app };
