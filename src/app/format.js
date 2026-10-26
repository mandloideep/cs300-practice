export function countLabel(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function formatDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
