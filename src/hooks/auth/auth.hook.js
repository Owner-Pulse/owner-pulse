import { axiosPrivate } from "@/lib/axios.private";
import { axiosPublic } from "@/lib/axios.public";
import { AuthService } from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";

// sign in hook for owner and director
export const useSignin = () => {
    const publicAxios = axiosPublic();
    const {
        mutate: signin,
        isPending,
        error,
        isError
    } = useMutation({
        mutationKey: ['signin'],
        mutationFn: (payload) => AuthService.signInService(payload, publicAxios),
    });

    return {
        signin,
        isPending,
        error,
        isError
    };
};


// sign out hook for owner and director
export const useSignout = () => {
    const privateAxios = axiosPrivate();
    const {
        mutateAsync: signout,
        isPending
    } = useMutation({
        mutationFn: () => AuthService.signOutService(privateAxios),
    });

    return {
        signout,
        isPending
    };
};

