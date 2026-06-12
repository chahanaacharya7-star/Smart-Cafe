const request = require('supertest');
const app = require('../src/app');
const MenuItem = require('../src/models/menuItem.model');
const Category = require('../src/models/category.model');
const User = require('../src/models/user.model');
const Cart = require('../src/models/cart.model');

describe('Cart Endpoints', () => {
  let customerToken;
  let item1;
  let item2;

  beforeEach(async () => {
    // Create customer user
    await User.create({ name: 'Customer', email: 'customer@cafe.com', password: 'password', role: 'customer' });
    const customerLogin = await request(app).post('/api/auth/login').send({ email: 'customer@cafe.com', password: 'password' });
    customerToken = customerLogin.body.data.token;

    // Create category and items
    const cat = await Category.create({ name: 'Drinks' });
    item1 = await MenuItem.create({ name: 'Coke', price: 2.5, category: cat._id, stock: 5 });
    item2 = await MenuItem.create({ name: 'Fanta', price: 2.5, category: cat._id, stock: 1 });
  });

  describe('GET /api/cart', () => {
    it('should retrieve or initialize an empty cart', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
    });
  });

  describe('POST /api/cart/add', () => {
    it('should add an item to the cart', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 2 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toEqual(1);
      expect(res.body.data.items[0].menuItem._id).toEqual(item1._id.toString());
      expect(res.body.data.items[0].quantity).toEqual(2);
    });

    it('should increment quantity when adding the same item again', async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 2 });

      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 2 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items[0].quantity).toEqual(4);
    });

    it('should block adding more than available stock (Stock Guard)', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item2._id, quantity: 2 }); // item2 stock is 1

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('items available in stock');
    });
  });

  describe('PATCH /api/cart/update', () => {
    beforeEach(async () => {
      // Add item1 (qty 2) to cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 2 });
    });

    it('should update the item quantity in cart', async () => {
      const res = await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 4 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items[0].quantity).toEqual(4);
    });

    it('should block updating beyond stock levels (Stock Guard)', async () => {
      const res = await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 10 }); // Coke stock is 5

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart/remove', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id, quantity: 2 });
    });

    it('should remove item from cart', async () => {
      const res = await request(app)
        .delete('/api/cart/remove')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ menuItemId: item1._id });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toEqual(0);
    });
  });
});
