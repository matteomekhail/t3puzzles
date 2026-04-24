import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { useAuth } from './shoo'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const queryClient = new QueryClient()

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <QueryClientProvider client={queryClient}>
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      <RouterProvider router={router} />
    </ConvexProviderWithAuth>
  </QueryClientProvider>,
)
