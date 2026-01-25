# Hooks 模式详解

## 数据获取 Hook

```typescript
interface UseQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetcher, options]);

  useEffect(() => {
    if (options?.enabled !== false) {
      refetch();
    }
  }, [key, refetch, options?.enabled]);

  // 自动刷新
  useEffect(() => {
    if (options?.refetchInterval && options.enabled !== false) {
      const interval = setInterval(refetch, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetch, options?.refetchInterval, options?.enabled]);

  return { data, error, loading, refetch };
}

// 使用
const {
  data: documents,
  loading,
  error,
  refetch,
} = useQuery("documents", () => fetch("/api/documents").then((r) => r.json()), {
  onSuccess: (data) => console.log("获取到", data.length, "个文档"),
  onError: (err) => console.error("失败:", err),
  refetchInterval: 30000, // 30秒自动刷新
});
```

## 防抖 Hook

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

## 节流 Hook

```typescript
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}
```

## 切换 Hook

```typescript
export function useToggle(
  initialValue = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle, setValue];
}

// 使用
const [isOpen, toggleOpen, setOpen] = useToggle(false);
```

## 本地存储 Hook

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

// 使用
const [theme, setTheme] = useLocalStorage("theme", "light");
```

## 媒体查询 Hook

```typescript
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// 使用
const isMobile = useMediaQuery("(max-width: 768px)");
const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
const isDesktop = useMediaQuery("(min-width: 1025px)");
```

## 点击外部 Hook

```typescript
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// 使用
const dropdownRef = useRef<HTMLDivElement>(null);
const [isOpen, setIsOpen] = useState(false);

useOnClickOutside(dropdownRef, () => setIsOpen(false));
```

## 异步操作 Hook

```typescript
type AsyncState<T> =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

export function useAsync<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ status: "pending" });
      try {
        const data = await asyncFunction(...args);
        setState({ status: "success", data });
        return data;
      } catch (error) {
        setState({ status: "error", error: error as Error });
        throw error;
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { ...state, execute, reset };
}

// 使用
const { status, data, error, execute } = useAsync(uploadDocument);

const handleUpload = async (file: File) => {
  try {
    await execute(file);
    toast.success("上传成功");
  } catch {
    toast.error("上传失败");
  }
};
```

## 前一个值 Hook

```typescript
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 使用
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);

// prevCount 是上一次渲染时的 count 值
```
