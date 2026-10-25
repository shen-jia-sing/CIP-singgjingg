require("dotenv").config();
const express = require("express");
const dbConnect = require("./dbConnect");
const loginRoutes = require("./routes/loginRoutes");

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in login-service/.env");

const app = express();
app.use(express.json());

app.use("/auth", loginRoutes);
app.get("/health", (req, res) => res.json({ status: "Login Service is running" }));

const PORT = process.env.PORT || 5002;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Login Service running on port ${PORT}`));
});
