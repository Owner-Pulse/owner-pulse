import { axiosPrivate } from "@/lib/axios.private";
import { notificationService } from "@/services/notification.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useGetNotifications = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => notificationService.get_notifications(axiosInstance),
        refetchInterval: 30000,
    });

    const rawList = data?.data?.data || (Array.isArray(data?.data) ? data.data : []);
    const notifications = rawList.map((n) => ({
        id: n.id,
        title: n.title || "Notification",
        description: n.body || n.description || "",
        body: n.body || n.description || "",
        read: Boolean(n.read_at),
        read_at: n.read_at,
        created_at: n.created_at,
        time: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
        critical: Boolean(n.critical || n.is_critical || n.title?.toLowerCase().includes("critical")),
        type: n.type || "general",
        path: n.path || null,
    }));

    return {
        notifications,
        rawResponse: data,
        isLoading,
        isError,
        error,
        refetch,
    };
};

export const useMarkNotificationAsRead = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: markAsRead, isPending } = useMutation({
        mutationKey: ["mark-notification-as-read"],
        mutationFn: (id) => notificationService.mark_as_read(axiosInstance, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to mark notification as read");
        },

    });

    return {
        markAsRead,
        isPending,
    };
};

export const useMarkAllNotificationsAsRead = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: markAllAsRead, isPending } = useMutation({
        mutationKey: ["mark-all-notifications-as-read"],
        mutationFn: () => notificationService.mark_all_as_read(axiosInstance),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("All notifications marked as read");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to mark all notifications as read");
        },
    });

    return {
        markAllAsRead,
        isPending,
    };
};
