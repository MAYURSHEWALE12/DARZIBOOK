import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenant, MeasurementTemplate } from './models/index.js';

dotenv.config();

const shirtFields = [
  { key: 'chest', labelEn: 'Chest', labelHi: 'छाती', labelMr: 'छाती' },
  { key: 'waist', labelEn: 'Waist', labelHi: 'कमर', labelMr: 'कंबर' },
  { key: 'shoulder', labelEn: 'Shoulder', labelHi: 'कंधा', labelMr: 'खांदा' },
  { key: 'sleeve', labelEn: 'Sleeve Length', labelHi: 'आस्तीन की लंबाई', labelMr: 'बाहीची लांबी' },
  { key: 'length', labelEn: 'Shirt Length', labelHi: 'कमीज़ की लंबाई', labelMr: 'शर्टची लांबी' },
  { key: 'neck', labelEn: 'Neck', labelHi: 'गर्दन', labelMr: 'मान' },
  { key: 'armhole', labelEn: 'Armhole', labelHi: 'बगल', labelMr: 'बगल' },
  { key: 'cuff', labelEn: 'Cuff', labelHi: 'कफ', labelMr: 'कफ' },
];

const pantFields = [
  { key: 'waist', labelEn: 'Waist', labelHi: 'कमर', labelMr: 'कंबर' },
  { key: 'length', labelEn: 'Pant Length', labelHi: 'पैंट की लंबाई', labelMr: 'पँटची लांबी' },
  { key: 'hip', labelEn: 'Hip', labelHi: 'कूल्हा', labelMr: 'नितंब' },
  { key: 'thigh', labelEn: 'Thigh', labelHi: 'जांघ', labelMr: 'मांडी' },
  { key: 'knee', labelEn: 'Knee', labelHi: 'घुटना', labelMr: 'गुडघा' },
  { key: 'bottom', labelEn: 'Bottom', labelHi: 'पाय का घेरा', labelMr: 'तळाचा घेर' },
  { key: 'inseam', labelEn: 'Inseam', labelHi: 'आंतरिक सीम', labelMr: 'आतील शिवण' },
];

const genericTopFields = [
  { key: 'length', labelEn: 'Length', labelHi: 'लंबाई', labelMr: 'लांबी' },
  { key: 'chest', labelEn: 'Chest', labelHi: 'छाती', labelMr: 'छाती' },
  { key: 'waist', labelEn: 'Waist', labelHi: 'कमर', labelMr: 'कंबर' },
  { key: 'shoulder', labelEn: 'Shoulder', labelHi: 'कंधा', labelMr: 'खांदा' },
  { key: 'sleeve', labelEn: 'Sleeve', labelHi: 'आस्तीन', labelMr: 'बाही' },
  { key: 'neck', labelEn: 'Neck', labelHi: 'गर्दन', labelMr: 'मान' },
];

const newTemplates = [
  { type: 'kurta', fields: genericTopFields },
  { type: 'paijama', fields: pantFields },
  { type: 'nawabi', fields: genericTopFields },
  { type: 'jacket', fields: genericTopFields },
  { type: 'modi_jacket', fields: genericTopFields },
  { type: 'blazer', fields: genericTopFields },
  { type: 'apple_cut_shirt', fields: shirtFields },
  { type: 'pathani', fields: genericTopFields },
  { type: 'jodhpuri', fields: genericTopFields },
  { type: 'sherwani', fields: genericTopFields },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const tenants = await Tenant.find({});
    
    for (const tenant of tenants) {
      for (const tpl of newTemplates) {
        await MeasurementTemplate.updateOne(
          { tenantId: tenant._id, garmentType: tpl.type },
          { $setOnInsert: { fields: tpl.fields, isDefault: true } },
          { upsert: true }
        );
      }
    }
    console.log('Done adding new templates to all tenants!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
