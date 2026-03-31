const axios = require('axios');

async function test() {
    try {
        console.log("Logging in as Admin...");
        const auth = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@library.com', password: 'password' });
        const token = auth.data.token;
        console.log("Token received.");

        console.log("Fetching reports: pending_requests...");
        try {
            const reqs = await axios.get('http://localhost:5000/api/reports?type=pending_requests', { headers: { Authorization: `Bearer ${token}` }});
            console.log("Pending Requests:", reqs.data);
        } catch(e) { console.error("Report pending_requests failed:", e?.response?.data || e.message); }

        console.log("Fetching reports: master_books...");
        try {
            const reqs = await axios.get('http://localhost:5000/api/reports?type=master_books', { headers: { Authorization: `Bearer ${token}` }});
            console.log("Master books:", reqs.data);
        } catch(e) { console.error("Report master_books failed:", e?.response?.data || e.message); }

        console.log("Logging in as User...");
        const authUser = await axios.post('http://localhost:5000/api/auth/login', { email: 'john@library.com', password: 'password' });
        const userToken = authUser.data.token;

        console.log("Fetching items for User...");
        let itemId;
        try {
            const items = await axios.get('http://localhost:5000/api/items', { headers: { Authorization: `Bearer ${userToken}` }});
            if(items.data.length > 0) itemId = items.data[0]._id;
            console.log("Found item:", itemId);
        } catch(e) { console.error("Items fetch failed:", e?.response?.data || e.message); }

        console.log("Creating request...");
        try {
             // Let's check what exactly is failing in request
             const reqRes = await axios.post('http://localhost:5000/api/requests', { itemId }, { headers: { Authorization: `Bearer ${userToken}` }});
             console.log("Request created:", reqRes.data);
        } catch(e) { console.error("Request post failed:", e?.response?.data || e.message); }

    } catch (e) {
        console.error("Test failed globally:", e.message);
    }
}

test();
