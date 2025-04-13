const request = require('supertest');
const { app } = require('../src/server');
const { User, RiskAnalysis } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Risk Analysis API Endpoints', () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;
  let testRiskAnalysis;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      username: 'riskuser',
      email: 'riskuser@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active'
    });

    adminUser = await User.create({
      username: 'riskadmin',
      email: 'riskadmin@example.com',
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

    // Create a test risk analysis
    testRiskAnalysis = await RiskAnalysis.create({
      name: 'Test Risk Analysis',
      description: 'This is a test risk analysis',
      status: 'draft',
      createdBy: testUser.id,
      assets: JSON.stringify([
        { name: 'Customer Database', description: 'Database containing customer information' }
      ]),
      threats: JSON.stringify([
        { name: 'Data Breach', description: 'Unauthorized access to data', probability: 'medium', impact: 'high' }
      ]),
      securityMeasures: JSON.stringify([
        { name: 'Encryption', description: 'Data encryption at rest and in transit', status: 'implemented' }
      ])
    });
  });

  afterAll(async () => {
    // Clean up test data
    await RiskAnalysis.destroy({ where: { name: 'Test Risk Analysis' } });
    await User.destroy({ where: { username: 'riskuser' } });
    await User.destroy({ where: { username: 'riskadmin' } });
  });

  describe('GET /api/v1/risk-analysis', () => {
    it('should return all risk analyses for admin user', async () => {
      const res = await request(app)
        .get('/api/v1/risk-analysis')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return only accessible risk analyses for regular user', async () => {
      const res = await request(app)
        .get('/api/v1/risk-analysis')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/risk-analysis');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/risk-analysis/:id', () => {
    it('should return a risk analysis by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/risk-analysis/${testRiskAnalysis.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual('Test Risk Analysis');
    });

    it('should return 404 for non-existent risk analysis', async () => {
      const res = await request(app)
        .get('/api/v1/risk-analysis/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/risk-analysis', () => {
    it('should create a new risk analysis', async () => {
      const newRiskAnalysis = {
        name: 'New Test Risk Analysis',
        description: 'This is a new test risk analysis',
        status: 'draft',
        assets: [
          { name: 'Employee Database', description: 'Database containing employee information' }
        ],
        threats: [
          { name: 'Insider Threat', description: 'Malicious insider access', probability: 'low', impact: 'high' }
        ],
        securityMeasures: [
          { name: 'Access Control', description: 'Role-based access control', status: 'planned' }
        ]
      };

      const res = await request(app)
        .post('/api/v1/risk-analysis')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newRiskAnalysis);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual('New Test Risk Analysis');

      // Clean up
      await RiskAnalysis.destroy({ where: { name: 'New Test Risk Analysis' } });
    });

    it('should return 400 with invalid data', async () => {
      const invalidRiskAnalysis = {
        // Missing required name
        description: 'This is an invalid risk analysis',
        status: 'draft'
      };

      const res = await request(app)
        .post('/api/v1/risk-analysis')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidRiskAnalysis);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/risk-analysis/:id', () => {
    it('should update an existing risk analysis', async () => {
      const updatedData = {
        name: 'Updated Test Risk Analysis',
        status: 'completed'
      };

      const res = await request(app)
        .put(`/api/v1/risk-analysis/${testRiskAnalysis.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual('Updated Test Risk Analysis');
      expect(res.body.status).toEqual('completed');
    });

    it('should return 404 for non-existent risk analysis', async () => {
      const res = await request(app)
        .put('/api/v1/risk-analysis/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/risk-analysis/:id', () => {
    it('should delete a risk analysis', async () => {
      // Create a risk analysis to delete
      const riskAnalysisToDelete = await RiskAnalysis.create({
        name: 'Risk Analysis to Delete',
        description: 'This risk analysis will be deleted',
        status: 'draft',
        createdBy: testUser.id
      });

      const res = await request(app)
        .delete(`/api/v1/risk-analysis/${riskAnalysisToDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify deletion
      const checkDeleted = await RiskAnalysis.findByPk(riskAnalysisToDelete.id);
      expect(checkDeleted).toBeNull();
    });

    it('should return 404 for non-existent risk analysis', async () => {
      const res = await request(app)
        .delete('/api/v1/risk-analysis/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
