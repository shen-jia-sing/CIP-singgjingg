require("dotenv").config();
const express = require("express");
const dbConnect = require("./dbConnect");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

app.use("/admin", adminRoutes);
app.get("/health", (req, res) => res.json({ status: "Admin Service is running" }));

const PORT = process.env.PORT || 5003;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));
});
