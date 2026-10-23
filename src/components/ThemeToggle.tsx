import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`flex items-center justify-center rounded-md p-1 transition-transform duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isDark ? "rotate-180" : "rotate-0"
      }`}
    >
      {isDark ? (
        <Sun className="h-6 w-6 text-white rotate-0 transition-all" aria-hidden="true" />
      ) : (
        <Moon className="h-6 w-6 text-black rotate-0 transition-all" aria-hidden="true" />
      )}
    </button>
  );
}
