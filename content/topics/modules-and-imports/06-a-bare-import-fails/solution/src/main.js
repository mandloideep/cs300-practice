import { students } from "./students.js";
import { settings } from "./settings.js";
import renderGradebook, { renderSummary } from "./render.js";
import { formatUpdated } from "./dates.js";

settings.curve = 5;
renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);
document.querySelector("#updated").textContent = formatUpdated(new Date());

console.log("main.js ran");
