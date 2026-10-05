'use client';
import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
function subscribe(notify: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== 'ai-bubble-theme' && event.key !== null) return;
    document.documentElement.classList.toggle(
      'dark',
      event.newValue === 'dark',
    );
    notify();
  };
  window.addEventListener('storage', sync);
  window.addEventListener('theme-change', notify);
  return () => {
    window.removeEventListener('storage', sync);
    window.removeEventListener('theme-change', notify);
  };
}
const snapshot = () => document.documentElement.classList.contains('dark');
const serverSnapshot = () => false;
export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function toggle() {
    const next = !snapshot();
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('ai-bubble-theme', next ? 'dark' : 'light');
    } catch {
      /* Switching still works when storage is disabled. */
    }
    window.dispatchEvent(new Event('theme-change'));
  }
  return (
    <Button
      variant="outline"
      size="sm"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
    >
      <Sun size={15} className="theme-sun" />
      <Moon size={15} className="theme-moon" />
      <span className="theme-light-label">Light mode</span>
      <span className="theme-dark-label">Dark mode</span>
    </Button>
  );
}
