import project from "../package.json";
import lock from "../package-lock.json";

const asked = [...Object.keys(project.dependencies), ...Object.keys(project.devDependencies)];
console.log("package.json asks for:", asked);

const installed = Object.keys(lock.packages).filter((path) => path !== "");
console.log("The lockfile records", installed.length, "packages");

const vite = lock.packages["node_modules/vite"];
console.log("vite: package.json allows", project.devDependencies.vite, "and npm chose", vite.version);
console.log("vite brings along:", Object.keys(vite.dependencies));

const everywhere = installed.filter((path) => !lock.packages[path].optional);
console.log("Installed on every computer:", everywhere.length);
console.log("Installed only on matching systems:", installed.length - everywhere.length);
