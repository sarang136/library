const mongoose = require('mongoose');

const bookingsModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    seatNo: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["booked", "expired", "pending"],
        default: "pending"
    }

}, { timestamps: true })

module.exports = mongoose.model('Bookings', bookingsModel);

