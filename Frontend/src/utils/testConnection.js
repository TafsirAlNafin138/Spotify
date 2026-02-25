import { axiosInstance } from '../services/axios';

/**
 * Test the backend connection
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const testBackendConnection = async () => {
    try {
        // Test with albums endpoint since root is outside /api
        const response = await axiosInstance.get('/albums');
        return {
            success: true,
            message: 'Backend connection successful!',
            data: response.data
        };
    } catch (error) {
        console.error('Backend connection test failed:', error);
        return {
            success: false,
            message: `Backend connection failed: ${error.message}`,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Test authentication endpoint
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const testAuthEndpoint = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/callback', userData);
        return {
            success: true,
            message: 'Auth endpoint working!',
            data: response.data
        };
    } catch (error) {
        console.error('Auth endpoint test failed:', error);
        return {
            success: false,
            message: `Auth endpoint failed: ${error.message}`,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Test fetching albums
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const testAlbumsEndpoint = async () => {
    try {
        const response = await axiosInstance.get('/albums');
        return {
            success: true,
            message: 'Albums endpoint working!',
            data: response.data
        };
    } catch (error) {
        console.error('Albums endpoint test failed:', error);
        return {
            success: false,
            message: `Albums endpoint failed: ${error.message}`,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Run all connection tests
 */
export const runAllTests = async () => {
    console.log('🧪 Running backend connection tests...\n');
    
    const backendTest = await testBackendConnection();
    console.log('1️⃣ Backend Connection:', backendTest.success ? '✅' : '❌', backendTest.message);
    if (backendTest.data) console.log('   Response:', backendTest.data);
    
    const albumsTest = await testAlbumsEndpoint();
    console.log('2️⃣ Albums Endpoint:', albumsTest.success ? '✅' : '❌', albumsTest.message);
    if (albumsTest.error) console.log('   Error:', albumsTest.error);
    
    console.log('\n📊 Test Summary:');
    console.log(`   Backend: ${backendTest.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   Albums API: ${albumsTest.success ? '✅ Working' : '❌ Failed'}`);
    
    return {
        backend: backendTest,
        albums: albumsTest
    };
};
