import { ClassArray } from "./types";

export function concatClasses(...classes: ClassArray): string {
  return classes
    .filter((e) => e !== undefined && e !== null && e !== false)
    .map<string>((e) => {
      if (typeof e === "object") e = concatClasses(e);
      else e = e.trim();
      return e;
    })
    .join(" ");
}
