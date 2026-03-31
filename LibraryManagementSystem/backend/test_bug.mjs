async function test() {
    try {
        console.log("Logging in as Admin...");
        const adminAuth = await fetch('http://localhost:5000/api/auth/login', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: 'admin@library.com', password: 'password' }) 
        });
        const adminData = await adminAuth.json();
        const token = adminData.token;
        console.log("Token received.");

        console.log("Fetching reports: pending_requests...");
        const res1 = await fetch('http://localhost:5000/api/reports?type=pending_requests', { headers: { Authorization: `Bearer ${token}` }});
        console.log("Pending requests status:", res1.status, await res1.text());

        console.log("Fetching reports: master_books...");
        const res2 = await fetch('http://localhost:5000/api/reports?type=master_books', { headers: { Authorization: `Bearer ${token}` }});
        console.log("Master books status:", res2.status, (await res2.text()).slice(0, 100));

        console.log("Logging in as User...");
        const userAuth = await fetch('http://localhost:5000/api/auth/login', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: 'john@library.com', password: 'password' }) 
        });
        const userData = await userAuth.json();
        const userToken = userData.token;

        console.log("Fetching items for User...");
        const itemsRes = await fetch('http://localhost:5000/api/items');
        const itemsData = await itemsRes.json();
        let itemId = itemsData[0]._id;

        console.log("Creating request for item:", itemId);
        const reqRes = await fetch('http://localhost:5000/api/requests', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` }, 
            body: JSON.stringify({ itemId }) 
        });
        console.log("Request created status:", reqRes.status, await reqRes.text());
        
    } catch(e) {
        console.log("Error:", e);
    }
}
test();
