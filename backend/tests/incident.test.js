const request = require('supertest');
const { app } = require('../src/server');
const { User, Incident } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Incident API Endpoints', () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;
  let testIncident;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      username: 'incidentuser',
      email: 'incidentuser@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active'
    });

    adminUser = await User.create({
      username: 'incidentadmin',
      email: 'incidentadmin@example.com',
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

    // Create a test incident
    testIncident = await Incident.create({
      title: 'Test Incident',
      description: 'This is a test incident',
      severity: 'medium',
      status: 'new',
      reportedBy: testUser.id,
      affectedData: 'Personal data',
      actions: 'Initial investigation'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Incident.destroy({ where: { title: 'Test Incident' } });
    await User.destroy({ where: { username: 'incidentuser' } });
    await User.destroy({ where: { username: 'incidentadmin' } });
  });

  describe('GET /api/v1/incidents', () => {
    it('should return all incidents for admin user', async () => {
      const res = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return only accessible incidents for regular user', async () => {
      const res = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/incidents');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/incidents/:id', () => {
    it('should return an incident by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/incidents/${testIncident.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('Test Incident');
    });

    it('should return 404 for non-existent incident', async () => {
      const res = await request(app)
        .get('/api/v1/incidents/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/incidents', () => {
    it('should create a new incident', async () => {
      const newIncident = {
        title: 'New Test Incident',
        description: 'This is a new test incident',
        severity: 'high',
        affectedData: 'Customer data',
        actions: 'Immediate investigation'
      };

      const res = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newIncident);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('New Test Incident');

      // Clean up
      await Incident.destroy({ where: { title: 'New Test Incident' } });
    });

    it('should return 400 with invalid data', async () => {
      const invalidIncident = {
        // Missing required title
        description: 'This is an invalid incident',
        severity: 'low'
      };

      const res = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidIncident);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/incidents/:id', () => {
    it('should update an existing incident', async () => {
      const updatedData = {
        title: 'Updated Test Incident',
        severity: 'high',
        status: 'in_progress'
      };

      const res = await request(app)
        .put(`/api/v1/incidents/${testIncident.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('Updated Test Incident');
      expect(res.body.status).toEqual('in_progress');
    });

    it('should return 404 for non-existent incident', async () => {
      const res = await request(app)
        .put('/api/v1/incidents/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/incidents/:id', () => {
    it('should delete an incident', async () => {
      // Create an incident to delete
      const incidentToDelete = await Incident.create({
        title: 'Incident to Delete',
        description: 'This incident will be deleted',
        severity: 'low',
        status: 'new',
        reportedBy: testUser.id
      });

      const res = await request(app)
        .delete(`/api/v1/incidents/${incidentToDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify deletion
      const checkDeleted = await Incident.findByPk(incidentToDelete.id);
      expect(checkDeleted).toBeNull();
    });

    it('should return 404 for non-existent incident', async () => {
      const res = await request(app)
        .delete('/api/v1/incidents/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
