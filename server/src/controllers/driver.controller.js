const Driver = require('../models/Driver');

// @desc    Get all drivers
exports.getDrivers = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const drivers = await Driver.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: drivers.length, data: drivers });
    } catch (err) {
        next(err);
    }
};

// @desc    Get available drivers (On Duty + valid license)
exports.getAvailableDrivers = async (req, res, next) => {
    try {
        const drivers = await Driver.find({
            status: 'On Duty',
            licenseExpiry: { $gt: new Date() },
        }).sort({ name: 1 });
        res.json({ success: true, count: drivers.length, data: drivers });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single driver
exports.getDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
};

// @desc    Create driver
exports.createDriver = async (req, res, next) => {
    try {
        const driver = await Driver.create(req.body);
        res.status(201).json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
};

// @desc    Update driver
exports.updateDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
};

// @desc    Update driver status
exports.updateDriverStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete driver
exports.deleteDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Get driver compliance info
exports.getDriverCompliance = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        
        const isLicenseValid = driver.licenseExpiry > new Date();
        const completionRate = driver.totalTrips > 0 ? (driver.completedTrips / driver.totalTrips * 100).toFixed(1) : 100;
        
        res.json({ 
            success: true, 
            data: {
                ...driver.toObject(),
                isLicenseValid,
                completionRate: Number(completionRate),
                daysUntilExpiry: isLicenseValid ? Math.ceil((driver.licenseExpiry - new Date()) / (1000 * 60 * 60 * 24)) : 0
            }
        });
    } catch (err) {
        next(err);
    }
};
