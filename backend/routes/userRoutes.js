const express = require('express');
const { register, login, bookSeat, getActiveBookings, getSeatStatus } = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/book-seats/:userId', authMiddleware, bookSeat)
userRouter.get('/bookings/active', authMiddleware, getActiveBookings)
userRouter.get('/seats/status', authMiddleware, getSeatStatus)

module.exports = userRouter;