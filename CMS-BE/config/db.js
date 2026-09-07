require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'jhamtani',
  process.env.DB_USER || 'axat',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    require('../models');
    await sequelize.sync({ alter: true });

    const Admin = require('../models/Admin');
    const existing = await Admin.countDocuments();
    if (existing === 0) {
      await Admin.create({
        name: 'Admin',
        email: 'admin@jhamtani.com',
        password: 'admin123',
      });
      console.log('Seeded local admin:  admin@jhamtani.com / admin123');
    }

    console.log(`PostgreSQL connected (${process.env.DB_NAME || 'jhamtani'})`);
  } catch (err) {
    console.error('PostgreSQL connection failed', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
