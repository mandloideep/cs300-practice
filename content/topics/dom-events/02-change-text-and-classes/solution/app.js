const status = document.querySelector("#status");
const projects = document.querySelectorAll("#project-list li");
status.textContent = `${projects.length} projects on the page.`;

projects[0].classList.add("done");
console.log("first project classes:", projects[0].className);

const finished = document.querySelectorAll("#project-list li.done");
status.textContent = `${finished.length} of ${projects.length} projects done.`;
