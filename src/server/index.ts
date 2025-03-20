
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

// For dev environments, export the express app for middleware usage
export { app };
