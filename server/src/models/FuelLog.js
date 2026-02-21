const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    liters: { type: Number, required: [true, 'Fuel liters is required'], min: 0 },
    cost: { type: Number, required: [true, 'Fuel cost is required'], min: 0 },
    odometerAtFill: { type: Number, default: 0, min: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
}, { timestamps: true });

fuelLogSchema.index({ vehicle: 1 });
fuelLogSchema.index({ trip: 1 });

module.exports = mongoose.model('FuelLog', fuelLogSchema);
