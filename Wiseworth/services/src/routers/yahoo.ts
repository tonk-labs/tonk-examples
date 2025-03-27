import { router, procedure } from '../trpc'
import { z } from 'zod';
import yahooFinance from 'yahoo-finance2';

export default router({
  search: procedure.input(z.string()).query(async ({ input }) => {
    const results = await yahooFinance.search(input);
    return {
      results,
    }
  }),
  
  quote: procedure.input(z.string()).query(async ({ input }) => {
    const quote = await yahooFinance.quoteSummary(input, {
      modules: ['price', 'summaryDetail']
    });
    return {
      quote,
    }
  })
})
