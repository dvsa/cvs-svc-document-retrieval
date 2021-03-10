import { S3 } from 'aws-sdk';
import express, { Request, Response } from 'express';
import getCertificate from '../../domain/getCertificate';

const app = express();

const router = express.Router();

const { API_VERSION, Bucket } = process.env;

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
app.use((_request, _response, next) => {
  // TODO Add logger lib like Winston or Morgan
  next();
});

/**
 * Define routing and route level middleware if necessary from ./routes
 */
router.post('/', (_request, res, next) => {
  res.send('Hello World!');
  next();
});

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
    Bucket,
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

export { app };
