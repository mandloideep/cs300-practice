// A jump to the first known location that also flashes the other one when it is in the same
// file; the editor's jumpTo reads the `highlight` list.
export function jumpTarget(primary, secondary) {
  const target = primary ?? secondary;
  if (!target) return null;
  return { ...target, highlight: [primary, secondary].filter(Boolean) };
}
