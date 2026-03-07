import { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
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

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const interceptor = axiosInstance.interceptors.request.use(
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

        return () => {
            axiosInstance.interceptors.request.eject(interceptor);
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

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);