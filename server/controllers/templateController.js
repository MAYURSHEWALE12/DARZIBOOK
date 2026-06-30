import { z } from 'zod';
import { MeasurementTemplate } from '../models/index.js';

const templateSchema = z.object({
  garmentType: z.string().min(1),
  fields: z.array(z.object({
    key: z.string().min(1),
    labelEn: z.string().min(1),
    labelHi: z.string().optional().default(''),
    labelMr: z.string().optional().default(''),
  })).min(1),
});

export const listTemplates = async (req, res) => {
  const templates = await MeasurementTemplate.find({ tenantId: req.tenantId }).sort({ isDefault: -1, garmentType: 1 });
  res.json({ templates });
};

export const createTemplate = async (req, res) => {
  const data = templateSchema.parse(req.body);
  const existing = await MeasurementTemplate.findOne({ tenantId: req.tenantId, garmentType: data.garmentType });
  if (existing) return res.status(400).json({ error: 'Template for this garment type already exists' });

  const template = await MeasurementTemplate.create({ tenantId: req.tenantId, ...data });
  res.status(201).json({ template });
};

export const updateTemplate = async (req, res) => {
  const template = await MeasurementTemplate.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!template) return res.status(404).json({ error: 'Template not found' });
  if (template.isDefault) return res.status(403).json({ error: 'Cannot edit default templates' });

  const data = templateSchema.partial().parse(req.body);
  Object.assign(template, data);
  await template.save();
  res.json({ template });
};

export const deleteTemplate = async (req, res) => {
  const template = await MeasurementTemplate.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!template) return res.status(404).json({ error: 'Template not found' });
  if (template.isDefault) return res.status(403).json({ error: 'Cannot delete default templates' });

  await template.deleteOne();
  res.json({ message: 'Template deleted' });
};
