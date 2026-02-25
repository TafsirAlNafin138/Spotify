// API Base URL - Update this to your backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2222/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
};

// ==================== AUTH APIs ====================

export const authAPI = {
    // Register new user
    register: async (username, email, password) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    },

    // Login user
    login: async (email, password) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    // Logout user
    logout: async () => {
        return apiRequest('/auth/logout', {
            method: 'POST',
        });
    },

    // Get current user profile
    getProfile: async () => {
        return apiRequest('/auth/profile');
    },
};

// ==================== LIKES APIs ====================

export const likesAPI = {
    // Toggle like on a song
    toggleLike: async (songId) => {
        return apiRequest(`/likes/toggle/${songId}`, {
            method: 'POST',
        });
    },

    // Get all liked songs for current user
    getLikedSongs: async () => {
        return apiRequest('/likes/my-likes');
    },

    // Get like count for a specific song
    getSongLikeCount: async (songId) => {
        return apiRequest(`/likes/count/${songId}`);
    },

    // Get all like counts for all songs
    getAllLikeCounts: async () => {
        return apiRequest('/likes/counts');
    },

    // Check if user liked a specific song
    isLiked: async (songId) => {
        return apiRequest(`/likes/check/${songId}`);
    },
};

// ==================== SONGS APIs (Optional - if you want to fetch songs from backend) ====================

export const songsAPI = {
    // Get all songs
    getAllSongs: async () => {
        return apiRequest('/songs');
    },

    // Get song by ID
    getSongById: async (songId) => {
        return apiRequest(`/songs/${songId}`);
    },
};
