import dotenv from "dotenv";
import App from "./App.js";
import { connectDB } from "./config/db.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  App.listen(PORT, () => {
    console.log(`Server running on : http://localhost:${PORT}`);
  });
});
