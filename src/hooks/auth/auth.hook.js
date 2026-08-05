import { axiosPublic } from "@/lib/axios.public";
import { AuthService } from "@/services";
import { useMutation } from "@tanstack/react-query";

const axiosInstance = axiosPublic();

// sign in hook for owner and director
export const useSignin = () => {
    const {
        mutateAsync: signin,
        isPending
    } = useMutation({
        mutationKey: ['signin'],
        mutationFn: (payload) => AuthService.signInService(payload, axiosInstance),
    });

    return {
        signin,
        isPending
    };
};


// sign out hook for owner and director
export const useSignout = () => {
    const {
        mutateAsync: signout,
        isPending
    } = useMutation({
        mutationFn: () => AuthService.signOutService(axiosInstance),
    });

    return {
        signout,
        isPending
    };
};

