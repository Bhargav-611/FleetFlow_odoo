const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Driver name is required'], trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    licenseNumber: { type: String, required: [true, 'License number is required'], unique: true, trim: true },
    licenseExpiry: { type: Date, required: [true, 'License expiry date is required'] },
    vehicleCategories: {
        type: [String],
        enum: ['Truck', 'Van', 'Trailer', 'Tanker', 'Flatbed', 'Refrigerated', 'Other'],
        default: ['Truck'],
    },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'],
        default: 'On Duty',
    },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    totalTrips: { type: Number, default: 0 },
    completedTrips: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
}, { timestamps: true });

driverSchema.index({ status: 1 });
driverSchema.index({ licenseExpiry: 1 });

// Virtual: is license valid
driverSchema.virtual('isLicenseValid').get(function () {
    return this.licenseExpiry > new Date();
});

// Virtual: trip completion rate
driverSchema.virtual('completionRate').get(function () {
    if (this.totalTrips === 0) return 100;
    return Math.round((this.completedTrips / this.totalTrips) * 100);
});

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
