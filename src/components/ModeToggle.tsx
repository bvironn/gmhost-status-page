import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "theme"

type ThemeMode = "light" | "dark"

function getCurrentTheme(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export default function ModeToggle() {
  const [theme, setTheme] = React.useState<ThemeMode>("light")

  React.useEffect(() => {
    setTheme(getCurrentTheme())
  }, [])

  const toggleTheme = React.useCallback(() => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark"
    const isDark = nextTheme === "dark"

    document.documentElement.classList.toggle("dark", isDark)
    localStorage.setItem(STORAGE_KEY, nextTheme)
    setTheme(nextTheme)
  }, [theme])

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
