"use client";

import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import axios from "axios";

const useAxiosPrivate = () => {
    const accessToken: string = typeof window !== "undefined" && localStorage.getItem("userInfo") 
        ? JSON.parse(localStorage.getItem("userInfo") || "{}").accessToken 
        : "";       
    const refresh = useRefreshToken();

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            config => {
                if(!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }                
                return config
            },
            (error) => {
                return Promise.reject(error)
            }   
        );

        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;

                if(error?.response?.status === 403 && !prevRequest?.sent){
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axios(prevRequest);
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [refresh,accessToken]);

    return axios;
};

export default useAxiosPrivate;