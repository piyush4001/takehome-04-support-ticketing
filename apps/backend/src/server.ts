import "dotenv/config";
import app from "./app.js";
import { startSlaWorker } from "./modules/sla/sla.worker.js";
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  startSlaWorker();
});