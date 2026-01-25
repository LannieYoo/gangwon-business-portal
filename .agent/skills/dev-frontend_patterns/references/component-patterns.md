# 组件模式详解

## 组合模式（Composition）

```typescript
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  className?: string
}

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <div className={clsx(
      'rounded-xl overflow-hidden',
      {
        'bg-white': variant === 'default',
        'bg-white border border-gray-200': variant === 'outlined',
        'bg-white shadow-lg': variant === 'elevated',
      },
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={clsx('px-6 py-4 border-b border-gray-100', className)}>{children}</div>
}

export function CardBody({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={clsx('px-6 py-4 border-t border-gray-100 bg-gray-50', className)}>{children}</div>
}

// 使用
<Card variant="elevated">
  <CardHeader>
    <h3 className="text-lg font-semibold">标题</h3>
  </CardHeader>
  <CardBody>
    <p className="text-gray-600">内容区域</p>
  </CardBody>
  <CardFooter>
    <Button>操作</Button>
  </CardFooter>
</Card>
```

## 复合组件模式（Compound Components）

```typescript
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab components must be used within Tabs')
  return context
}

export function Tabs({ children, defaultTab, onChange }: {
  children: React.ReactNode
  defaultTab: string
  onChange?: (tab: string) => void
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleSetActiveTab = useCallback((tab: string) => {
    setActiveTab(tab)
    onChange?.(tab)
  }, [onChange])

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex border-b border-gray-200" role="tablist">
      {children}
    </div>
  )
}

export function Tab({ id, children }: { id: string, children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabs()
  const isActive = activeTab === id

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={clsx(
        'px-4 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500',
        isActive
          ? 'border-b-2 border-indigo-500 text-indigo-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

export function TabPanel({ id, children }: { id: string, children: React.ReactNode }) {
  const { activeTab } = useTabs()

  if (activeTab !== id) return null

  return (
    <div role="tabpanel" className="py-4">
      {children}
    </div>
  )
}

// 使用
<Tabs defaultTab="overview" onChange={(tab) => console.log('切换到', tab)}>
  <TabList>
    <Tab id="overview">概览</Tab>
    <Tab id="details">详情</Tab>
    <Tab id="settings">设置</Tab>
  </TabList>
  <TabPanel id="overview">概览内容...</TabPanel>
  <TabPanel id="details">详情内容...</TabPanel>
  <TabPanel id="settings">设置内容...</TabPanel>
</Tabs>
```

## Render Props 模式

```typescript
interface DataLoaderProps<T> {
  url: string
  children: (props: {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => void
  }) => React.ReactNode
}

export function DataLoader<T>({ url, children }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return <>{children({ data, loading, error, refetch: fetchData })}</>
}

// 使用
<DataLoader<Document[]> url="/api/documents">
  {({ data, loading, error, refetch }) => {
    if (loading) return <Skeleton />
    if (error) return <ErrorMessage error={error} onRetry={refetch} />
    return <DocumentList documents={data!} />
  }}
</DataLoader>
```

## 高阶组件模式（HOC）

```typescript
// 添加认证检查的 HOC
function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/login')
      }
    }, [isAuthenticated, isLoading, navigate])

    if (isLoading) return <LoadingScreen />
    if (!isAuthenticated) return null

    return <WrappedComponent {...props} />
  }
}

// 使用
const ProtectedDashboard = withAuth(Dashboard)
```

## 受控/非受控组件模式

```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-lg border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500',
            {
              'px-3 py-1.5 text-sm': size === 'sm',
              'px-4 py-2 text-base': size === 'md',
              'px-5 py-3 text-lg': size === 'lg',
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```
