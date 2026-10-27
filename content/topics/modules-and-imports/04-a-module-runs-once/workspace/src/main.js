import { students } from "./students.js";
import renderGradebook, { renderSummary } from "./render.js";

renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);

console.log("main.js ran");
