import { animate, ElementOrSelector } from "framer-motion";

export function entryAnimation(animationFunction: typeof animate, element: ElementOrSelector) {
    const af = animationFunction(element, {
      opacity: 0,
      x: 100,
    });
    af.complete();
    af.then(() => {
      animationFunction(
        element,
        { opacity: 1, x: 0 },
        { duration: 0.25, ease: "circOut" }
      );
    });
  }
  export function exitAnimation(animationFunction: typeof animate, element: ElementOrSelector) {
    return animationFunction(
      element,
      { opacity: 0, x: -100 },
      { duration: 0.25, ease: "circIn" }
    );
  }