import { useEffect, useState } from "react";

export function useStateObj<T>(
  defaultValue: T
): [
  T,
  (callback: (state: T) => void) => T,
  React.Dispatch<React.SetStateAction<T>>
] {
  const [state, setState] = useState(defaultValue);
  function updateState(modificationCallback: (state: T) => void) {
    const duplicateState = structuredClone(state);
    modificationCallback(duplicateState);
    setState(duplicateState);
    return duplicateState;
  }
  return [state, updateState, setState];
}

export function useScreenSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const resizeListener = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", resizeListener);
    return () => window.removeEventListener("resize", resizeListener);
  }, []);

  return size;
}
