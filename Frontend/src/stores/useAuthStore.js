import { create } from "zustand";
import { axiosInstance } from "@/services/axios";

export const useAuthStore = create((set) => ({
    isAdmin: false,
    isLoading: true,
    error: null,

    checkAdminStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/check");
            set({ isAdmin: response.data.data.admin });
        } catch (error) {
            set({ isAdmin: false, error: error.response?.data?.message || "Unauthorized" });
        } finally {
            set({ isLoading: false });
        }
    },
}));
