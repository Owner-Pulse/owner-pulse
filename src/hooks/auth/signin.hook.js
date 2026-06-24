import { axiosPublic } from "@/lib/axios.public";
import { useMutation } from "@tanstack/react-query";
import { SigninService } from "@/services";

export const useSignin = () => {
    const axiosInstance = axiosPublic();

    const {
        mutateAsync: signin,
        isPending
    } = useMutation({
        mutationKey: ['signin'],
        mutationFn: (payload) => SigninService(payload, axiosInstance),
    });

    return {
        signin,
        isPending
    };
};