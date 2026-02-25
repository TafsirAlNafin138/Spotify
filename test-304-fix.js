// Quick test to check if the endpoint returns 200 without caching
// Run this in browser console while on your app page

async function test304Fix() {
    console.log('🧪 Testing /api/tracks/new-releases endpoint...\n');
    
    const baseUrl = 'http://localhost:2222/api/tracks/new-releases';
    
    // Test 1: Normal request
    console.log('Test 1: Normal Request');
    const response1 = await fetch(baseUrl, { credentials: 'include' });
    console.log(`Status: ${response1.status} ${response1.statusText}`);
    console.log(`Cache-Control: ${response1.headers.get('cache-control')}`);
    console.log(`Pragma: ${response1.headers.get('pragma')}`);
    console.log(`Expires: ${response1.headers.get('expires')}`);
    console.log('---\n');
    
    // Test 2: Second request (should also be 200, not 304)
    console.log('Test 2: Second Request (should still be 200)');
    const response2 = await fetch(baseUrl, { credentials: 'include' });
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    console.log('---\n');
    
    // Test 3: With cache buster
    console.log('Test 3: With Cache Buster');
    const response3 = await fetch(`${baseUrl}?t=${Date.now()}`, { credentials: 'include' });
    console.log(`Status: ${response3.status} ${response3.statusText}`);
    console.log('---\n');
    
    // Summary
    const allGood = response1.status === 200 && response2.status === 200 && response3.status === 200;
    
    if (allGood) {
        console.log('✅ SUCCESS! All requests returned 200 OK');
        console.log('The 304 issue is FIXED!');
    } else {
        console.log('❌ ISSUE DETECTED!');
        console.log(`Request 1: ${response1.status}`);
        console.log(`Request 2: ${response2.status}`);
        console.log(`Request 3: ${response3.status}`);
    }
    
    const data = await response1.json();
    console.log(`\nTracks received: ${data.data?.length || 0}`);
}

// Run the test
test304Fix().catch(err => console.error('Error:', err));
