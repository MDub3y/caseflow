import request from 'supertest';
import app from './app';

describe('Health Check', () => {
    it('GET /health should return 200', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
    });
});