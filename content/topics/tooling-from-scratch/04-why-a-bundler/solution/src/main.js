import { formatMinutes } from "../node_modules/study-format/index.js";

const sessions = [25, 50, 90];
console.log("Study sessions in minutes:", sessions);

for (const minutes of sessions) {
  console.log(`${minutes} minutes is ${formatMinutes(minutes)}`);
}
