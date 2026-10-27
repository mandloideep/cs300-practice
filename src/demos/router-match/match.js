export function pathnameOf(url) {
  const path = url.split(/[?#]/)[0];
  return path === "" ? "/" : path;
}

export function segmentsOf(path) {
  return path.split("/").filter((segment) => segment !== "");
}

export function isValidPattern(path) {
  if (path === "*") return true;
  if (!path.startsWith("/")) return false;
  const segments = segmentsOf(path);
  return segments.every(
    (segment, index) =>
      /^:[\w-]+$/.test(segment) ||
      /^[\w.~-]+$/.test(segment) ||
      (segment === "*" && index === segments.length - 1),
  );
}

function decode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function matchRoute(pattern, pathname) {
  const want = segmentsOf(pattern);
  const have = segmentsOf(pathname);
  const splat = want[want.length - 1] === "*";
  const fixed = splat ? want.slice(0, -1) : want;
  if (splat ? have.length < fixed.length : have.length !== fixed.length) {
    return {
      match: false,
      reason: splat
        ? `needs at least ${fixed.length} segment${fixed.length === 1 ? "" : "s"}, the URL has ${have.length}`
        : `needs ${fixed.length} segment${fixed.length === 1 ? "" : "s"}, the URL has ${have.length}`,
    };
  }
  const params = {};
  for (let index = 0; index < fixed.length; index += 1) {
    const segment = fixed[index];
    if (segment.startsWith(":")) {
      params[segment.slice(1)] = decode(have[index]);
    } else if (segment.toLowerCase() !== have[index].toLowerCase()) {
      return { match: false, reason: `${segment} is not ${have[index]}` };
    }
  }
  if (splat) {
    const rest = have.slice(fixed.length).map(decode).join("/");
    params["*"] = rest !== "" && pathname.endsWith("/") ? `${rest}/` : rest;
  }
  return { match: true, params };
}

export function score(pattern) {
  const full = pattern === "*" ? "/*" : pattern;
  const segments = full.split("/");
  let total = segments.length;
  if (segments.includes("*")) total -= 2;
  for (const segment of segments) {
    if (segment === "*") continue;
    if (/^:[\w-]+$/.test(segment)) total += 3;
    else if (segment === "") total += 1;
    else total += 10;
  }
  return total;
}

export function describe(pattern) {
  const segments = segmentsOf(pattern);
  const fixed = segments.filter((segment) => !segment.startsWith(":") && segment !== "*").length;
  const params = segments.filter((segment) => segment.startsWith(":")).length;
  const parts = [];
  if (fixed > 0) parts.push(`${fixed} fixed`);
  if (params > 0) parts.push(`${params} parameter${params === 1 ? "" : "s"}`);
  if (segments.includes("*")) parts.push("catch-all *");
  return parts.length === 0 ? "the root only" : parts.join(", ");
}
