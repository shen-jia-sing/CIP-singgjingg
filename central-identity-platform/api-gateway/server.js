require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const verifyTokenAndRole = require("./middleware/authMiddleware");

const app = express();

// No body parser here: the gateway only reads the Authorization header,
// so the raw request body streams straight through to each microservice.

const {
  REGISTRATION_SERVICE_URL,
  LOGIN_SERVICE_URL,
  ADMIN_SERVICE_URL,
  USER_SERVICE_URL,
} = process.env;

for (const [name, value] of Object.entries({
  REGISTRATION_SERVICE_URL,
  LOGIN_SERVICE_URL,
  ADMIN_SERVICE_URL,
  USER_SERVICE_URL,
})) {
  if (!value) throw new Error(`${name} is missing in api-gateway/.env`);
}

// ---------- PUBLIC ROUTES (no token required) ----------

// Client -> Gateway -> Registration Service
app.use("/register", createProxyMiddleware({ target: REGISTRATION_SERVICE_URL, changeOrigin: true }));

// Client -> Gateway -> Login Service
app.use("/auth", createProxyMiddleware({ target: LOGIN_SERVICE_URL, changeOrigin: true }));

// ---------- PROTECTED ROUTES (JWT + role required) ----------

// Client -> Gateway (role must be "admin") -> Admin Service
app.use(
  "/admin",
  verifyTokenAndRole("admin"),
  createProxyMiddleware({ target: ADMIN_SERVICE_URL, changeOrigin: true })
);

// Client -> Gateway (role must be "user") -> User Service
app.use(
  "/user",
  verifyTokenAndRole("user"),
  createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true })
);

app.get("/health", (req, res) => res.json({ status: "API Gateway is running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`  /register -> ${REGISTRATION_SERVICE_URL}`);
  console.log(`  /auth     -> ${LOGIN_SERVICE_URL}`);
  console.log(`  /admin    -> ${ADMIN_SERVICE_URL}`);
  console.log(`  /user     -> ${USER_SERVICE_URL}`);
});
