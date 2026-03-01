import { e as createComponent, m as maybeRenderHead, k as renderScript, r as renderTemplate, l as renderComponent, n as renderSlot, o as renderHead } from '../chunks/astro/server_CbQT0PAA.mjs';
import 'piccolore';
/* empty css                                 */
import { clsx } from 'clsx';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, CalendarIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { Slot, Popover as Popover$1 } from 'radix-ui';
import { twMerge } from 'tailwind-merge';
import { ArrowPathIcon, ServerStackIcon, CpuChipIcon, CircleStackIcon, ServerIcon, MagnifyingGlassIcon, FunnelIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { getDefaultClassNames, DayPicker } from 'react-day-picker';
export { renderers } from '../renderers.mjs';

const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="relative mx-auto max-w-7xl px-6 pb-6"> <div class="flex w-full flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 px-6 py-5 text-sm text-muted-foreground backdrop-blur-xl sm:flex-row"> <p class="inline-flex items-center gap-1.5"> <i class="fa-solid fa-code text-muted-foreground/80" aria-hidden="true"></i>
Made with
<button type="button" id="love-burst-button" class="relative inline-flex h-5 w-5 items-center justify-center rounded-full text-rose-600 transition-colors hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70" aria-label="Explosión de corazones"> <i class="fa-solid fa-heart pointer-events-none" aria-hidden="true"></i> </button>
by
<a class="text-foreground/85 transition-colors hover:text-foreground" href="https://github.com/bvironn" target="_blank" rel="noreferrer">
@bvironn
</a> </p> <div class="inline-flex items-center gap-2"> <a href="https://github.com/bvironn" target="_blank" rel="noreferrer" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/40 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="GitHub"> <i class="fa-brands fa-github" aria-hidden="true"></i> </a> <div class="relative inline-flex"> <button type="button" id="copy-discord-user" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/40 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Copiar usuario de Discord" title="Copiar @bviron"> <i class="fa-brands fa-discord" aria-hidden="true"></i> </button> <span id="copy-discord-popover" role="status" aria-live="polite" class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md border border-border/70 bg-popover/95 px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity duration-200">
Copiado
</span> </div> </div> </div> </footer> ${renderScript($$result, "/root/status-page/src/components/Footer.astro?astro&type=script&index=0&lang.ts")} `;
}, "/root/status-page/src/components/Footer.astro", void 0);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}

const STORAGE_KEY = "theme";
function getCurrentTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function ModeToggle() {
  const [theme, setTheme] = React.useState("light");
  React.useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);
  const toggleTheme = React.useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const isDark = nextTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }, [theme]);
  return /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "icon", onClick: toggleTheme, "aria-label": "Toggle theme", children: [
    /* @__PURE__ */ jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" }),
    /* @__PURE__ */ jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" }),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle theme" })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Main = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><title>Cluster Monitor</title><script>
			const storageKey = 'theme';
			const getThemePreference = () => {
				if (typeof localStorage !== 'undefined') {
					const storedTheme = localStorage.getItem(storageKey);
					if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
				}
				return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			};
			const isDark = getThemePreference() === 'dark';
			document.documentElement.classList.toggle('dark', isDark);

			if (typeof localStorage !== 'undefined') {
				const observer = new MutationObserver(() => {
					localStorage.setItem(storageKey, document.documentElement.classList.contains('dark') ? 'dark' : 'light');
				});
				observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
			}
		<\/script>`, '</head> <body class="min-h-screen bg-background text-foreground antialiased"> <div class="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.13),transparent_30%),radial-gradient(circle_at_88%_5%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_52%_100%,rgba(255,255,255,0.1),transparent_42%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.07),transparent_30%),radial-gradient(circle_at_88%_5%,rgba(255,255,255,0.04),transparent_34%),radial-gradient(circle_at_52%_100%,rgba(255,255,255,0.06),transparent_42%)]"></div> <div class="fixed right-4 top-4 z-50"> ', ' </div> <div class="relative min-h-screen overflow-x-hidden"> ', " </div> ", " </body></html>"])), renderHead(), renderComponent($$result, "ModeToggle", ModeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/root/status-page/src/components/ModeToggle", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
}, "/root/status-page/src/layouts/Main.astro", void 0);

