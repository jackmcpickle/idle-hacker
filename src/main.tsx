import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ErrorComponent } from '@/components/ErrorComponent';
import { Spinner } from '@/components/ui/Spinner';


// Import the generated route tree
import { routeTree } from './routeTree.gen'

export const queryClient = new QueryClient();


// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        // We'll inject auth when we render
        // oxlint-disable-next-line no-non-null-assertion
        auth: undefined!,
        queryClient,
    },
    defaultPreload: 'intent',
    defaultViewTransition: true,
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error, reset }) => (
        <ErrorComponent
            error={error}
            reset={reset}
        />
    ),
    defaultPendingComponent: () => (
        <div className={`p-4`}>
            <Spinner />
        </div>
    ),
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
      <StrictMode>
          <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
  )
}
