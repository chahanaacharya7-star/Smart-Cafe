const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');

describe('Auth Endpoints', () => {
  const adminUser = {
    name: 'Admin User',
    email: 'admin@cafe.com',
    password: 'password123',
    role: 'admin'
  };

  const customerUser = {
    name: 'Customer User',
    email: 'customer@cafe.com',
    password: 'password123',
    role: 'customer'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new customer user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(customerUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe(customerUser.email);
      expect(res.body.data.role).toBe('customer');

      const user = await User.findOne({ email: customerUser.email });
      expect(user).toBeTruthy();
    });

    it('should fail registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'no-name@cafe.com', password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail registration with duplicate email', async () => {
      await User.create(customerUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(customerUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(customerUser);
    });

    it('should login user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: customerUser.email,
          password: customerUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: customerUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      await User.create(customerUser);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: customerUser.email, password: customerUser.password });
      token = loginRes.body.data.token;
    });

    it('should return profile for authorized user', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(customerUser.email);
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PATCH /api/admin/users/:id/role', () => {
    let adminToken;
    let customerToken;
    let targetUser;

    beforeEach(async () => {
      await User.create(adminUser);
      await User.create(customerUser);
      targetUser = await User.create({
        name: 'Target User',
        email: 'target@cafe.com',
        password: 'password123'
      });

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });
      adminToken = adminLogin.body.data.token;

      const customerLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: customerUser.email, password: customerUser.password });
      customerToken = customerLogin.body.data.token;
    });

    it('should promote customer to admin when called by an admin', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${targetUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');

      const updatedUser = await User.findById(targetUser._id);
      expect(updatedUser.role).toBe('admin');
    });

    it('should block non-admin users from changing roles', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${targetUser._id}/role`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });
  });
});
