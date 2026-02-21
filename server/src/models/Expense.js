const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    category: {
        type: String,
        enum: ['Fuel', 'Maintenance', 'Toll', 'Insurance', 'Fine', 'Other'],
        required: [true, 'Expense category is required'],
    },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true },
}, { timestamps: true });

expenseSchema.index({ vehicle: 1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
