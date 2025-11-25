const express = require("express");
const tokenRoutes = require("./routes/tokenRoutes");
const errorHandler = require("./utils/errorHandler");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/tokens", tokenRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
