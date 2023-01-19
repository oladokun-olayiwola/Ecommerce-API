require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");


const connectDB = require("./db/connect");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");

const { authenticateUser } = require("./middleware/authentication");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.get("/", (req, res) => {
  console.log("No one");
  res.send("None");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/order", authenticateUser, orderRouter);
app.use("/api/v1/review", reviewRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 4125;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT} sir😎`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
