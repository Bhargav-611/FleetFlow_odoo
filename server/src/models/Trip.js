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
    duration: { type: Number, default: 0, min: 0 }, // Duration in minutes
    startOdometer: { type: Number, default: 0 },
    endOdometer: { type: Number, default: 0 },
    scheduledDate: { type: Date },
    dispatchedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Route data from OpenRouteService
    routePolyline: [
        {
            lat: Number,
            lng: Number,
        }
    ],
    estimatedDuration: { type: Number, default: 0 }, // Estimated based on route
    
    // Cost breakdown
    estimatedFuelCost: { type: Number, default: 0, min: 0 },
    estimatedFixedCost: { type: Number, default: 0, min: 0 },
    estimatedTotalCost: { type: Number, default: 0, min: 0 },
    actualFuelCost: { type: Number, default: 0, min: 0 },
    actualTotalCost: { type: Number, default: 0, min: 0 },
    
    // Email status
    completionEmailSent: { type: Boolean, default: false },
    completionEmailSentAt: { type: Date },
}, { timestamps: true });

tripSchema.index({ status: 1 });
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);
