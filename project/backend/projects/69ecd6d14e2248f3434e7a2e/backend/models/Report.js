/*
UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION

This schema defines the structure for generating reports. It is based on the existing database models and the fields defined in the 'reports' table (not provided, but assumed to guide field inclusion).

The schema leverages existing models: User, Product, Order, OrderItem, and Payment.  It does *not* create new models, but rather defines how to access and combine data from these existing models for reporting purposes.

Note: This is a conceptual schema for report generation. Actual implementation would involve querying the database and transforming the data as needed.  The 'reports' table structure would dictate the exact fields included and how they are aggregated.

*/

const db = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');

// Example Report Schemas (Illustrative - based on assumed report requirements)

// 1. Sales Report Schema
//   - Total Sales by Product
//   - Total Sales by Date
//   - Total Sales by User (if applicable - e.g., for affiliate programs)

const salesReportSchema = {
  reportType: 'sales',
  dateRange: { type: 'dateRange', required: true },
  totalSales: { type: 'number' },
  salesByProduct: [
    {
      productId: { type: 'number', references: Product.id },
      productName: { type: 'string', references: Product.name },
      quantitySold: { type: 'number' },
      revenue: { type: 'number' }
    }
  ],
  salesByDate: [
    {
      date: { type: 'date' },
      totalRevenue: { type: 'number' }
    }
  ],
  salesByUser: [
    {
      userId: { type: 'number', references: User.id },
      username: { type: 'string', references: User.username },
      totalRevenue: { type: 'number' }
    }
  ]
};

// 2. Inventory Report Schema
//   - Products with Low Stock
//   - Total Inventory Value

const inventoryReportSchema = {
  reportType: 'inventory',
  dateGenerated: { type: 'date', default: Date.now },
  lowStockProducts: [
    {
      productId: { type: 'number', references: Product.id },
      productName: { type: 'string', references: Product.name },
      stockLevel: { type: 'number', references: Product.stock },
      reorderPoint: { type: 'number' } // Assuming a reorder point exists
    }
  ],
  totalInventoryValue: { type: 'number' }
};

// 3. User Activity Report Schema
//   - Number of Orders per User
//   - Total Spending per User

const userActivityReportSchema = {
  reportType: 'user_activity',
  dateRange: { type: 'dateRange', required: true },
  userActivity: [
    {
      userId: { type: 'number', references: User.id },
      username: { type: 'string', references: User.username },
      orderCount: { type: 'number' },
      totalSpent: { type: 'number' }
    }
  ]
};

// 4. Order Status Report Schema
//   - Orders by Status (e.g., Pending, Shipped, Delivered)

const orderStatusReportSchema = {
  reportType: 'order_status',
  dateRange: { type: 'dateRange', required: true },
  ordersByStatus: [
    {
      status: { type: 'string', references: Order.status },
      orderCount: { type: 'number' },
      totalRevenue: { type: 'number' }
    }
  ]
};

// 5. Payment Report Schema
//   - Total Payments Received
//   - Payments by Method

const paymentReportSchema = {
  reportType: 'payment',
  dateRange: { type: 'dateRange', required: true },
  totalPaymentsReceived: { type: 'number' },
  paymentsByMethod: [
    {
      paymentMethod: { type: 'string' }, // Assuming a paymentMethod field exists in Payment
      totalAmount: { type: 'number' }
    }
  ]
};

// Export the schemas (or a combined schema if appropriate)
module.exports = {
  salesReportSchema,
  inventoryReportSchema,
  userActivityReportSchema,
  orderStatusReportSchema,
  paymentReportSchema
};