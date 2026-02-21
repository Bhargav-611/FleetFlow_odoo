const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// @desc    Get all trips
exports.getTrips = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { origin: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } },
            ];
        }

        const trips = await Trip.find(filter)
            .populate('vehicle', 'name licensePlate maxCapacity')
            .populate('driver', 'name licenseNumber')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: trips.length, data: trips });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single trip
exports.getTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('vehicle')
            .populate('driver');
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        res.json({ success: true, data: trip });
    } catch (err) {
        next(err);
    }
};

// @desc    Create trip (Draft)
exports.createTrip = async (req, res, next) => {
    try {
        const { vehicle: vehicleId, driver: driverId, cargoWeight } = req.body;

        // Validate vehicle availability
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (vehicle.status !== 'Available') {
            return res.status(400).json({ success: false, message: `Vehicle is currently '${vehicle.status}' and not available for trips` });
        }

        // Validate cargo weight
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({
                success: false,
                message: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg)`,
            });
        }

        // Validate driver availability
        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        if (driver.status === 'Suspended') {
            return res.status(400).json({ success: false, message: 'Driver is suspended and cannot be assigned' });
        }
        if (driver.status === 'On Trip') {
            return res.status(400).json({ success: false, message: 'Driver is already on a trip' });
        }
        if (driver.licenseExpiry <= new Date()) {
            return res.status(400).json({ success: false, message: 'Driver license has expired — cannot assign trip' });
        }

        req.body.createdBy = req.user.id;
        req.body.startOdometer = vehicle.odometer;
        const trip = await Trip.create(req.body);

        const populated = await Trip.findById(trip._id)
            .populate('vehicle', 'name licensePlate')
            .populate('driver', 'name');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Dispatch trip → vehicle & driver become On Trip
exports.dispatchTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        if (trip.status !== 'Draft') {
            return res.status(400).json({ success: false, message: `Cannot dispatch a trip that is '${trip.status}'` });
        }

        // Re-validate availability at dispatch time
        const vehicle = await Vehicle.findById(trip.vehicle);
        const driver = await Driver.findById(trip.driver);

        if (vehicle.status !== 'Available') {
            return res.status(400).json({ success: false, message: 'Vehicle is no longer available' });
        }
        if (driver.status !== 'On Duty') {
            return res.status(400).json({ success: false, message: 'Driver is no longer available' });
        }
        if (driver.licenseExpiry <= new Date()) {
            return res.status(400).json({ success: false, message: 'Driver license has expired' });
        }

        // Update statuses
        vehicle.status = 'On Trip';
        await vehicle.save();

        driver.status = 'On Trip';
        driver.totalTrips += 1;
        await driver.save();

        trip.status = 'Dispatched';
        trip.dispatchedAt = new Date();
        await trip.save();

        const populated = await Trip.findById(trip._id)
            .populate('vehicle', 'name licensePlate')
            .populate('driver', 'name');
        res.json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Complete trip → vehicle & driver return to Available/On Duty
exports.completeTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        if (trip.status !== 'Dispatched') {
            return res.status(400).json({ success: false, message: `Cannot complete a trip that is '${trip.status}'` });
        }

        const { endOdometer, revenue, distance } = req.body;

        // Update vehicle
        const vehicle = await Vehicle.findById(trip.vehicle);
        vehicle.status = 'Available';
        if (endOdometer) vehicle.odometer = endOdometer;
        await vehicle.save();

        // Update driver
        const driver = await Driver.findById(trip.driver);
        driver.status = 'On Duty';
        driver.completedTrips += 1;
        await driver.save();

        // Update trip
        trip.status = 'Completed';
        trip.completedAt = new Date();
        if (endOdometer) trip.endOdometer = endOdometer;
        if (revenue) trip.revenue = revenue;
        if (distance) trip.distance = distance;
        else if (endOdometer && trip.startOdometer) {
            trip.distance = endOdometer - trip.startOdometer;
        }
        await trip.save();

        const populated = await Trip.findById(trip._id)
            .populate('vehicle', 'name licensePlate')
            .populate('driver', 'name');
        res.json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel trip
exports.cancelTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        if (trip.status === 'Completed' || trip.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: `Cannot cancel a trip that is '${trip.status}'` });
        }

        // If dispatched, free the vehicle and driver
        if (trip.status === 'Dispatched') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
            await Driver.findByIdAndUpdate(trip.driver, { status: 'On Duty' });
        }

        trip.status = 'Cancelled';
        trip.cancelledAt = new Date();
        await trip.save();

        res.json({ success: true, data: trip });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete trip
exports.deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        if (trip.status === 'Dispatched') {
            return res.status(400).json({ success: false, message: 'Cannot delete a dispatched trip — cancel it first' });
        }
        await Trip.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
