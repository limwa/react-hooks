import { useState, useEffect } from 'react';

// Function overloads
function useMedia(query: string): boolean | undefined;
function useMedia(query: string, defaultValue: boolean): boolean;

// Function implementation
function useMedia(query: string, defaultValue?: boolean) {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia(query);

    const updateState = () => setState(mql.matches);
    updateState();

    mql.addEventListener('change', updateState);
    return () => mql.removeEventListener('change', updateState);
  }, [query]);

  return state;
}

export default useMedia;
