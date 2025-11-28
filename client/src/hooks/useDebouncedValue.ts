import { useEffect, useState } from "react";

/**
 * Returns a copy of the provided value that only updates after `delay` ms.
 * Useful to throttle expensive computations triggered by rapidly changing inputs.
 */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

