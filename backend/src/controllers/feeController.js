const Fee = require('../models/fee');
const Student = require('../models/student');

const createFee = async (req, res, next) => {
  try {
    const { studentId, amount, status, paymentDate } = req.body;
    if (!studentId || amount == null || !status) {
      return res.status(400).json({ message: 'studentId, amount, and status are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fee = await Fee.create({ studentId, amount, status, paymentDate });
    res.status(201).json({ message: 'Fee record created', fee });
  } catch (error) {
    next(error);
  }
};

const getFees = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      const fees = await Fee.find({ studentId: student._id });
      return res.status(200).json({ fees });
    }

    const fees = await Fee.find().populate('studentId', 'usn semester section');
    res.status(200).json({ fees });
  } catch (error) {
    next(error);
  }
};

const getFeeById = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('studentId', 'usn semester section');
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student || fee.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.status(200).json({ fee });
  } catch (error) {
    next(error);
  }
};

const updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    fee.amount = req.body.amount == null ? fee.amount : req.body.amount;
    fee.status = req.body.status || fee.status;
    fee.paymentDate = req.body.paymentDate || fee.paymentDate;

    await fee.save();
    res.status(200).json({ message: 'Fee updated', fee });
  } catch (error) {
    next(error);
  }
};

const deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    await fee.remove();
    res.status(200).json({ message: 'Fee record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
};