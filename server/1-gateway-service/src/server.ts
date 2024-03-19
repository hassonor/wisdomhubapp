import { CustomError, IErrorResponse, winstonLogger } from '@hassonor/wisdomhub-shared';
import { Logger } from 'winston';
import { Application, json, Request, Response, NextFunction, urlencoded } from 'express';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import * as process from 'process';

const SERVER_PORT = 4000;
const log: Logger = winstonLogger('http://localhost:9200', 'apiGatewayServer', 'debug');
4;

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware();
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [],
        maxAge: 24 * 2 * 3600000, // 2 days
        secure: false // update this with the value from the config: local - false, prod - true
        // sameSite: none
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(cors({
      origin: '',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '100mb' }));
    app.use(urlencoded({ extended: true, limit: '100mb' }));
  }

  private routesMiddleware(): void {

  }

  private startElasticSearch(): void {

  }

  private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `${fullUrl} endpoint does not exist.`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.' });
      next();
    });
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.log('error', `GatewayService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method', error);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      log.info(`Gateway server has started with process id: ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', 'GatewayService startHttpServer() error method', error);
    }

  }
}

