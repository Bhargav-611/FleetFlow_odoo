const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const MaintenanceLog = require('../models/MaintenanceLog');
const PDFDocument = require('pdfkit');

// @desc    Export CSV
exports.exportCSV = async (req, res, next) => {
    try {
        const { type } = req.query;
        let data = [];
        let fields = [];

        switch (type) {
            case 'vehicles':
                data = await Vehicle.find().lean();
                fields = ['name', 'licensePlate', 'type', 'maxCapacity', 'odometer', 'region', 'status', 'acquisitionCost'];
                break;
            case 'drivers':
                data = await Driver.find().lean();
                fields = ['name', 'phone', 'licenseNumber', 'licenseExpiry', 'status', 'safetyScore', 'totalTrips', 'completedTrips'];
                break;
            case 'trips':
                data = await Trip.find().populate('vehicle', 'name licensePlate').populate('driver', 'name').lean();
                data = data.map(t => ({
                    ...t,
                    vehicleName: t.vehicle?.name,
                    driverName: t.driver?.name,
                }));
                fields = ['vehicleName', 'driverName', 'origin', 'destination', 'cargoWeight', 'status', 'revenue', 'distance'];
                break;
            case 'fuel':
                data = await FuelLog.find().populate('vehicle', 'name licensePlate').lean();
                data = data.map(f => ({ ...f, vehicleName: f.vehicle?.name }));
                fields = ['vehicleName', 'liters', 'cost', 'odometerAtFill', 'date'];
                break;
            case 'expenses':
                data = await Expense.find().populate('vehicle', 'name licensePlate').lean();
                data = data.map(e => ({ ...e, vehicleName: e.vehicle?.name }));
                fields = ['vehicleName', 'category', 'amount', 'date', 'description'];
                break;
            case 'maintenance':
                data = await MaintenanceLog.find().populate('vehicle', 'name licensePlate').lean();
                data = data.map(m => ({ ...m, vehicleName: m.vehicle?.name }));
                fields = ['vehicleName', 'type', 'description', 'cost', 'startDate', 'endDate', 'status'];
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid export type' });
        }

        // Build CSV manually
        const header = fields.join(',');
        const rows = data.map(row =>
            fields.map(f => {
                let val = row[f] ?? '';
                if (val instanceof Date) val = val.toISOString().split('T')[0];
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(',')
        );
        const csv = [header, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=fleetflow_${type}_${Date.now()}.csv`);
        res.send(csv);
    } catch (err) {
        next(err);
    }
};

// @desc    Export PDF
exports.exportPDF = async (req, res, next) => {
    try {
        const { type } = req.query;
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=fleetflow_${type}_${Date.now()}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text('FleetFlow Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`${(type || '').charAt(0).toUpperCase() + (type || '').slice(1)} Report`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1);

        let items = [];
        switch (type) {
            case 'vehicles':
                items = await Vehicle.find().lean();
                items.forEach(v => {
                    doc.fontSize(10).text(`${v.name} | ${v.licensePlate} | ${v.type} | Capacity: ${v.maxCapacity}kg | Status: ${v.status} | Region: ${v.region}`);
                    doc.moveDown(0.3);
                });
                break;
            case 'drivers':
                items = await Driver.find().lean();
                items.forEach(d => {
                    doc.fontSize(10).text(`${d.name} | License: ${d.licenseNumber} | Expiry: ${new Date(d.licenseExpiry).toLocaleDateString()} | Status: ${d.status} | Safety: ${d.safetyScore}`);
                    doc.moveDown(0.3);
                });
                break;
            case 'trips':
                items = await Trip.find().populate('vehicle', 'name').populate('driver', 'name').lean();
                items.forEach(t => {
                    doc.fontSize(10).text(`${t.vehicle?.name || 'N/A'} | ${t.driver?.name || 'N/A'} | ${t.origin} → ${t.destination} | Cargo: ${t.cargoWeight}kg | Status: ${t.status} | Revenue: $${t.revenue}`);
                    doc.moveDown(0.3);
                });
                break;
            default:
                doc.fontSize(12).text('Report type not specified or invalid.');
        }

        doc.end();
    } catch (err) {
        next(err);
    }
};
