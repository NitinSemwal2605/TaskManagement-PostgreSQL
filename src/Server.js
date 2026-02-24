import dotenv from "dotenv";
import process from "process";
import App from "./App.js";
import sequelize, { connectSequelize } from "./config/sequelize.js";

await sequelize.sync({ alter: false }); // Work with Existing Table.
dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;

await connectSequelize().then(() => {
  App.listen(PORT, () => {
    console.log(`Server running on : http://localhost:${PORT}`);
  });
});
