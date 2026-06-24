import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
        },
    },
});

const ReactQueryProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;