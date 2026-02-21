const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const MaintenanceLog = require('../models/MaintenanceLog');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

// @desc    Dashboard KPIs
exports.getDashboardKPIs = async (req, res, next) => {
    try {
        const [
            totalVehicles,
            activeFleet,
            inShop,
            retired,
            available,
            totalDrivers,
            pendingCargo,
            totalTrips,
            completedTrips,
        ] = await Promise.all([
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ status: 'On Trip' }),
            Vehicle.countDocuments({ status: 'In Shop' }),
            Vehicle.countDocuments({ status: 'Retired' }),
            Vehicle.countDocuments({ status: 'Available' }),
            Driver.countDocuments(),
            Trip.countDocuments({ status: 'Draft' }),
            Trip.countDocuments(),
            Trip.countDocuments({ status: 'Completed' }),
        ]);

        const operational = totalVehicles - retired;
        const utilizationRate = operational > 0 ? Math.round((activeFleet / operational) * 100) : 0;

        // Revenue & cost summaries
        const [revenueAgg] = await Trip.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$revenue' }, totalDistance: { $sum: '$distance' } } },
        ]);

        const [fuelAgg] = await FuelLog.aggregate([
            { $group: { _id: null, totalFuelCost: { $sum: '$cost' }, totalLiters: { $sum: '$liters' } } },
        ]);

        const [maintenanceAgg] = await MaintenanceLog.aggregate([
            { $group: { _id: null, totalMaintenanceCost: { $sum: '$cost' } } },
        ]);

        res.json({
            success: true,
            data: {
                totalVehicles,
                activeFleet,
                maintenanceAlerts: inShop,
                available,
                retired,
                utilizationRate,
                totalDrivers,
                pendingCargo,
                totalTrips,
                completedTrips,
                totalRevenue: revenueAgg?.totalRevenue || 0,
                totalDistance: revenueAgg?.totalDistance || 0,
                totalFuelCost: fuelAgg?.totalFuelCost || 0,
                totalLiters: fuelAgg?.totalLiters || 0,
                totalMaintenanceCost: maintenanceAgg?.totalMaintenanceCost || 0,
            },
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Vehicle cost breakdown
exports.getVehicleCosts = async (req, res, next) => {
    try {
        const fuelByVehicle = await FuelLog.aggregate([
            { $group: { _id: '$vehicle', totalFuelCost: { $sum: '$cost' }, totalLiters: { $sum: '$liters' } } },
        ]);

        const maintenanceByVehicle = await MaintenanceLog.aggregate([
            { $group: { _id: '$vehicle', totalMaintenanceCost: { $sum: '$cost' } } },
        ]);

        const tripsByVehicle = await Trip.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: '$vehicle', totalRevenue: { $sum: '$revenue' }, totalDistance: { $sum: '$distance' }, tripCount: { $sum: 1 } } },
        ]);

        const vehicles = await Vehicle.find().lean();
        const data = vehicles.map(v => {
            const fuel = fuelByVehicle.find(f => f._id?.toString() === v._id.toString()) || {};
            const maint = maintenanceByVehicle.find(m => m._id?.toString() === v._id.toString()) || {};
            const trips = tripsByVehicle.find(t => t._id?.toString() === v._id.toString()) || {};

            const totalCost = (fuel.totalFuelCost || 0) + (maint.totalMaintenanceCost || 0);
            const costPerKm = trips.totalDistance ? (totalCost / trips.totalDistance).toFixed(2) : 0;
            const fuelEfficiency = fuel.totalLiters ? ((trips.totalDistance || 0) / fuel.totalLiters).toFixed(2) : 0;
            const roi = v.acquisitionCost > 0
                ? ((((trips.totalRevenue || 0) - totalCost) / v.acquisitionCost) * 100).toFixed(2)
                : 0;

            return {
                vehicle: { _id: v._id, name: v.name, licensePlate: v.licensePlate },
                totalFuelCost: fuel.totalFuelCost || 0,
                totalLiters: fuel.totalLiters || 0,
                totalMaintenanceCost: maint.totalMaintenanceCost || 0,
                totalRevenue: trips.totalRevenue || 0,
                totalDistance: trips.totalDistance || 0,
                tripCount: trips.tripCount || 0,
                totalOperationalCost: totalCost,
                costPerKm: Number(costPerKm),
                fuelEfficiency: Number(fuelEfficiency),
                roi: Number(roi),
            };
        });

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// @desc    Fuel efficiency data
exports.getFuelEfficiency = async (req, res, next) => {
    try {
        const data = await FuelLog.aggregate([
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicle',
                    foreignField: '_id',
                    as: 'vehicleData',
                },
            },
            { $unwind: '$vehicleData' },
            {
                $group: {
                    _id: '$vehicle',
                    vehicleName: { $first: '$vehicleData.name' },
                    licensePlate: { $first: '$vehicleData.licensePlate' },
                    totalLiters: { $sum: '$liters' },
                    totalCost: { $sum: '$cost' },
                    entries: { $sum: 1 },
                },
            },
            { $sort: { totalCost: -1 } },
        ]);

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// @desc    Monthly trends
exports.getMonthlyTrends = async (req, res, next) => {
    try {
        const trips = await Trip.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } },
                    trips: { $sum: 1 },
                    revenue: { $sum: '$revenue' },
                    distance: { $sum: '$distance' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const fuel = await FuelLog.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                    fuelCost: { $sum: '$cost' },
                    liters: { $sum: '$liters' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ success: true, data: { trips, fuel } });
    } catch (err) {
        next(err);
    }
};
