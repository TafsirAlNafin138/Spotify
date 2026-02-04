import { useAuth, useUser } from "@clerk/clerk-react";
import { axiosInstance } from "../services/axios";
import { useState, useEffect } from "react";

const updateToken = (token = null) => {
    if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common["Authorization"];
    }
}

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        const syncUser = async () => {
            try {
                // Only sync if user is signed in
                if (!isSignedIn) {
                    setLoading(false);
                    return;
                }

                const token = await getToken();
                updateToken(token);

                if (token && user) {
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
    }, [getToken, isSignedIn, user]);

    return <>{children}</>;
};

export default AuthProvider;