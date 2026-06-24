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
                    background: 'var(--color-common-black)',
                    color: 'var(--color-foreground)',
                    border: '0.5px solid var(--color-form-border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    textTransform: "capitalize",
                    maxWidth: '400px',
                    fontFamily: 'var(--font-fustat)',
                    boxShadow: '0 6px 32px rgba(0, 0, 0, 0.4), 0 0 0 0.5px rgba(255, 255, 255, 0.03)',
                },
                success: {
                    style: {
                        border: '0.5px solid rgba(34, 197, 94, 0.5)',
                        background: 'color-mix(in srgb, rgb(34, 197, 94) 12%, var(--color-common-black))',
                    },
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: 'var(--color-common-black)',
                    },
                },
                error: {
                    style: {
                        border: '0.5px solid rgba(239, 68, 68, 0.4)',
                        background: 'color-mix(in srgb, rgb(239, 68, 68) 12%, var(--color-common-black))',
                    },
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: 'var(--color-common-black)',
                    },
                },
                loading: {
                    style: {
                        border: '0.5px solid var(--color-form-border)',
                    },
                },
                blank: {
                    style: {
                        border: '0.5px solid rgba(193, 152, 86, 0.3)',
                        background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-common-black))',
                    },
                    iconTheme: {
                        primary: 'var(--color-primary)',
                        secondary: 'var(--color-common-black)',
                    },
                },
            }}
        />
    );
};

export default ToasterProvider;