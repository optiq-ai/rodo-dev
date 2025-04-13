const request = require('supertest');
const { app } = require('../src/server');
const { User } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Auth API Endpoints', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active'
    });

    // Generate a token for testing
    authToken = jwt.sign(
      { id: testUser.id, username: testUser.username, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { username: 'testuser' } });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toEqual('testuser');
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toEqual('testuser');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should successfully logout a user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
