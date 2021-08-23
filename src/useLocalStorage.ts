import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

type UseLocalStorageResult<T> = [
  value: T | null,
  setValue: Dispatch<SetStateAction<T>>,
  removeValue: () => void
];

const STORAGE_EVENT_NAME = '@limwa/storage';

/**
 * THIS HOOK IS NOT REACTIVE TO THE KEY!!
 *
 * @param key The key to be used in the local storage.
 * @param defaultValue The default value to be placed in the local storage.
 * @returns a stateful value that is tied to the value present in the browser's storage area.
 */
function useLocalStorage<T>(key: string, defaultValue: T | (() => T)): UseLocalStorageResult<T> {
  // Empty keys are just weird, okay?
  if (!key) throw new Error('Invalid key');

  let [internalData, setInternalData] = useState(defaultValue);

  // Get the up-to-date value from the local storage and update state
  const updateStateFromLocalStorage = useCallback(() => {
    const storedValue = localStorage.getItem(key);
    const storedData = storedValue ? JSON.parse(storedValue) : null;

    setInternalData(storedData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire an event signaling other hooks that the storage has changed
  const broadcastChange = useCallback(() => {
    const event = new CustomEvent(STORAGE_EVENT_NAME, {
      detail: {
        key,
      },
    });

    document.dispatchEvent(event);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDataToLocalStorage = useCallback(
    (newData: T, broadcast: boolean) => {
      const currentValue = JSON.stringify(newData);
      localStorage.setItem(key, currentValue);

      if (broadcast) broadcastChange();
    },
    [broadcastChange] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) updateStateFromLocalStorage();
    else saveDataToLocalStorage(internalData, false);
  }, [updateStateFromLocalStorage, saveDataToLocalStorage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleStorageEvent(ev: StorageEvent) {
      if (ev.key !== key) return;

      updateStateFromLocalStorage();
    }

    function handleCustomStorageEvent(ev: any) {
      // @ts-ignore
      const detail = ev.detail;
      if (!detail || detail.key !== key) return;

      updateStateFromLocalStorage();
    }

    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener(STORAGE_EVENT_NAME, handleCustomStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);

      document.removeEventListener(STORAGE_EVENT_NAME, handleCustomStorageEvent);
    };
  }, [updateStateFromLocalStorage]); // eslint-disable-line react-hooks/exhaustive-deps

  const setData = useCallback(
    (value: SetStateAction<T>) => {
      // @ts-ignore
      const newData = typeof value === 'function' ? value(internalData) : value;
      saveDataToLocalStorage(newData, true);
    },
    [saveDataToLocalStorage] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Create a callback to remove the key-value pair from the local storage
  const remove = useCallback(() => {
    localStorage.removeItem(key);

    broadcastChange();
  }, [broadcastChange]); // eslint-disable-line react-hooks/exhaustive-deps

  return [internalData, setData, remove];
}

export default useLocalStorage;
