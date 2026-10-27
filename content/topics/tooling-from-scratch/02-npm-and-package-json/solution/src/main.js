import project from "../package.json";

console.log("Project:", project.name, project.version);

for (const [name, command] of Object.entries(project.scripts)) {
  console.log(`npm run ${name} runs: ${command}`);
}

console.log("The page needs:", Object.keys(project.dependencies));
console.log("Only the tools need:", Object.keys(project.devDependencies));
