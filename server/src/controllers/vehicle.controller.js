const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles with pagination and filtering
exports.getVehicles = async (req, res, next) => {
    try {
        const { status, type, region, search, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (region) filter.region = region;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const skip = (page - 1) * limit;
        const [vehicles, total] = await Promise.all([
            Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Vehicle.countDocuments(filter)
        ]);

        res.json({ 
            success: true, 
            count: vehicles.length, 
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: vehicles 
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single vehicle
exports.getVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, data: vehicle });
    } catch (err) {
        next(err);
    }
};

// @desc    Get available vehicles (for dispatcher)
exports.getAvailableVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ status: 'Available' }).sort({ name: 1 });
        res.json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err) {
        next(err);
    }
};

// @desc    Create vehicle
exports.createVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
        next(err);
    }
};

// @desc    Update vehicle
exports.updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, data: vehicle });
    } catch (err) {
        next(err);
    }
};

// @desc    Update vehicle status
exports.updateVehicleStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, data: vehicle });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete vehicle
exports.deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
