const request = require('supertest');
const { app } = require('../src/server');
const { User, Request } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Request API Endpoints', () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;
  let testRequest;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      username: 'requestuser',
      email: 'requestuser@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active'
    });

    adminUser = await User.create({
      username: 'requestadmin',
      email: 'requestadmin@example.com',
      password: 'Password123!',
      role: 'admin',
      status: 'active'
    });

    // Generate tokens for testing
    userToken = jwt.sign(
      { id: testUser.id, username: testUser.username, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    adminToken = jwt.sign(
      { id: adminUser.id, username: adminUser.username, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Create a test request
    testRequest = await Request.create({
      type: 'access',
      dataSubject: 'John Doe',
      contactInfo: 'john.doe@example.com',
      description: 'Request for access to personal data',
      status: 'new',
      submittedBy: testUser.id
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Request.destroy({ where: { dataSubject: 'John Doe' } });
    await User.destroy({ where: { username: 'requestuser' } });
    await User.destroy({ where: { username: 'requestadmin' } });
  });

  describe('GET /api/v1/requests', () => {
    it('should return all requests for admin user', async () => {
      const res = await request(app)
        .get('/api/v1/requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return only accessible requests for regular user', async () => {
      const res = await request(app)
        .get('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/requests');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/requests/:id', () => {
    it('should return a request by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/requests/${testRequest.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.dataSubject).toEqual('John Doe');
    });

    it('should return 404 for non-existent request', async () => {
      const res = await request(app)
        .get('/api/v1/requests/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/requests', () => {
    it('should create a new request', async () => {
      const newRequest = {
        type: 'erasure',
        dataSubject: 'Jane Smith',
        contactInfo: 'jane.smith@example.com',
        description: 'Request for data erasure'
      };

      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newRequest);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.dataSubject).toEqual('Jane Smith');

      // Clean up
      await Request.destroy({ where: { dataSubject: 'Jane Smith' } });
    });

    it('should return 400 with invalid data', async () => {
      const invalidRequest = {
        // Missing required type
        dataSubject: 'Invalid Subject',
        description: 'This is an invalid request'
      };

      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidRequest);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/requests/:id', () => {
    it('should update an existing request', async () => {
      const updatedData = {
        status: 'in_progress',
        notes: 'Processing this request'
      };

      const res = await request(app)
        .put(`/api/v1/requests/${testRequest.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toEqual('in_progress');
      expect(res.body.notes).toEqual('Processing this request');
    });

    it('should return 404 for non-existent request', async () => {
      const res = await request(app)
        .put('/api/v1/requests/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/requests/:id', () => {
    it('should delete a request', async () => {
      // Create a request to delete
      const requestToDelete = await Request.create({
        type: 'rectification',
        dataSubject: 'Request to Delete',
        contactInfo: 'delete@example.com',
        description: 'This request will be deleted',
        status: 'new',
        submittedBy: testUser.id
      });

      const res = await request(app)
        .delete(`/api/v1/requests/${requestToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify deletion
      const checkDeleted = await Request.findByPk(requestToDelete.id);
      expect(checkDeleted).toBeNull();
    });

    it('should return 404 for non-existent request', async () => {
      const res = await request(app)
        .delete('/api/v1/requests/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
