import { Notification, Order } from '../models/index.js';

// Lazy Evaluation: Generate notifications dynamically when fetched
const generateSystemNotifications = async (tenantId) => {
  const now = new Date();
  
  // 1. Check for delayed orders
  // deliveryDate < now AND status is not 'delivered' or 'ready'
  const delayedOrders = await Order.find({
    tenantId,
    deliveryDate: { $lt: now },
    status: { $in: ['received', 'in_progress'] }
  });

  for (const order of delayedOrders) {
    const exists = await Notification.exists({ tenantId, orderId: order._id, type: 'delayed' });
    if (!exists) {
      await Notification.create({
        tenantId,
        orderId: order._id,
        type: 'delayed',
        message: `Order ${order.invoiceNumber} is delayed. Delivery was scheduled for ${order.deliveryDate.toLocaleDateString()}.`
      });
    }
  }

  // 2. Check for missed pickups
  // deliveryDate < now AND status is 'ready'
  const missedPickups = await Order.find({
    tenantId,
    deliveryDate: { $lt: now },
    status: 'ready'
  });

  for (const order of missedPickups) {
    const exists = await Notification.exists({ tenantId, orderId: order._id, type: 'missed_pickup' });
    if (!exists) {
      await Notification.create({
        tenantId,
        orderId: order._id,
        type: 'missed_pickup',
        message: `Order ${order.invoiceNumber} is ready but hasn't been picked up.`
      });
    }
  }
  // 3. Check for upcoming deliveries (within next 2 days)
  const inTwoDays = new Date(now);
  inTwoDays.setDate(inTwoDays.getDate() + 2);

  const upcomingOrders = await Order.find({
    tenantId,
    deliveryDate: { $gt: now, $lte: inTwoDays },
    status: { $in: ['received', 'in_progress'] }
  }).populate('customerId', 'name');

  for (const order of upcomingOrders) {
    const exists = await Notification.exists({ tenantId, orderId: order._id, type: 'upcoming' });
    if (!exists) {
      const customerName = order.customerId?.name || 'Customer';
      await Notification.create({
        tenantId,
        orderId: order._id,
        type: 'upcoming',
        message: `Upcoming delivery for ${customerName} (Order ${order.invoiceNumber}) in 2 days or less.`
      });
    }
  }
};

export const getNotifications = async (req, res) => {
  try {
    await generateSystemNotifications(req.tenantId);
    
    // Auto-delete notifications older than 30 days to save space
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await Notification.deleteMany({ tenantId: req.tenantId, createdAt: { $lt: thirtyDaysAgo } });

    const notifications = await Notification.find({ tenantId: req.tenantId })
      .populate('orderId', 'invoiceNumber customerId deliveryDate')
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50

    const unreadCount = await Notification.countDocuments({ tenantId: req.tenantId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Notification Error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { tenantId: req.tenantId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};
