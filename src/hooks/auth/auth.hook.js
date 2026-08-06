import { axiosPrivate } from "@/lib/axios.private";
import { axiosPublic } from "@/lib/axios.public";
import { AuthService } from "@/services";
import { useMutation } from "@tanstack/react-query";

// sign in hook for owner and director
export const useSignin = () => {
    const publicAxios = axiosPublic();
    const {
        mutateAsync: signin,
        isPending
    } = useMutation({
        mutationKey: ['signin'],
        mutationFn: (payload) => AuthService.signInService(payload, publicAxios),
    });

    return {
        signin,
        isPending
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

