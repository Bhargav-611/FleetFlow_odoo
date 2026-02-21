const FuelLog = require('../models/FuelLog');

// @desc    Get all fuel logs
exports.getFuelLogs = async (req, res, next) => {
    try {
        const { vehicle, trip } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;
        if (trip) filter.trip = trip;

        const logs = await FuelLog.find(filter)
            .populate('vehicle', 'name licensePlate')
            .populate('trip', 'origin destination')
            .sort({ date: -1 });
        res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        next(err);
    }
};

// @desc    Create fuel log
exports.createFuelLog = async (req, res, next) => {
    try {
        const log = await FuelLog.create(req.body);
        const populated = await FuelLog.findById(log._id)
            .populate('vehicle', 'name licensePlate')
            .populate('trip', 'origin destination');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Update fuel log
exports.updateFuelLog = async (req, res, next) => {
    try {
        const log = await FuelLog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('vehicle', 'name licensePlate');
        if (!log) return res.status(404).json({ success: false, message: 'Fuel log not found' });
        res.json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete fuel log
exports.deleteFuelLog = async (req, res, next) => {
    try {
        const log = await FuelLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ success: false, message: 'Fuel log not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
