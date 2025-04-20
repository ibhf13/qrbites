const request = require('supertest');
const app = require('@root/app');

describe('App Routes Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: 'ok',
        message: 'Server is running'
      });
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'QrBites API',
        version: '1.0.0',
        documentation: '/api/docs'
      });
    });
  });
}); 