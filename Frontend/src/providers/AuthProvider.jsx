import { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // checkAuthStatus is moved inside the useEffect to ensure interceptors are registered first

    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    delete config.headers.Authorization;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        let isRefreshing = false;
        let failedQueue = [];

        const processQueue = (error, token = null) => {
            failedQueue.forEach(prom => {
                if (error) {
                    prom.reject(error);
                } else {
                    prom.resolve(token);
                }
            });
            failedQueue = [];
        };

        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 and specific "Token expired" message from our middleware
                if (error.response?.status === 401 && error.response?.data?.message === "Token expired" && !originalRequest._retry) {
                    if (isRefreshing) {
                        // Queue the request until token is refreshed
                        return new Promise(function (resolve, reject) {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axiosInstance(originalRequest);
                        }).catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        // Send request to refresh endpoint. `withCredentials: true` ensures the httpOnly cookie is sent
                        const res = await axiosInstance.post('/auth/refresh');
                        const newAccessToken = res.data.token;

                        // Save new token
                        localStorage.setItem('token', newAccessToken);

                        // Update Axios default header and retry the original request
                        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        processQueue(null, newAccessToken);
                        return axiosInstance(originalRequest);

                    } catch (refreshError) {
                        // If refresh fails, log them out
                        processQueue(refreshError, null);
                        localStorage.removeItem('token');
                        setUser(null);
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }
                return Promise.reject(error);
            }
        );
        const checkAuthStatus = async () => {
            try {
                let token = localStorage.getItem('token');

                // If there's no token in localStorage, attempt a silent refresh anyway
                // (e.g. user closed tab, localStorage cleared, but they still have a valid HttpOnly cookie)
                if (!token) {
                    try {
                        const refreshRes = await axiosInstance.post('/auth/refresh');
                        token = refreshRes.data.token;
                        localStorage.setItem('token', token);
                    } catch (err) {
                        // Silent fail for guests who don't have a token or cookie
                    }
                }

                if (token) {
                    const res = await axiosInstance.get('/auth/me');
                    setUser(res.data.user);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const login = async (email, password) => {
        const res = await axiosInstance.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (formData) => {
        const res = await axiosInstance.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);