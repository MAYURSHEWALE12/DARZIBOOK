import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Plan, SuperAdmin } from './models/index.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Seed Plans
    const plans = [
      {
        name: 'basic',
        priceMonthly: 0,
        priceYearly: 0,
        trialDays: 14,
        limits: {
          maxCustomers: 50,
          maxPhotosPerOrder: 3,
          maxGarmentTypes: 5,
          languages: ['en'],
          whatsappShare: false,
          pdfExport: false,
          fullReports: false,
        },
      },
      {
        name: 'pro',
        priceMonthly: 499,
        priceYearly: 4999,
        trialDays: 14,
        limits: {
          maxCustomers: 500,
          maxPhotosPerOrder: 10,
          maxGarmentTypes: 20,
          languages: ['en', 'hi', 'mr'],
          whatsappShare: true,
          pdfExport: true,
          fullReports: true,
        },
      },
      {
        name: 'enterprise',
        priceMonthly: 1499,
        priceYearly: 14999,
        trialDays: 14,
        limits: {
          maxCustomers: -1,
          maxPhotosPerOrder: -1,
          maxGarmentTypes: -1,
          languages: ['en', 'hi', 'mr'],
          whatsappShare: true,
          pdfExport: true,
          fullReports: true,
        },
      },
    ];

    for (const plan of plans) {
      await Plan.findOneAndUpdate({ name: plan.name }, plan, { upsert: true, new: true });
    }
    console.log('Plans seeded successfully');

    // Seed Super Admin
    const existingAdmin = await SuperAdmin.findOne({ email: 'admin@darzibook.com' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 12);
      await SuperAdmin.create({
        email: 'admin@darzibook.com',
        passwordHash,
      });
      console.log('Super admin created: admin@darzibook.com / admin123');
    } else {
      console.log('Super admin already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
