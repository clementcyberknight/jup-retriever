const express = require("express");
const rateLimit = require("express-rate-limit");
const tokenRoutes = require("./routes/tokenRoutes");
const errorHandler = require("./utils/errorHandler");
const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1, // limit each IP to 1 requests per windowMs
  message: "Too many requests from this IP, please try again after a second",
});

app.use(express.json());
app.use("/api/tokens", limiter, tokenRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
