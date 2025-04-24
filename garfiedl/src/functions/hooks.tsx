import { useState } from "react"

export function useStateObj<T>(defaultValue: T): [
    T,
    (callback: (state: T) => void) => T,
    React.Dispatch<React.SetStateAction<T>>

] {
    const [state, setState] = useState(defaultValue);
    function updateState(modificationCallback: (state: T) => void) {
        const duplicateState = structuredClone(state);
        modificationCallback(duplicateState);
        setState(duplicateState);
        return duplicateState
    }
    return [state, updateState, setState];
}
