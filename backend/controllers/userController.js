const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Booking = require('../models/bookingsModel');
const cron = require('node-cron')

const register = async (req, res) => {
    try {
        const { name, email, contact, password } = req.body;
        if (!name || !email || !contact || !password) {
            return res.status(400).json({ message: "All the fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name, email, contact, password: hashedPassword
        })
        await user.save();
        res.status(200).json({ message: "User saved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (!userExists) {
            return res.status(400).json({ message: "User Does not exists" });
        }
        const isPasswordValid = await bcrypt.compare(password, userExists.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        userExists.password = undefined;

        const token = jwt.sign({ _id: userExists._id }, process.env.JWT)
        // console.log("token", token);

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "None",
            maxAge: 15 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production"
        })
        res.status(200).json({ message: "Logged In Successfull", data: userExists, token: token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const bookSeat = async (req, res) => {
    try {
        const { userId } = req.params
        const { startTime, endTime, seatNo, amount } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User id is required" });
        }

        const userIdExists = await Booking.findOne({ userId })
        if (userIdExists) {
            return res.status(400).json({ message: "User already have an booking" });
        }

        const isBooked = await Booking.findOne({ seatNo });
        if (isBooked.status === "booked") {
            return res.status(400).json({ message: "The seat is already booked" });
        }

        if (!startTime || !endTime || !seatNo || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findById({ _id: userId });
        if (!userExists) {
            return res.status(200).json({ message: "User does not exist" });
        }

        const booking = new Booking({
            userId,
            startTime,
            endTime,
            seatNo,
            amount,
            status: "booked"
        })
        await booking.save();
        res.status(200).json({ message: "success", booking: booking })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get active bookings for logged-in user (requires authMiddleware)
const getActiveBookings = async (req, res) => {
    try {
        const now = new Date();
        const bookings = await Booking.find({
            userId: req.user._id,
            status: "booked",
            endTime: { $gt: now }
        }).sort({ startTime: 1 });
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get seat status between a time window; return booked seats overlapping window
const getSeatStatus = async (req, res) => {
    try {
        const { startTime, endTime } = req.query;
        if (!startTime || !endTime) {
            return res.status(400).json({ message: "startTime and endTime are required" });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        // overlapping condition
        const overlapping = await Booking.find({
            status: "booked",
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } }
            ]
        }).select("seatNo startTime endTime status");
        res.status(200).json({ bookings: overlapping });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
cron.schedule("* * * * *", async () => {
    console.log("Cron running")
    try {
        const now = new Date();
        console.log("now", now)
        const result = await Booking.updateMany(
            { endTime: { $lt: now }, status: "booked" },
            { $set: { status: "expired" } }
        );
        const get = await Booking.find({ status: "booked" })
        console.log(get)
        console.log(result)
        if (result.modifiedCount > 0) {
            console.log(`${result.modifiedCount} bookings marked as expired at ${now}`);
        }
    } catch (err) {
        console.error("Cron job error:", err.message);
    }
});

module.exports = { register, login, bookSeat, getActiveBookings, getSeatStatus }