require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const dashboardRoutes = require("./routes/dashboard.routes");
const authMiddleware = require("./middleware/auth.middleware");
const authRoutes = require("./routes/auth.routes");
const stockRoutes = require("./routes/stock.routes");
const messagingRoutes = require("./routes/messaging.routes");


app.use("/api/auth", authRoutes);
app.use("/api/stock", authMiddleware, stockRoutes);
app.use("/api/customers", authMiddleware, require("./routes/customer.routes"));
app.use("/api/supply", authMiddleware, require("./routes/supply.routes"));
app.use("/api/payment", authMiddleware, require("./routes/payment.routes"));
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/messaging", authMiddleware, messagingRoutes);


app.use(errorHandler);

app.listen(5000, () => console.log("Server running on port 5000"));

