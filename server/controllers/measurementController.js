import { z } from 'zod';
import { Measurement, MeasurementTemplate } from '../models/index.js';

const measurementSchema = z.object({
  customerId: z.string(),
  templateId: z.string(),
  garmentType: z.string().min(1),
  values: z.any().optional(),
  notes: z.string().optional().default(''),
  date: z.string().optional(),
});

export const listCustomerMeasurements = async (req, res) => {
  const measurements = await Measurement.find({
    tenantId: req.tenantId,
    customerId: req.params.customerId,
  }).sort({ date: -1 });
  res.json({ measurements });
};

export const listAllMeasurements = async (req, res) => {
  const query = { tenantId: req.tenantId };
  // Search could be implemented by joining with Customer, but for simplicity, we populate customerId.
  // The client can search locally if needed, or we just populate and sort.
  const measurements = await Measurement.find(query)
    .populate('customerId', 'name phone')
    .sort({ date: -1 });
  res.json({ measurements });
};

export const createMeasurement = async (req, res) => {
  try {
    const data = measurementSchema.parse(req.body);
    
    let parsedValues = {};
    if (typeof data.values === 'string') {
      try { parsedValues = JSON.parse(data.values); } catch (e) {}
    } else {
      parsedValues = data.values || {};
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }

    const existingMeasurement = await Measurement.findOne({
      tenantId: req.tenantId,
      customerId: data.customerId,
      garmentType: data.garmentType
    });
    
    if (existingMeasurement) {
      return res.status(400).json({ error: `A measurement for ${data.garmentType} already exists for this customer. Please edit the existing one.` });
    }

    const measurement = await Measurement.create({
      tenantId: req.tenantId,
      customerId: data.customerId,
      templateId: data.templateId,
      garmentType: data.garmentType,
      values: parsedValues,
      notes: data.notes,
      image: imageUrl,
      date: data.date || new Date(),
    });
    res.status(201).json({ measurement });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};

export const getMeasurement = async (req, res) => {
  const measurement = await Measurement.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!measurement) return res.status(404).json({ error: 'Measurement not found' });
  res.json({ measurement });
};

export const updateMeasurement = async (req, res) => {
  try {
    const data = measurementSchema.partial().parse(req.body);
    
    let parsedValues = undefined;
    if (data.values !== undefined) {
      if (typeof data.values === 'string') {
        try { parsedValues = JSON.parse(data.values); } catch (e) {}
      } else {
        parsedValues = data.values;
      }
    }

    const updateData = { ...data };
    if (parsedValues !== undefined) updateData.values = parsedValues;
    if (req.file) {
      updateData.image = req.file.path;
    }

    const measurement = await Measurement.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updateData,
      { new: true }
    );
    if (!measurement) return res.status(404).json({ error: 'Measurement not found' });
    res.json({ measurement });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};
