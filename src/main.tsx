import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root')!)

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

root.render(<Root />)

if (import.meta.env.DEV) {
  // Only show React Query Devtools on admin routes during development
  const onAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  if (onAdminRoute) {
    import('@tanstack/react-query-devtools')
      .then(({ ReactQueryDevtools }) => {
        root.render(
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        )
      })
      .catch(() => {
        // Devtools not installed; ignore
      })
  }
}
