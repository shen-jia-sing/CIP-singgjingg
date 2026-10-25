require("dotenv").config();
const express = require("express");
const dbConnect = require("./dbConnect");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.get("/health", (req, res) => res.json({ status: "User Service is running" }));

const PORT = process.env.PORT || 5004;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
});
