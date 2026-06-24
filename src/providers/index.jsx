import ReactQueryProvider from "./react-query.provider"
import ToasterProvider from "./toaster.provider"


export const Providers = ({ children }) => {
    return (
        <ReactQueryProvider>
            {children}
            <ToasterProvider />
        </ReactQueryProvider>
    );
};