export function countLabel(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
