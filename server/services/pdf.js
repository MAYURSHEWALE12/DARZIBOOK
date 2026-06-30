import { Order, Customer, Tenant, Measurement } from '../models/index.js';

export const generateBillPDF = async (orderId, tenantId) => {
  // For now this returns a placeholder. In production, use @react-pdf/renderer
  const order = await Order.findById(orderId).populate('customerId');
  const tenant = await Tenant.findById(tenantId);

  let measurements = null;
  if (order.measurementId) {
    measurements = await Measurement.findById(order.measurementId);
  }

  const billData = {
    invoiceNumber: order.invoiceNumber,
    date: order.createdAt,
    shop: {
      name: tenant.shopName,
      address: `${tenant.address?.line1}, ${tenant.address?.city}, ${tenant.address?.state}`,
      phone: tenant.phone,
      gst: tenant.gstNumber,
      logo: tenant.logo?.url,
    },
    customer: {
      name: order.customerId?.name,
      phone: order.customerId?.phone,
      address: order.customerId?.address,
    },
    order: {
      garmentType: order.garmentType,
      deliveryDate: order.deliveryDate,
      totalPrice: order.totalPrice,
      advancePaid: order.advancePaid,
      pendingAmount: order.pendingAmount,
      status: order.status,
      specialInstructions: order.specialInstructions,
    },
    measurements: measurements ? Object.fromEntries(measurements.values) : null,
  };

  // Return structured data that can be used by the frontend or puppeteer
  return billData;
};
