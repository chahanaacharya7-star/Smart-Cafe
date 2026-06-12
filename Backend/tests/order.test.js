const request = require('supertest');
const app = require('../src/app');
const MenuItem = require('../src/models/menuItem.model');
const Category = require('../src/models/category.model');
const User = require('../src/models/user.model');
const Cart = require('../src/models/cart.model');
const Order = require('../src/models/order.model');

describe('Order & Payment Endpoints', () => {
  let adminToken;
  let customerToken;
  let otherCustomerToken;
  let customerUser;
  let cokeItem;

  beforeEach(async () => {
    // Users
    await User.create({ name: 'Admin', email: 'admin@cafe.com', password: 'password', role: 'admin' });
    customerUser = await User.create({ name: 'Customer', email: 'customer@cafe.com', password: 'password', role: 'customer' });
    await User.create({ name: 'Other', email: 'other@cafe.com', password: 'password', role: 'customer' });

    // Logins
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@cafe.com', password: 'password' });
    adminToken = adminLogin.body.data.token;

    const customerLogin = await request(app).post('/api/auth/login').send({ email: 'customer@cafe.com', password: 'password' });
    customerToken = customerLogin.body.data.token;

    const otherLogin = await request(app).post('/api/auth/login').send({ email: 'other@cafe.com', password: 'password' });
    otherCustomerToken = otherLogin.body.data.token;

    // Menu Item
    const cat = await Category.create({ name: 'Drinks' });
    cokeItem = await MenuItem.create({ name: 'Coke', price: 2.0, category: cat._id, stock: 10 });
  });

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      // Add coke to cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: cokeItem._id, quantity: 2 });
    });

    it('should place an order successfully, reduce stock, and clear cart', async () => {
      const payload = {
        paymentMethod: 'COD',
        deliveryAddress: {
          street: 'Kapan',
          city: 'Kathmandu',
          phone: '9841234567'
        }
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAmount).toEqual(4); // 2 * $2.0
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.paymentStatus).toBe('Pending');

      // Verify stock reduced
      const updatedItem = await MenuItem.findById(cokeItem._id);
      expect(updatedItem.stock).toEqual(8); // 10 - 2

      // Verify cart cleared
      const cart = await Cart.findOne({ user: customerUser._id });
      expect(cart.items.length).toEqual(0);
    });

    it('should fail order placement if cart is empty', async () => {
      const payload = {
        paymentMethod: 'COD',
        deliveryAddress: { street: 'Kapan', city: 'Kathmandu', phone: '9841234567' }
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${otherCustomerToken}`) // other customer cart is empty
        .send(payload);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        user: customerUser._id,
        items: [{ menuItem: cokeItem._id, quantity: 2, price: 2.0 }],
        totalAmount: 4.0,
        paymentMethod: 'COD',
        deliveryAddress: { street: 'Kapan', city: 'Kathmandu', phone: '9841234567' }
      });
    });

    it('should allow admin to update order status and trigger email on READY', async () => {
      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ready' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('ready');

      expect(global.sentEmails.length).toEqual(1);
      expect(global.sentEmails[0].to).toBe(customerUser.email);
      expect(global.sentEmails[0].subject).toContain('READY');
    });

    it('should block non-admin from updating status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'ready' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('POST /api/payment/esewa & khalti callbacks', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        user: customerUser._id,
        items: [{ menuItem: cokeItem._id, quantity: 2, price: 2.0 }],
        totalAmount: 4.0,
        paymentMethod: 'eSewa',
        deliveryAddress: { street: 'Kapan', city: 'Kathmandu', phone: '9841234567' }
      });
    });

    it('should update payment status to Paid on successful eSewa callback', async () => {
      const res = await request(app)
        .post('/api/payment/esewa')
        .send({ orderId: order._id, status: 'success' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('Paid');

      const dbOrder = await Order.findById(order._id);
      expect(dbOrder.paymentStatus).toBe('Paid');
    });

    it('should update payment status to Failed on failed Khalti callback', async () => {
      const res = await request(app)
        .post('/api/payment/khalti')
        .send({ orderId: order._id, status: 'failed' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('Failed');
    });
  });

  describe('Rate Limiting (Samratt Week 5 Task 4)', () => {
    beforeEach(() => {
      global.enableRateLimitTests = true;
    });

    afterEach(() => {
      global.enableRateLimitTests = false;
    });

    it('should block payment requests after exceeding limits (5 requests)', async () => {
      // Make 5 successful mock requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/payment/esewa')
          .send({ orderId: '507f1f77bcf86cd799439011', status: 'success' });
      }

      // The 6th should fail with 429
      const res = await request(app)
        .post('/api/payment/esewa')
        .send({ orderId: '507f1f77bcf86cd799439011', status: 'success' });

      expect(res.statusCode).toEqual(429);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Too many payment requests');
    });
  });

  describe('Global Async Error Handler (Samratt Week 4 Task 3)', () => {
    it('should catch unhandled async controller exceptions via express-async-errors', async () => {
      const res = await request(app).get('/api/test-async-error');
      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Test async error caught by express-async-errors');
    });
  });
});
