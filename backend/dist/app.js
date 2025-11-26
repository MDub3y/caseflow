"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const authController_1 = require("./controllers/authController");
const CaseService_1 = require("./services/CaseService");
const importController_1 = require("./controllers/importController");
const app = (0, express_1.default)();
const caseService = new CaseService_1.CaseService();
// --- Middleware ---
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN }));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Support large JSON bodies for batches
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);
// --- Routes ---
// Auth
app.post('/api/login', authController_1.login);
// Cases
app.get('/api/cases', auth_1.authenticate, async (req, res, next) => {
    try {
        const result = await caseService.getCases({
            limit: Number(req.query.limit) || 20,
            cursor: req.query.cursor,
            status: req.query.status,
            category: req.query.category,
            search: req.query.search
        });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
});
app.get('/api/cases/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const result = await caseService.getCaseDetails(req.params.id);
        if (!result) {
            res.status(404).json({ message: "Case not found" });
            return;
        }
        res.json(result);
    }
    catch (e) {
        next(e);
    }
});
// Import
app.post('/api/imports/start', auth_1.authenticate, importController_1.startImport);
app.post('/api/cases/batch', auth_1.authenticate, importController_1.batchIngest);
// Health (Mark req as _req to ignore unused)
app.get('/health', (_req, res) => { res.status(200).send('OK'); });
// Errors
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map