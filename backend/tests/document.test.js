const request = require('supertest');
const { app } = require('../src/server');
const { User, Document } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Document API Endpoints', () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;
  let testDocument;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      username: 'docuser',
      email: 'docuser@example.com',
      password: 'Password123!',
      role: 'user',
      status: 'active'
    });

    adminUser = await User.create({
      username: 'docadmin',
      email: 'docadmin@example.com',
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

    // Create a test document
    testDocument = await Document.create({
      title: 'Test Document',
      description: 'This is a test document',
      content: 'Test content',
      category: 'policy',
      status: 'draft',
      createdBy: testUser.id
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Document.destroy({ where: { title: 'Test Document' } });
    await User.destroy({ where: { username: 'docuser' } });
    await User.destroy({ where: { username: 'docadmin' } });
  });

  describe('GET /api/v1/documents', () => {
    it('should return all documents for admin user', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return only accessible documents for regular user', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/documents');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('should return a document by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('Test Document');
    });

    it('should return 404 for non-existent document', async () => {
      const res = await request(app)
        .get('/api/v1/documents/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/documents', () => {
    it('should create a new document', async () => {
      const newDocument = {
        title: 'New Test Document',
        description: 'This is a new test document',
        content: 'New test content',
        category: 'procedure',
        status: 'draft'
      };

      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newDocument);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('New Test Document');

      // Clean up
      await Document.destroy({ where: { title: 'New Test Document' } });
    });

    it('should return 400 with invalid data', async () => {
      const invalidDocument = {
        // Missing required title
        description: 'This is an invalid document',
        content: 'Invalid content'
      };

      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidDocument);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/documents/:id', () => {
    it('should update an existing document', async () => {
      const updatedData = {
        title: 'Updated Test Document',
        description: 'This is an updated test document'
      };

      const res = await request(app)
        .put(`/api/v1/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('Updated Test Document');
    });

    it('should return 404 for non-existent document', async () => {
      const res = await request(app)
        .put('/api/v1/documents/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/documents/:id', () => {
    it('should delete a document', async () => {
      // Create a document to delete
      const documentToDelete = await Document.create({
        title: 'Document to Delete',
        description: 'This document will be deleted',
        content: 'Delete me',
        category: 'policy',
        status: 'draft',
        createdBy: testUser.id
      });

      const res = await request(app)
        .delete(`/api/v1/documents/${documentToDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify deletion
      const checkDeleted = await Document.findByPk(documentToDelete.id);
      expect(checkDeleted).toBeNull();
    });

    it('should return 404 for non-existent document', async () => {
      const res = await request(app)
        .delete('/api/v1/documents/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
