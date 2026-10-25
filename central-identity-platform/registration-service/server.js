require("dotenv").config();
const express = require("express");
const dbConnect = require("./dbConnect");
const registerRoutes = require("./routes/registerRoutes");

const app = express();
app.use(express.json());

app.use("/register", registerRoutes);
app.get("/health", (req, res) => res.json({ status: "Registration Service is running" }));

const PORT = process.env.PORT || 5001;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Registration Service running on port ${PORT}`));
});
