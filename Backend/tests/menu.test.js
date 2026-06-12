const request = require('supertest');
const app = require('../src/app');
const MenuItem = require('../src/models/menuItem.model');
const Category = require('../src/models/category.model');
const User = require('../src/models/user.model');

describe('Menu Endpoints', () => {
  let adminToken;
  let customerToken;
  let foodCategory;
  let drinksCategory;

  beforeEach(async () => {
    // Create users
    await User.create({ name: 'Admin', email: 'admin@cafe.com', password: 'password', role: 'admin' });
    await User.create({ name: 'Customer', email: 'customer@cafe.com', password: 'password', role: 'customer' });

    // Logins
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@cafe.com', password: 'password' });
    adminToken = adminLogin.body.data.token;

    const customerLogin = await request(app).post('/api/auth/login').send({ email: 'customer@cafe.com', password: 'password' });
    customerToken = customerLogin.body.data.token;

    // Create categories
    foodCategory = await Category.create({ name: 'Food' });
    drinksCategory = await Category.create({ name: 'Drinks' });
  });

  describe('POST /api/menu', () => {
    it('should allow admin to create a new menu item', async () => {
      const itemData = {
        name: 'Burger',
        description: 'Juicy chicken burger',
        price: 10,
        category: 'Food',
        stock: 50
      };

      const res = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Burger');
      expect(res.body.data.category).toBe(foodCategory._id.toString());
    });

    it('should block non-admin users from creating menu items', async () => {
      const res = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Burger', price: 10, category: 'Food' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/menu', () => {
    beforeEach(async () => {
      await MenuItem.create({ name: 'Burger', description: 'Juicy chicken burger', price: 10, category: foodCategory._id, stock: 20 });
      await MenuItem.create({ name: 'Pizza', description: 'Cheesy pepperoni pizza', price: 15, category: foodCategory._id, stock: 15 });
      await MenuItem.create({ name: 'Coca Cola', description: 'Chilled soft drink', price: 3, category: drinksCategory._id, stock: 100 });
    });

    it('should return all menu items', async () => {
      const res = await request(app).get('/api/menu');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(3);
    });

    it('should filter menu items by category name', async () => {
      const res = await request(app).get('/api/menu?category=Drinks');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(1);
      expect(res.body.data[0].name).toBe('Coca Cola');
    });

    it('should search menu items by search query', async () => {
      const res = await request(app).get('/api/menu?search=pizza');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(1);
      expect(res.body.data[0].name).toBe('Pizza');
    });
  });

  describe('PUT /api/menu/:id', () => {
    let item;

    beforeEach(async () => {
      item = await MenuItem.create({ name: 'Burger', description: 'Chicken', price: 10, category: foodCategory._id, stock: 20 });
    });

    it('should allow admin to update menu item', async () => {
      const res = await request(app)
        .put(`/api/menu/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 12, stock: 25 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.price).toBe(12);
      expect(res.body.data.stock).toBe(25);
    });

    it('should block non-admin from updating menu item', async () => {
      const res = await request(app)
        .put(`/api/menu/${item._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 12 });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/menu/:id', () => {
    let item;

    beforeEach(async () => {
      item = await MenuItem.create({ name: 'Burger', description: 'Chicken', price: 10, category: foodCategory._id, stock: 20 });
    });

    it('should allow admin to delete menu item', async () => {
      const res = await request(app)
        .delete(`/api/menu/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      const dbItem = await MenuItem.findById(item._id);
      expect(dbItem).toBeNull();
    });

    it('should block non-admin from deleting menu item', async () => {
      const res = await request(app)
        .delete(`/api/menu/${item._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});