const REFRESH_MS = 15e3;
const formatSnapshotParam = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{2})(\d{2})(\d{4})[\sT]?(\d{2})(\d{2})(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, HH, MM, SS] = match;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(HH), Number(MM), Number(SS)));
  if (date.getUTCFullYear() !== Number(yyyy) || date.getUTCMonth() !== Number(mm) - 1 || date.getUTCDate() !== Number(dd) || date.getUTCHours() !== Number(HH) || date.getUTCMinutes() !== Number(MM) || date.getUTCSeconds() !== Number(SS)) {
    return null;
  }
  return `${dd}${mm}${yyyy} ${HH}${MM}${SS}`;
};
const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : size >= 10 ? 1 : 2)} ${units[unit]}`;
};
const formatRate = (value) => `${formatBytes(value)}/s`;
const formatPercent = (value) => `${value.toFixed(1)}%`;
const formatNumber = (value) => value.toFixed(value >= 100 ? 0 : 0);
function useMetricsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState("all");
  const [sortBy, setSortBy] = useState("memory_desc");
  const [snapshotInput, setSnapshotInput] = useState("");
  const loadData = async (silent = false, customSnapshot) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    try {
      const normalizedSnapshot = formatSnapshotParam(customSnapshot ?? snapshotInput);
      const endpoint = normalizedSnapshot ? `/api/metrics.json?at=${encodeURIComponent(normalizedSnapshot)}` : "/api/metrics.json";
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.message ?? "No se pudo cargar métricas");
      }
      setData(payload);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    void loadData();
    const id = setInterval(() => {
      if (formatSnapshotParam(snapshotInput)) return;
      void loadData(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [snapshotInput]);
  const nodeOptions = useMemo(() => {
    const names = new Set((data?.containers ?? []).map((container) => container.nodeName));
    return ["all", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [data]);
  const filteredContainers = useMemo(() => {
    if (!data) return [];
    const query = searchTerm.trim().toLowerCase();
    const filtered = data.containers.filter((container) => {
      const nodeMatch = selectedNode === "all" || container.nodeName === selectedNode;
      const searchMatch = query.length === 0 || container.id.toLowerCase().includes(query) || container.nodeName.toLowerCase().includes(query);
      return nodeMatch && searchMatch;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "memory_asc":
          return a.memoryBytes - b.memoryBytes;
        case "cpu_desc":
          return b.cpuPercent - a.cpuPercent;
        case "cpu_asc":
          return a.cpuPercent - b.cpuPercent;
        case "rx_desc":
          return b.rxBytesPerSecond - a.rxBytesPerSecond;
        case "tx_desc":
          return b.txBytesPerSecond - a.txBytesPerSecond;
        case "memory_desc":
        default:
          return b.memoryBytes - a.memoryBytes;
      }
    });
    return filtered.slice(0, 80);
  }, [data, searchTerm, selectedNode, sortBy]);
  const resetFilters = async () => {
    const hadSnapshot = Boolean(formatSnapshotParam(snapshotInput));
    setSearchTerm("");
    setSelectedNode("all");
    setSortBy("memory_desc");
    setSnapshotInput("");
    if (hadSnapshot) {
      await loadData(false, "");
    }
  };
  const applySnapshot = async () => {
    const normalized = formatSnapshotParam(snapshotInput);
    if (!normalized) {
      setError("Formato inválido. Usa DDMMYYYY HHMMSS");
      return;
    }
    setSnapshotInput(normalized);
    await loadData(false, normalized);
  };
  const clearSnapshot = async () => {
    setSnapshotInput("");
    await loadData();
  };
  return {
    data,
    error,
    loading,
    refreshing,
    searchTerm,
    selectedNode,
    sortBy,
    snapshotInput,
    nodeOptions,
    filteredContainers,
    setSearchTerm,
    setSelectedNode,
    setSortBy,
    setSnapshotInput,
    loadData,
    resetFilters,
    applySnapshot,
    clearSnapshot,
    hasSnapshot: Boolean(formatSnapshotParam(snapshotInput))
  };
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md" : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-secondary text-secondary-foreground rounded-md data-[selected=true]:bg-transparent data-[selected=true]:text-inherit",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx(
            "div",
            {
              "data-slot": "calendar",
              ref: rootRef,
              className: cn(className2),
              ...props2
            }
          );
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx(
              ChevronRightIcon,
              {
                className: cn("size-4", className2),
                ...props2
              }
            );
          }
          return /* @__PURE__ */ jsx(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx("td", { ...props2, children: /* @__PURE__ */ jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "aria-selected:bg-primary aria-selected:text-primary-foreground dark:aria-selected:bg-white dark:aria-selected:text-zinc-900 aria-selected:border-transparent data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}

function Popover({
  ...props
}) {
  return /* @__PURE__ */ jsx(Popover$1.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(Popover$1.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(Popover$1.Portal, { children: /* @__PURE__ */ jsx(
    Popover$1.Content,
    {
      "data-slot": "popover-content",
      align,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        className
      ),
      ...props
    }
  ) });
}

const Progress = ({ value }) => {
  return /* @__PURE__ */ jsx("div", { className: "h-2.5 w-full overflow-hidden rounded-full bg-border/70", children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500",
      style: { width: `${Math.min(100, Math.max(0, value))}%` }
    }
  ) });
};
const StatCard = ({
  icon,
  label,
  main,
  detail
}) => /* @__PURE__ */ jsxs("article", { className: "rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-xl", children: [
  /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between text-muted-foreground", children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsx("span", { children: icon })
  ] }),
  /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-foreground", children: main }),
  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: detail })
] });
function MetricsDashboard() {
  const {
    data,
    error,
    loading,
    refreshing,
    searchTerm,
    selectedNode,
    sortBy,
    snapshotInput,
    nodeOptions,
    filteredContainers,
    setSearchTerm,
    setSelectedNode,
    setSortBy,
    setSnapshotInput,
    loadData,
    resetFilters,
    clearSnapshot,
    hasSnapshot
  } = useMetricsDashboard();
  const snapshotDate = useMemo(() => {
    const match = snapshotInput.trim().match(/^(\d{2})(\d{2})(\d{4})[\sT]?(\d{2})(\d{2})(\d{2})$/);
    if (!match) return void 0;
    const [, dd, mm, yyyy, HH, MM, SS] = match;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(HH), Number(MM), Number(SS));
    if (parsed.getFullYear() !== Number(yyyy) || parsed.getMonth() !== Number(mm) - 1 || parsed.getDate() !== Number(dd) || parsed.getHours() !== Number(HH) || parsed.getMinutes() !== Number(MM) || parsed.getSeconds() !== Number(SS)) {
      return void 0;
    }
    return parsed;
  }, [snapshotInput]);
  const formatSnapshot = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    const SS = String(date.getSeconds()).padStart(2, "0");
    return `${dd}${mm}${yyyy} ${HH}${MM}${SS}`;
  };
  const setSnapshotDate = (date) => {
    if (!date) return;
    const base = snapshotDate ?? /* @__PURE__ */ new Date();
    const merged = new Date(date);
    merged.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    setSnapshotInput(formatSnapshot(merged));
  };
  const setSnapshotTimeField = (field, value) => {
    const base = snapshotDate ?? /* @__PURE__ */ new Date();
    const parsed = Number(value);
    const clamped = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 0, 0), field === "hours" ? 23 : 59);
    const next = new Date(base);
    if (field === "hours") next.setHours(clamped);
    if (field === "minutes") next.setMinutes(clamped);
    if (field === "seconds") next.setSeconds(clamped);
    setSnapshotInput(formatSnapshot(next));
  };
  if (loading && !data) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 py-16 text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-64 rounded-xl bg-muted/80" }),
      /* @__PURE__ */ jsx("div", { className: "h-40 rounded-2xl bg-muted/60" }),
      /* @__PURE__ */ jsx("div", { className: "h-64 rounded-2xl bg-muted/60" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("main", { className: "relative mx-auto max-w-7xl px-6 py-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-8 flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-cloud text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
        "GeoMakes Hosting"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 self-stretch sm:items-end sm:self-auto", children: [
        data && /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-regular fa-clock text-xs text-muted-foreground/80", "aria-hidden": "true" }),
          data.requestedAt ? `Vista histórica (${data.requestedAt} UTC) - consultado: ${new Date(data.generatedAt).toLocaleString()}` : `Última actualización: ${new Date(data.generatedAt).toLocaleString()}`
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-end gap-2", children: [
          hasSnapshot && /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => void clearSnapshot(),
              className: "inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90",
              children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt text-xs", "aria-hidden": "true" }),
                "Ahora"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => void loadData(true),
              className: "inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-2 text-sm text-foreground transition hover:bg-accent",
              children: [
                /* @__PURE__ */ jsx(ArrowPathIcon, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
                "Actualizar"
              ]
            }
          )
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: [
      "No se pudieron cargar las métricas: ",
      error
    ] }),
    data && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(ServerStackIcon, { className: "h-4 w-4" }),
            label: "Servidores activos",
            main: `${data.summary.totalContainers} servidores`,
            detail: `${data.summary.totalNodes} nodos reportando métricas`
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(CpuChipIcon, { className: "h-4 w-4" }),
            label: "CPU disponible",
            main: `${formatNumber(data.summary.cpuFreeCores)} cores`,
            detail: `${formatPercent(data.summary.cpuUsagePercent)} de uso total`
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(CircleStackIcon, { className: "h-4 w-4" }),
            label: "Memoria libre",
            main: formatBytes(data.summary.memoryFreeBytes),
            detail: `${formatPercent(data.summary.memoryUsagePercent)} de uso`
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(CircleStackIcon, { className: "h-4 w-4" }),
            label: "Disco libre",
            main: formatBytes(data.summary.diskFreeBytes),
            detail: `${formatPercent(data.summary.diskUsagePercent)} de uso`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-4 inline-flex items-center gap-2 text-lg font-medium text-foreground", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-diagram-project text-base text-muted-foreground", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx(ServerStackIcon, { className: "h-5 w-5 text-muted-foreground" }),
          "Nodos"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 lg:grid-cols-3", children: data.nodes.map((node) => /* @__PURE__ */ jsxs(
          "article",
          {
            className: "rounded-2xl border border-border/70 bg-background/50 p-5 shadow-sm backdrop-blur-xl",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("h3", { className: "inline-flex items-center gap-2 text-xl font-semibold text-foreground", children: [
                    /* @__PURE__ */ jsx("i", { className: "fa-solid fa-server text-sm text-muted-foreground", "aria-hidden": "true" }),
                    node.nodeName
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx("i", { className: "fa-solid fa-network-wired text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
                    node.ip
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-400/10 dark:text-emerald-300", children: [
                  /* @__PURE__ */ jsx("i", { className: "fa-solid fa-cubes-stacked text-[10px]", "aria-hidden": "true" }),
                  node.containerCount,
                  " servidores"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("h4", { className: "mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground", children: [
                    /* @__PURE__ */ jsx(ServerIcon, { className: "h-4 w-4 text-muted-foreground" }),
                    "Nodo (host)"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("span", { children: "CPU" }),
                        /* @__PURE__ */ jsx("span", { children: formatPercent(node.hostCpuUsagePercent) })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: node.hostCpuUsagePercent })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("span", { children: "Memoria" }),
                        /* @__PURE__ */ jsx("span", { children: formatPercent(node.hostMemoryUsagePercent) })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: node.hostMemoryUsagePercent })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("span", { children: "Disco" }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          formatBytes(node.diskUsedBytes),
                          " / ",
                          formatBytes(node.diskTotalBytes)
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: node.diskUsagePercent })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("h4", { className: "mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground", children: [
                    /* @__PURE__ */ jsx(CircleStackIcon, { className: "h-4 w-4 text-muted-foreground" }),
                    "Contenedores"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("span", { children: "CPU" }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          formatNumber(node.cpuUsedCores),
                          " / ",
                          formatNumber(node.cpuTotalCores),
                          " cores"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: node.cpuUsagePercent })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("span", { children: "Memoria" }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          formatBytes(node.memoryUsedBytes),
                          " / ",
                          formatBytes(node.memoryTotalBytes)
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: node.memoryUsagePercent })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("span", { children: "Volúmenes" }),
                        /* @__PURE__ */ jsx("span", { children: node.volumesUsedBytes !== null && node.volumesTotalBytes !== null ? `${formatBytes(node.volumesUsedBytes)} / ${formatBytes(node.volumesTotalBytes)}` : "Sin datos" })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: node.volumesUsagePercent ?? 0 }),
                      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground/90", children: node.volumesUsagePercent !== null ? "/var/lib/pterodactyl/volumes" : "Falta métrica custom pterodactyl_volumes_bytes en este nodo" })
                    ] })
                  ] })
                ] })
              ] })
            ]
          },
          node.nodeName
        )) })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h2", { className: "inline-flex items-center gap-2 text-lg font-medium text-foreground", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-boxes-stacked text-base text-muted-foreground", "aria-hidden": "true" }),
            /* @__PURE__ */ jsx(CircleStackIcon, { className: "h-5 w-5 text-muted-foreground" }),
            "Contenedores"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Mostrando ",
            filteredContainers.length,
            " de ",
            data.containers.length
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 rounded-2xl border border-border/70 bg-background/40 p-4 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(MagnifyingGlassIcon, { className: "h-3.5 w-3.5" }),
              "Buscar"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: searchTerm,
                onChange: (event) => setSearchTerm(event.target.value),
                placeholder: "ID o nodo",
                className: "h-10 rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-ring"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(ServerStackIcon, { className: "h-3.5 w-3.5" }),
              "Nodo"
            ] }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: selectedNode,
                onChange: (event) => setSelectedNode(event.target.value),
                className: "h-10 rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-ring",
                children: nodeOptions.map((node) => /* @__PURE__ */ jsx("option", { value: node, children: node === "all" ? "Todos los nodos" : node }, node))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(FunnelIcon, { className: "h-3.5 w-3.5" }),
              "Ordenar por"
            ] }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: sortBy,
                onChange: (event) => setSortBy(event.target.value),
                className: "h-10 rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-ring",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "memory_desc", children: "RAM (mayor a menor)" }),
                  /* @__PURE__ */ jsx("option", { value: "memory_asc", children: "RAM (menor a mayor)" }),
                  /* @__PURE__ */ jsx("option", { value: "cpu_desc", children: "CPU (mayor a menor)" }),
                  /* @__PURE__ */ jsx("option", { value: "cpu_asc", children: "CPU (menor a mayor)" }),
                  /* @__PURE__ */ jsx("option", { value: "rx_desc", children: "RX (mayor a menor)" }),
                  /* @__PURE__ */ jsx("option", { value: "tx_desc", children: "TX (mayor a menor)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => void resetFilters(),
              className: "h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground transition hover:bg-accent",
              children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(ArrowPathIcon, { className: "h-4 w-4" }),
                "Limpiar filtros"
              ] })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs(Popover, { children: [
            /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "h-10 w-full justify-start border-border/70 bg-background/60 text-foreground hover:bg-accent",
                children: [
                  /* @__PURE__ */ jsx(CalendarIcon, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: snapshotDate ? snapshotDate.toLocaleString() : "Elegir fecha y hora" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs(PopoverContent, { className: "w-[360px] rounded-xl border border-border/70 bg-popover/95 p-4 backdrop-blur-xl", align: "end", children: [
              /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border/70 bg-background/50 p-2", children: /* @__PURE__ */ jsx(
                Calendar,
                {
                  className: "rounded-lg bg-transparent text-foreground [--cell-size:2.2rem]",
                  mode: "single",
                  defaultMonth: snapshotDate,
                  selected: snapshotDate,
                  onSelect: setSnapshotDate,
                  fixedWeeks: true,
                  showOutsideDays: true
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2", children: [
                /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground", children: [
                  "HH",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 23,
                      value: snapshotDate ? String(snapshotDate.getHours()).padStart(2, "0") : "00",
                      onChange: (event) => setSnapshotTimeField("hours", event.target.value),
                      className: "mt-1 h-9 w-full rounded-lg border border-border/70 bg-background/60 px-2 text-center text-sm text-foreground tabular-nums outline-none focus:border-ring"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground", children: [
                  "MM",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 59,
                      value: snapshotDate ? String(snapshotDate.getMinutes()).padStart(2, "0") : "00",
                      onChange: (event) => setSnapshotTimeField("minutes", event.target.value),
                      className: "mt-1 h-9 w-full rounded-lg border border-border/70 bg-background/60 px-2 text-center text-sm text-foreground tabular-nums outline-none focus:border-ring"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground", children: [
                  "SS",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 59,
                      value: snapshotDate ? String(snapshotDate.getSeconds()).padStart(2, "0") : "00",
                      onChange: (event) => setSnapshotTimeField("seconds", event.target.value),
                      className: "mt-1 h-9 w-full rounded-lg border border-border/70 bg-background/60 px-2 text-center text-sm text-foreground tabular-nums outline-none focus:border-ring"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground/90", children: "Formato: DDMMYYYY HHMMSS" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl border border-border/70 bg-background/50 shadow-sm backdrop-blur-xl", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[860px] text-left text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-background/70 text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-fingerprint text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "ID"
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-server text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "Nodo"
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-microchip text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "CPU"
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-memory text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "RAM"
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-download text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "RX"
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-upload text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "TX"
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square text-[10px] text-muted-foreground/80", "aria-hidden": "true" }),
              "Panel"
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            filteredContainers.map((container) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/60 text-foreground", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: container.id }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: container.nodeName }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: formatPercent(container.cpuPercent) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: formatBytes(container.memoryBytes) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: formatRate(container.rxBytesPerSecond) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: formatRate(container.txBytesPerSecond) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: container.panelUrl,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/60 px-3 py-1 text-xs text-foreground transition hover:bg-accent",
                  children: [
                    /* @__PURE__ */ jsx(ArrowTopRightOnSquareIcon, { className: "h-3.5 w-3.5" }),
                    "Abrir"
                  ]
                }
              ) })
            ] }, `${container.nodeName}-${container.id}`)),
            filteredContainers.length === 0 && /* @__PURE__ */ jsx("tr", { className: "border-t border-border/60", children: /* @__PURE__ */ jsxs("td", { colSpan: 7, className: "px-4 py-8 text-center text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass-minus mr-2 text-muted-foreground/80", "aria-hidden": "true" }),
              "No hay contenedores que coincidan con los filtros."
            ] }) })
          ] })
        ] }) }) })
      ] })
    ] })
  ] });
}

const $$MetricsDashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MetricsDashboardClient", MetricsDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/root/status-page/src/components/metrics-dashboard", "client:component-export": "default" })}`;
}, "/root/status-page/src/components/MetricsDashboard.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Main, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MetricsDashboard", $$MetricsDashboard, {})} ` })}`;
}, "/root/status-page/src/pages/index.astro", void 0);

const $$file = "/root/status-page/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
