import { students } from "./students.js";
import { settings } from "./settings.js";
import renderGradebook, { renderSummary } from "./render.js";

settings.curve = 5;
renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);

console.log("main.js ran");
