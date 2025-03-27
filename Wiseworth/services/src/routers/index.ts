// import { lazy } from '@trpc/server';
import { router } from '../trpc';
import yahoo from './yahoo';

export const appRouter = router({
  yahoo
});

export type AppRouter = typeof appRouter;
