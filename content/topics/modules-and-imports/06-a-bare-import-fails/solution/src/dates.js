export function formatUpdated(date) {
  return "Updated " + date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

console.log("dates.js ran");
