import project from "../package.json";
import lock from "../package-lock.json";

const asked = [...Object.keys(project.dependencies), ...Object.keys(project.devDependencies)];
console.log("package.json asks for:", asked);
