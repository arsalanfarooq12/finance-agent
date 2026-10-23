// backend/src/scripts/setupCheckpointer.ts
import "../env.js";
import { getCheckpointer } from "../lib/checkpointer.js";

await getCheckpointer().setup();
console.log("Checkpoint tables created");
process.exit(0);
