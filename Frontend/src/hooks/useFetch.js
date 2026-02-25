import { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '@/services/axios';
import toast from 'react-hot-toast';

/**
 * Generic hook to fetch data from any API endpoint
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Whether to fetch immediately on mount (default: true)
 * @param {string} options.errorMessage - Custom error message for toast
 * @param {boolean} options.showErrorToast - Whether to show error toast (default: true)
 * @param {Function} options.onSuccess - Callback function on successful fetch
 * @param {Function} options.onError - Callback function on error
 * @param {any} options.initialData - Initial data state
 * 
 * @returns {Object} { data, loading, error, refetch, setData }
 * 
 * @example
 * const { data: albums, loading, error, refetch } = useFetch('/albums');
 * 
 * @example
 * const { data: album, loading } = useFetch(`/albums/${id}`, {
 *   immediate: !!id,
 *   onSuccess: (data) => console.log('Fetched:', data)
 * });
 */
export const useFetch = (url, options = {}) => {
    const {
        immediate = true,
        errorMessage = 'Failed to fetch data',
        showErrorToast = true,
        onSuccess,
        onError,
        initialData = null
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(url);
            
            // Handle both formats: { data: ... } and direct data
            const responseData = response.data.data || response.data;
            setData(responseData);

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(responseData);
            }
        } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);

            // Call error callback if provided
            if (onError) {
                onError(err);
            }

            // Show error toast unless disabled or it's an auth error
            if (showErrorToast && err.response?.status !== 401 && err.response?.status !== 403) {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [url, errorMessage, showErrorToast, onSuccess, onError]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [fetchData, immediate]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        setData
    };
};

/**
 * Hook to post data to an API endpoint
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Configuration options
 * 
 * @returns {Object} { mutate, loading, error, data }
 * 
 * @example
 * const { mutate: createSong, loading } = usePost('/admin/tracks');
 * 
 * const handleSubmit = async () => {
 *   const result = await createSong({ title: 'New Song', artist: 'Artist' });
 *   if (result) console.log('Created:', result);
 * };
 */
export const usePost = (url, options = {}) => {
    const {
        successMessage = 'Success!',
        errorMessage = 'Operation failed',
        showSuccessToast = true,
        showErrorToast = true,
        onSuccess,
        onError
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (payload) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.post(url, payload);
            const responseData = response.data.data || response.data;
            
            setData(responseData);

            if (showSuccessToast) {
                toast.success(successMessage);
            }

            if (onSuccess) {
                onSuccess(responseData);
            }

            return responseData;
        } catch (err) {
            console.error(`Error posting to ${url}:`, err);
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);

            if (showErrorToast) {
                toast.error(errorMessage);
            }

            if (onError) {
                onError(err);
            }

            return null;
        } finally {
            setLoading(false);
        }
    }, [url, successMessage, errorMessage, showSuccessToast, showErrorToast, onSuccess, onError]);

    return {
        mutate,
        loading,
        error,
        data
    };
};

/**
 * Hook to delete data from an API endpoint
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} { deleteItem, loading, error }
 * 
 * @example
 * const { deleteItem, loading } = useDelete({
 *   successMessage: 'Song deleted',
 *   onSuccess: () => refetchSongs()
 * });
 * 
 * await deleteItem('/admin/tracks/123');
 */
export const useDelete = (options = {}) => {
    const {
        successMessage = 'Deleted successfully',
        errorMessage = 'Delete failed',
        showSuccessToast = true,
        showErrorToast = true,
        onSuccess,
        onError
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteItem = useCallback(async (url) => {
        try {
            setLoading(true);
            setError(null);

            await axiosInstance.delete(url);

            if (showSuccessToast) {
                toast.success(successMessage);
            }

            if (onSuccess) {
                onSuccess();
            }

            return true;
        } catch (err) {
            console.error(`Error deleting ${url}:`, err);
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);

            if (showErrorToast) {
                toast.error(errorMessage);
            }

            if (onError) {
                onError(err);
            }

            return false;
        } finally {
            setLoading(false);
        }
    }, [successMessage, errorMessage, showSuccessToast, showErrorToast, onSuccess, onError]);

    return {
        deleteItem,
        loading,
        error
    };
};
