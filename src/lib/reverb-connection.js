import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import logoAsset from '../assets/Logo.png';

// Assign Pusher and Echo to window for global access
window.Pusher = Pusher;

export { logoAsset };

/**
 * Play a gentle, modern audio chime using Web Audio API
 */
export const playNotificationChime = () => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        // Primary bell tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.6);

        // Secondary subtle harmonic
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6

        gain2.gain.setValueAtTime(0.08, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.1);
        osc2.stop(now + 0.7);
    } catch (e) {
        // Silent fallback if audio context is blocked
    }
};

/**
 * Trigger native mobile haptic feedback if running inside Capacitor
 */
export const triggerNotificationHaptics = async () => {
    try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
            const { Haptics, NotificationType } = await import('@capacitor/haptics');
            await Haptics.notification({ type: NotificationType.Success });
        }
    } catch (e) {
        // Haptics not supported or permitted
    }
};

/**
 * Initialize Laravel Echo with Reverb WebSocket Connection
 */
export const initEcho = (token) => {
    const rawKey = import.meta.env.VITE_REVERB_APP_KEY || import.meta.env.REVERB_APP_KEY;
    if (!rawKey) {
        return null;
    }

    const key = String(rawKey).replace(/^["']|["']$/g, '').trim();
    const rawHost = import.meta.env.VITE_REVERB_HOST || import.meta.env.REVERB_HOST || 'reverb.owner-pulse.com';
    const wsHost = String(rawHost).replace(/^["']|["']$/g, '').trim();

    const rawPort = import.meta.env.VITE_REVERB_PORT || import.meta.env.REVERB_PORT || 443;
    const wsPort = Number(String(rawPort).replace(/^["']|["']$/g, '').trim()) || 443;

    const rawScheme = import.meta.env.VITE_REVERB_SCHEME || import.meta.env.REVERB_SCHEME || 'https';
    const scheme = String(rawScheme).replace(/^["']|["']$/g, '').trim();
    const forceTLS = scheme === 'https';

    const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'https://staging-back.owner-pulse.com';
    const baseUrl = String(rawBaseUrl).replace(/^["']|["']$/g, '').replace(/\/$/, '');

    const echoInstance = new Echo({
        broadcaster: 'reverb',
        Pusher: Pusher,
        key: key,
        wsHost: wsHost,
        wsPort: wsPort ?? 80,
        wssPort: wsPort ?? 443,
        forceTLS: forceTLS,
        enabledTransports: ['ws', 'wss'],
        // Backend authentication endpoint for private channels
        authEndpoint: `${baseUrl}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });

    window.Echo = echoInstance;
    return echoInstance;
};

/**
 * Request Push & Local Notification Permissions and set up Android notification channels
 */
export const requestNotificationPermission = async () => {
    try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const check = await LocalNotifications.checkPermissions();
            let status = check;
            if (check.display !== 'granted') {
                status = await LocalNotifications.requestPermissions();
            }

            // Create high-importance notification channel for Android (API 26+)
            try {
                await LocalNotifications.createChannel({
                    id: 'ownerpulse_alerts',
                    name: 'OwnerPulse Alerts',
                    description: 'Real-time alerts, tasks, and system notifications for OwnerPulse',
                    importance: 5, // High / Heads-up notification
                    visibility: 1, // Public on lockscreen
                    vibration: true,
                    lights: true,
                    lightColor: '#4880FF',
                });
            } catch (chanErr) {
                console.warn('Notification channel setup notice:', chanErr);
            }

            return status.display === 'granted';
        } else if ('Notification' in window) {
            if (Notification.permission === 'granted') return true;
            if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
        }
    } catch (e) {
        console.warn('Notification permission request error:', e);
    }
    return false;
};

/**
 * Listen for notification click/action in Capacitor native mobile app
 */
export const setupNotificationTapListener = (onNavigate) => {
    try {
        import('@capacitor/core').then(({ Capacitor }) => {
            if (Capacitor.isNativePlatform()) {
                import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
                    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                        const extra = notificationAction.notification?.extra;
                        const path = extra?.path || extra?.link;
                        if (path && typeof onNavigate === 'function') {
                            onNavigate(path);
                        }
                    });
                });
            }
        });
    } catch (e) {
        console.warn('Error setting up notification tap listener:', e);
    }
};

/**
 * Normalize incoming notification payload from various backend structures
 */
const normalizeNotification = (event) => {
    const raw = event?.notification || event?.data || event;
    const title = raw?.title || raw?.heading || event?.title || 'OwnerPulse Notification';
    const body = raw?.body || raw?.message || raw?.description || event?.body || event?.message || '';
    const path = raw?.path || raw?.link || raw?.url || event?.path || event?.link || null;
    const type = raw?.type || event?.type || 'general';
    const id = raw?.id || event?.id || `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const isCritical = Boolean(raw?.critical || raw?.is_critical || event?.critical || title?.toLowerCase().includes('critical'));

    return {
        id,
        title,
        body,
        description: body,
        path,
        type,
        critical: isCritical,
        time: Date.now(),
        raw: event,
    };
};

/**
 * Listen for real-time notifications for the authenticated user
 */
export const listenToNotifications = (echoInstance, userId, onNotificationReceived) => {
    if (!echoInstance || !userId) return () => { };

    // Track connection state & errors on Pusher safely
    try {
        const pusher = echoInstance.connector?.pusher;
        if (pusher) {
            pusher.connection.bind('state_change', (states) => {
                // Log state change safely without throwing errors
            });
            pusher.connection.bind('error', (err) => {
                console.warn('⚡️ Reverb Echo connection notice:', err);
            });
        }
    } catch (e) {
        // Ignore pusher listener setup errors
    }

    // Deduplication tracker to prevent duplicate alerts within 3 seconds
    const recentEventIds = new Set();

    const handleEvent = async (rawEvent, eventName = '') => {
        // Filter out pusher internal system events (ping, pong, subscription_succeeded)
        if (eventName.startsWith('pusher:') || eventName.startsWith('pusher_internal:')) {
            return;
        }

        const notif = normalizeNotification(rawEvent);

        // Deduplicate
        const dedupKey = `${notif.id}-${notif.title}`;
        if (recentEventIds.has(dedupKey)) return;
        recentEventIds.add(dedupKey);
        setTimeout(() => recentEventIds.delete(dedupKey), 3000);

        // 1. Play chime sound
        playNotificationChime();

        // 2. Trigger mobile haptics
        triggerNotificationHaptics();

        try {
            const { Capacitor } = await import('@capacitor/core');

            // A. Native Mobile App (Capacitor JS) -> Schedule Local Notification
            if (Capacitor.isNativePlatform()) {
                const { LocalNotifications } = await import('@capacitor/local-notifications');
                
                // Ensure permission before scheduling
                const check = await LocalNotifications.checkPermissions();
                if (check.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }

                await LocalNotifications.schedule({
                    notifications: [
                        {
                            id: Math.floor(Math.random() * 1000000),
                            title: notif.title,
                            body: notif.body,
                            extra: {
                                path: notif.path,
                                id: notif.id,
                                type: notif.type,
                            },
                            channelId: 'ownerpulse_alerts',
                            smallIcon: 'ic_stat_notification',
                            iconColor: '#4880FF',
                            schedule: { at: new Date(Date.now() + 100) },
                        },
                    ],
                });
                console.log('📱 Mobile push notification scheduled successfully:', notif.title);
            }
            // B. Desktop / Web Browser -> Browser Notification
            else if ('Notification' in window && Notification.permission === 'granted') {
                const browserNotif = new Notification(notif.title, {
                    body: notif.body,
                    icon: logoAsset || '/logo.png',
                    badge: logoAsset || '/favicon-32x32.png',
                    data: { path: notif.path },
                });

                browserNotif.onclick = () => {
                    window.focus();
                    if (notif.path && window.__pulse_navigate) {
                        window.__pulse_navigate(notif.path);
                    }
                };
            }
        } catch (e) {
            console.warn('Error dispatching push notification to device:', e);
        }

        // Callback to update in-app state (badge count, toast, queryClient)
        if (typeof onNotificationReceived === 'function') {
            onNotificationReceived(notif);
        }
    };

    // Helper to register listeners on a channel
    const registerChannelListeners = (channel) => {
        if (!channel) return;

        // Listen to standard notification method
        if (typeof channel.notification === 'function') {
            channel.notification((e) => handleEvent(e, 'Notification'));
        }

        // Listen to all events on channel if supported
        if (typeof channel.listenToAll === 'function') {
            channel.listenToAll((evt, data) => handleEvent(data, evt));
        }

        // Listen to specific common event names
        const commonEvents = [
            '.NotificationEvent',
            'NotificationEvent',
            '.notification',
            'notification',
            '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
            'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
            '.App\\Events\\NotificationEvent',
            'App\\Events\\NotificationEvent'
        ];

        commonEvents.forEach((evt) => {
            if (typeof channel.listen === 'function') {
                channel.listen(evt, (e) => handleEvent(e, evt));
            }
        });
    };

    // 1. Subscribe to private channels
    const privateNotify = echoInstance.private(`notify.${userId}`);
    registerChannelListeners(privateNotify);

    const privateUser = echoInstance.private(`App.Models.User.${userId}`);
    registerChannelListeners(privateUser);

    const privateUserShort = echoInstance.private(`user.${userId}`);
    registerChannelListeners(privateUserShort);

    // 2. Also subscribe to public channels as fallback (in case backend sends on public channel)
    const publicNotify = echoInstance.channel(`notify.${userId}`);
    registerChannelListeners(publicNotify);

    const publicUser = echoInstance.channel(`user.${userId}`);
    registerChannelListeners(publicUser);

    // 3. Bind global listener on Pusher connection to catch ANY unhandled event
    try {
        const pusher = echoInstance.connector?.pusher;
        if (pusher && typeof pusher.bind_global === 'function') {
            pusher.bind_global((eventName, data) => {
                if (!eventName.startsWith('pusher:') && !eventName.startsWith('pusher_internal:')) {
                    handleEvent(data, eventName);
                }
            });
        }
    } catch (e) {
        // Ignore global bind fallback error
    }

    return () => {
        try {
            echoInstance.leave(`notify.${userId}`);
            echoInstance.leave(`App.Models.User.${userId}`);
            echoInstance.leave(`user.${userId}`);
        } catch (e) {
            // Ignore leave errors on teardown
        }
    };
};
