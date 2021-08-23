import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import useMedia from './useMedia';

function useDarkMode() {
  const isDarkModeDefault = useMedia('(prefers-color-scheme: dark)');
  const [theme, setTheme] = useLocalStorage<'dark' | 'light' | 'default'>('theme', 'default');

  const isThemeSaved = !(theme === null || theme === 'default');

  const defaultTheme =
    isDarkModeDefault === undefined ? 'loading' : isDarkModeDefault ? 'dark' : 'light';

  const activeTheme = (isThemeSaved ? theme : defaultTheme) as 'light' | 'dark' | 'loading';

  const toggleTheme = useCallback(() => {
    if (activeTheme === 'loading') return;

    setTheme(activeTheme === 'dark' ? 'light' : 'dark');
  }, [activeTheme, setTheme]);

  const enableDarkTheme = useCallback(() => setTheme('dark'), [setTheme]);
  const enableLightTheme = useCallback(() => setTheme('light'), [setTheme]);

  const forgetTheme = useCallback(() => setTheme('default'), [setTheme]);

  const controller = {
    isThemeSaved,
    defaultTheme,
    activeTheme,
    toggleTheme,
    enableDarkTheme,
    enableLightTheme,
    forgetTheme,
  };

  return controller;
}

export default useDarkMode;
