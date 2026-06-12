const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'delivered'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['eSewa', 'Khalti', 'COD'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true }
  }
}, { timestamps: true });

// Indexes as requested in Week 5 (orders.user, orders.status, orders.createdAt)
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
