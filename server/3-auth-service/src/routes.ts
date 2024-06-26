import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth.routes';
import { verifyGatewayRequest } from '@hassonor/wisdomhub-shared';
import { currentUserRoutes } from '@auth/routes/currentUser.routes';
import { healthRoutes } from '@auth/routes/health.routes';
import { searchRoutes } from '@auth/routes/search.routes';
import { seedRoutes } from '@auth/routes/seed.routes';

const BASE_AUTH_PATH = '/api/v1/auth';

export function appRoutes(app: Application) {
  app.use('', healthRoutes());
  app.use(BASE_AUTH_PATH, searchRoutes());
  app.use(BASE_AUTH_PATH, seedRoutes());

  app.use(BASE_AUTH_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_AUTH_PATH, verifyGatewayRequest, currentUserRoutes());
}
