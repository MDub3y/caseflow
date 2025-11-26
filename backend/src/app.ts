import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { authenticate, requireRole } from './middleware/auth';
import { login } from './controllers/authController';
import { startImport, batchIngest } from './controllers/importController';
import { getCases, getCaseDetails, deleteCase } from './controllers/caseController';

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// --- Routes ---

// Auth
app.post('/api/login', login);

// Cases
app.get('/api/cases', authenticate, getCases);
app.get('/api/cases/:id', authenticate, getCaseDetails);
app.delete('/api/cases/:id', authenticate, requireRole('ADMIN'), deleteCase);

// Import
app.post('/api/imports/start', authenticate, startImport);
app.post('/api/cases/batch', authenticate, batchIngest);

// Health
app.get('/health', (_req, res) => { res.status(200).send('OK'); });

// Errors
app.use(errorHandler);

export default app;