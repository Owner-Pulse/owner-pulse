import { Toaster } from 'react-hot-toast';

const ToasterProvider = () => {
    return (
        <Toaster
            containerClassName="custom-toaster-container"
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#ffffff',
                    color: '#1D2939',
                    border: '1px solid #E4E7EC',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    textTransform: "capitalize",
                    maxWidth: '400px',
                    fontFamily: 'var(--font-fustat)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                },
                success: {
                    style: {
                        border: '1px solid #A7F3D0',
                        background: '#ECFDF5',
                        color: '#065F46',
                    },
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#ffffff',
                    },
                },
                error: {
                    style: {
                        border: '1px solid #FECACA',
                        background: '#FEF2F2',
                        color: '#991B1B',
                    },
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#ffffff',
                    },
                },
                loading: {
                    style: {
                        border: '1px solid #DBEAFE',
                        background: '#EFF6FF',
                        color: '#1E40AF',
                    },
                },
                blank: {
                    style: {
                        border: '1px solid #FDE68A',
                        background: '#FFFBEB',
                        color: '#92400E',
                    },
                    iconTheme: {
                        primary: '#F59E0B',
                        secondary: '#ffffff',
                    },
                },
            }}
        />
    );
};

export default ToasterProvider;