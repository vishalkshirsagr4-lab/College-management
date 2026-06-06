const Holiday = require('../models/holiday');

const createHoliday = async (req, res, next) => {
  try {
    const { title, startDate, endDate, type, notes } = req.body;
    if (!title || !startDate || !endDate) return res.status(400).json({ message: 'title, startDate, endDate required' });
    const h = await Holiday.create({ title, startDate, endDate, type, notes });
    res.status(201).json({ message: 'Holiday created', holiday: h });
  } catch (error) {
    next(error);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const list = await Holiday.find().sort({ startDate: -1 });
    res.status(200).json({ holidays: list });
  } catch (error) {
    next(error);
  }
};

module.exports = { createHoliday, getHolidays };
