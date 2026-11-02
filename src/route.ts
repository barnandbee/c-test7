import { useEffect, useState } from "preact/hooks";

export type Route = "week" | "library" | "paces" | "stats" | "settings";

const ROUTES: Route[] = ["week", "library", "paces", "stats", "settings"];

export function routeFromHash(hash: string): Route {
  const r = hash.replace(/^#\/?/, "");
  return (ROUTES as string[]).includes(r) ? (r as Route) : "week";
}

export function hrefFor(route: Route): string {
  return route === "week" ? "#/" : `#/${route}`;
}

/** Hash-based routing, so GitHub Pages never needs to serve a deep link. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => routeFromHash(location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(routeFromHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
