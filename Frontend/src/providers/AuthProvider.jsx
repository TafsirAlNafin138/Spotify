import { useAuth, useUser } from "@clerk/clerk-react";
import { axiosInstance } from "../services/axios";
import { useState, useEffect, useRef } from "react";

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();
    const getTokenRef = useRef(getToken);

    // Keep the ref up-to-date with the latest getToken function
    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    // Set up Axios interceptor to attach a fresh token on every request
    useEffect(() => {
        const interceptor = axiosInstance.interceptors.request.use(
            async (config) => {
                try {
                    const token = await getTokenRef.current();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    } else {
                        delete config.headers.Authorization;
                    }
                } catch (error) {
                    console.error("❌ Error getting auth token:", error);
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Clean up the interceptor when the component unmounts
        return () => {
            axiosInstance.interceptors.request.eject(interceptor);
        };
    }, []);

    // Sync user data with the backend on sign-in
    useEffect(() => {
        const syncUser = async () => {
            try {
                if (!isSignedIn) {
                    setLoading(false);
                    return;
                }

                if (user) {
                    const res = await axiosInstance.post('/auth/callback', {
                        clerk_id: user.id,
                        email_addresses: user.emailAddresses,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        image_url: user.imageUrl,
                    });
                    console.log("✅ User synced:", res.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("❌ Error syncing user:", error.response?.data || error.message);
                setLoading(false);
            }
        };
        syncUser();
    }, [isSignedIn, user]);

    return <>{children}</>;
};

export default AuthProvider;