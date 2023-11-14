import AWS, { S3 } from 'aws-sdk';
import express, { Request, Response } from 'express';
import getCertificate from '../../domain/getCertificate';
import getLetter from '../../domain/getLetter';
import getPlate from '../../domain/getPlate';

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
  if (req.query.vinNumber && req.query.testNumber && !req.query.plateSerialNumber && !req.query.systemNumber) {
    console.info('Calling cert service');

    getCertificate(
      {
        vin: req.query.vinNumber as string,
        testNumber: req.query.testNumber as string,
      },
      new S3(
        process.env.IS_OFFLINE && {
          s3ForcePathStyle: true,
          // You will need to create your s3local profile (~/.aws/credentials) if you are not using any
          accessKeyId: 'S3RVER',
          secretAccessKey: 'S3RVER',
          endpoint: new AWS.Endpoint('http://localhost:4569'),
        },
      ),
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    )
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
  } else if (req.query.plateSerialNumber && !req.query.vinNumber && !req.query.testNumber && !req.query.systemNumber) {
    console.info('Calling plate service');

    getPlate(
      {
        plateSerialNumber: req.query.plateSerialNumber as string,
      },
      new S3(
        process.env.IS_OFFLINE && {
          s3ForcePathStyle: true,
          // You will need to create your s3local profile (~/.aws/credentials) if you are not using any
          accessKeyId: 'S3RVER',
          secretAccessKey: 'S3RVER',
          endpoint: new AWS.Endpoint('http://localhost:4569'),
        },
      ),
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    )
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
  } else if (!req.query.plateSerialNumber && req.query.vinNumber && !req.query.testNumber && req.query.systemNumber) {
    console.info('Calling letter service');

    
    getLetter(
      {
        vin: req.query.vinNumber as string,
        systemNumber: req.query.systemNumber as string,
      },
      new S3(
        process.env.IS_OFFLINE && {
          s3ForcePathStyle: true,
          // You will need to create your s3local profile (~/.aws/credentials) if you are not using any
          accessKeyId: 'S3RVER',
          secretAccessKey: 'S3RVER',
          endpoint: new AWS.Endpoint('http://localhost:4569'),
        },
      ),
      `cvs-cert-${BUCKET}`,
      BRANCH,
      NODE_ENV,
    )
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
  } else {
    res.status(400).end();
  }
});

app.all('/document-retrieval', (_request, res: Response) => {
  res.status(405).send();
});

export { app };
