const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// @desc    Get all maintenance logs
exports.getMaintenanceLogs = async (req, res, next) => {
    try {
        const { vehicle, status } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;
        if (status) filter.status = status;

        const logs = await MaintenanceLog.find(filter)
            .populate('vehicle', 'name licensePlate')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        next(err);
    }
};

// @desc    Create maintenance log → vehicle becomes In Shop
exports.createMaintenanceLog = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.body.vehicle);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

        // Set vehicle to In Shop
        vehicle.status = 'In Shop';
        await vehicle.save();

        const log = await MaintenanceLog.create(req.body);
        const populated = await MaintenanceLog.findById(log._id).populate('vehicle', 'name licensePlate');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Complete maintenance → vehicle returns to Available
exports.completeMaintenanceLog = async (req, res, next) => {
    try {
        const log = await MaintenanceLog.findById(req.params.id);
        if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found' });
        if (log.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Maintenance already completed' });
        }

        log.status = 'Completed';
        log.endDate = req.body.endDate || new Date();
        if (req.body.cost !== undefined) log.cost = req.body.cost;
        await log.save();

        // Return vehicle to Available
        await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });

        const populated = await MaintenanceLog.findById(log._id).populate('vehicle', 'name licensePlate');
        res.json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Update maintenance log
exports.updateMaintenanceLog = async (req, res, next) => {
    try {
        const log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('vehicle', 'name licensePlate');
        if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found' });
        res.json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete maintenance log
exports.deleteMaintenanceLog = async (req, res, next) => {
    try {
        const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
