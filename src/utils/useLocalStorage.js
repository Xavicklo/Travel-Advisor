import { useState, useEffect } from 'react';

/**
 * useState that is also saved to localStorage, so it survives page reloads.
 * localStorage can throw (private mode, storage full), so every access is guarded.
 */
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore: the app still works, it just won't remember
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
