import { S3 } from 'aws-sdk';
import express, { Request, Response } from 'express';
import getCertificate from '../../domain/getCertificate';

const app = express();

const router = express.Router();

const { API_VERSION } = process.env;

// Declare middlewares
/**
 * bodyParser, error handling, logger, etc..
 * http://expressjs.com/en/starter/basic-routing.html
 * http://expressjs.com/en/guide/using-middleware.html
 */

/**
 * app level middlewares
 * app.use('/path', (req, res, next) => {
 * chain middlewares
 * next()
 * })
 */
app.use((_, __, next) => {
  // TODO Add logger lib like Winston or Morgan
  next();
});

/**
 * Define routing and route level middleware if necessary from ./routes
 */
router.post('/', (_, res, next) => {
  res.send('Hello World!');
  next();
});

// Debug router before we start proxying  requests from /v<x> psth
app.get('/', (_, res) => {
  res.send({ ok: true });
});

app.get('/version', (_, res) => {
  res.send({ version: API_VERSION });
});

app.get('/document-retrieval', (req: Request, res: Response) => {
  if (!req.query.vinNumber || !req.query.certificateNumber) {
    res.status(400).end();

    return;
  }

  getCertificate(
    {
      vin: req.query.vinNumber as string,
      certificateNumber: req.query.certificateNumber as string,
    },
    new S3(),
    process.env.Bucket,
  )
    .then((responseDetails) => {
      res.status(responseDetails.statusCode);

      if (responseDetails.headers) {
        res.header(responseDetails.headers);
      }

      res.send(responseDetails.body);
    })
    .catch((e: Error) => {
      res.status(500).send(e.message);
    });
});

export { app };
