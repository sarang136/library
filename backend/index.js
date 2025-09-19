const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDb = require('./db/db');
const app = express();
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const cors = require('cors');
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));


app.use('/user', userRouter)

connectDb()
    .then(() => {
        console.log("Database Connected 🍌")
        app.listen(3000, () => console.log("Server Started 💩"));
    })
    .catch(() => {
        console.log("Database connection failed 🤺");
    })