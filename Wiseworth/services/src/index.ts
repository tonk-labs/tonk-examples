import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import { appRouter } from './routers';
import cors from 'cors';
import chalk from 'chalk';

async function main() {
  // express implementation
  const app = express();
  app.use(cors());

  // For testing purposes, wait-on requests '/'
  app.get('/ping', (_req, res) => {
    res.send('pong!');
  });

  // Debug logging middleware for /api routes
  // app.use('/api', (req, res, next) => {
  //   const startTime = Date.now();
  //   const requestId = Math.random().toString(36).substring(7);
    
  //   console.log(chalk.cyan(`[${requestId}] 🔍 Incoming request to ${chalk.bold(req.url)}`));
  //   console.log(chalk.gray(`[${requestId}] Method: ${req.method}`));
  //   console.log(chalk.gray(`[${requestId}] Headers: ${JSON.stringify(req.headers, null, 2)}`));
    
  //   // Capture the raw body if it exists
  //   let rawBody = '';
  //   req.on('data', chunk => {
  //     rawBody += chunk;
  //   });

  //   // Intercept the response
  //   const oldSend = res.send;
  //   res.send = function(this: Response, data: any) {
  //     const duration = Date.now() - startTime;
      
  //     console.log(chalk.yellow(`\n[${requestId}] 📤 Response sent after ${duration}ms`));
  //     console.log(chalk.gray(`[${requestId}] Status: ${res.statusCode}`));
  //     console.log(chalk.gray(`[${requestId}] Response: ${data}`));
  //     console.log(chalk.gray('─'.repeat(80)));
      
  //     return oldSend.call(this, data);
  //   };

  //   req.on('end', () => {
  //     if (rawBody) {
  //       try {
  //         const parsedBody = JSON.parse(rawBody);
  //         console.log(chalk.gray(`[${requestId}] Body: ${JSON.stringify(parsedBody, null, 2)}`));
  //       } catch (e) {
  //         console.log(chalk.gray(`[${requestId}] Raw body: ${rawBody}`));
  //       }
  //     }
  //     console.log(chalk.gray('─'.repeat(80)));
  //   });

  //   next();
  // });

  app.use(
    '/api',
    createExpressMiddleware({
      router: appRouter,
    }),
  );
  
  const port = 6080;
  app.listen(port, () => {
    console.log(chalk.green(`\n🚀 Server started on port ${port}`));
    console.log(chalk.blue(`📡 API endpoint: http://localhost:${port}/api`));
    console.log(chalk.gray('─'.repeat(80)));
  });
}

void main();
