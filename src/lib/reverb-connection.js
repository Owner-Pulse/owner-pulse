import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Assign Pusher to window for Laravel Echo compatibility
window.Pusher = Pusher;

/**
 * Initialize Laravel Echo with Reverb WebSocket Connection
 */
export const initEcho = (token) => {
    const key = import.meta.env.VITE_REVERB_APP_KEY;
    if (!key) {
        console.warn('Reverb App Key is missing or disabled. Echo disabled.');
        return null;
    }
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || '';

    return new Echo({
        broadcaster: 'reverb',
        key: key,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        // Backend auth endpoint for private channels
        authEndpoint: `${baseUrl}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });
};

/**
 * Request Push & Local Notification Permissions
 */
export const requestNotificationPermission = async () => {
    try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const status = await LocalNotifications.requestPermissions();
            return status.display === 'granted';
        } else if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
    } catch (e) {
        console.warn('Notification permission request error:', e);
    }
    return false;
};

/**
 * Listen for real-time notifications for the authenticated user
 */
export const listenToNotifications = (echoInstance, userId, onNotificationReceived) => {
    if (!echoInstance || !userId) return;

    // Listen on private channel: notify.{userId}
    echoInstance.private(`notify.${userId}`)
        .listen('.NotificationEvent', async (event) => {
            console.log('⚡️ Real-time Notification Received via Reverb:', event);

            try {
                const { Capacitor } = await import('@capacitor/core');

                // A. Native Mobile App / PWA (Capacitor JS) -> Push Local Notification
                if (Capacitor.isNativePlatform()) {
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    await LocalNotifications.schedule({
                        notifications: [
                            {
                                id: Math.floor(Math.random() * 100000),
                                title: event.title,
                                body: event.body,
                                extra: event.data || {},
                                smallIcon: 'ic_stat_notification',
                            },
                        ],
                    });
                }
                // B. Desktop / Web Browser -> Browser Notification
                else if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(event.title || 'New Notification', {
                        body: event.body || '',
                        icon: event.icon || '/logo.png',
                        data: event.data,
                    });
                }
            } catch (e) {
                console.warn('Error handling local notification:', e);
            }

            // Callback to update in-app state (badge count, dropdown list, etc.)
            if (typeof onNotificationReceived === 'function') {
                onNotificationReceived(event);
            }
        });
};
