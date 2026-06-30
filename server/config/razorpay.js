console.log('Razorpay not configured — using mock mode');

const razorpay = {
  orders: {
    create: async (options) => ({
      id: `mock_order_${Date.now()}`,
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'created',
    }),
  },
};

export default razorpay;