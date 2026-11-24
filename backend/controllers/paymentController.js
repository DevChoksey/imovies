const Payment = require('../models/Payment');

// @desc    Process simulated payment
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, cardDetails, upiId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Simulate gateway delay and verification
    const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        transactionId,
        amount,
        paymentMethod: paymentMethod || 'card',
        cardLast4: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242',
        upiId: upiId || '',
        status: 'success',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user payments
// @route   GET /api/payments/my-payments
// @access  Private
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('booking')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getMyPayments,
};
