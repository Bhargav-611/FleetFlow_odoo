const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Vehicle name/model is required'], trim: true },
    licensePlate: {
        type: String,
        required: [true, 'License plate is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['Truck', 'Van', 'Trailer', 'Tanker', 'Flatbed', 'Refrigerated', 'Other'],
        default: 'Truck',
    },
    maxCapacity: { type: Number, required: [true, 'Max load capacity is required'], min: 0 },
    odometer: { type: Number, default: 0, min: 0 },
    region: { type: String, trim: true, default: 'Default' },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
        default: 'Available',
    },
    acquisitionCost: { type: Number, default: 0, min: 0 },
    year: { type: Number },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid'], default: 'Diesel' },
    notes: { type: String, trim: true },
}, { timestamps: true });

vehicleSchema.index({ licensePlate: 1 }, { unique: true });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ region: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
