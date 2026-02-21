const Expense = require('../models/Expense');

// @desc    Get all expenses
exports.getExpenses = async (req, res, next) => {
    try {
        const { vehicle, category, trip } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;
        if (category) filter.category = category;
        if (trip) filter.trip = trip;

        const expenses = await Expense.find(filter)
            .populate('vehicle', 'name licensePlate')
            .populate('trip', 'origin destination')
            .sort({ date: -1 });
        res.json({ success: true, count: expenses.length, data: expenses });
    } catch (err) {
        next(err);
    }
};

// @desc    Create expense
exports.createExpense = async (req, res, next) => {
    try {
        const expense = await Expense.create(req.body);
        const populated = await Expense.findById(expense._id).populate('vehicle', 'name licensePlate');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Update expense
exports.updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('vehicle', 'name licensePlate');
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: expense });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete expense
exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
