const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    origin: { type: String, required: [true, 'Origin is required'], trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    cargoWeight: { type: Number, required: [true, 'Cargo weight is required'], min: 0 },
    cargoDescription: { type: String, trim: true },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft',
    },
    revenue: { type: Number, default: 0, min: 0 },
    distance: { type: Number, default: 0, min: 0 },
    startOdometer: { type: Number, default: 0 },
    endOdometer: { type: Number, default: 0 },
    scheduledDate: { type: Date },
    dispatchedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

tripSchema.index({ status: 1 });
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);
