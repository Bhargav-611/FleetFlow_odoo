const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: {
        type: String,
        enum: ['Preventive', 'Reactive'],
        required: [true, 'Maintenance type is required'],
    },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    cost: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['In Progress', 'Completed'],
        default: 'In Progress',
    },
    performedBy: { type: String, trim: true },
    notes: { type: String, trim: true },
}, { timestamps: true });

maintenanceLogSchema.index({ vehicle: 1 });
maintenanceLogSchema.index({ status: 1 });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
