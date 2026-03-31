import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Clock, CheckCircle } from 'lucide-react';

const SearchAndRequests = () => {
    const [items, setItems] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [myRequests, setMyRequests] = useState([]);

    useEffect(() => { 
        fetchItems(); 
        fetchMyRequests(); 
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/items?keyword=${keyword}`);
            setItems(data);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const fetchMyRequests = async () => {
        try {
            // Updated to fetch only the logged-in user's requests securely
            const { data } = await axios.get(`http://localhost:5000/api/requests/my`);
            setMyRequests(data);
        } catch (error) { console.error(error); }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    const requestItem = async (itemId) => {
        try {
            await axios.post('http://localhost:5000/api/requests', { itemId });
            alert('Request submitted successfully!');
            fetchMyRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Error making request');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Search Library & Requests</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="flex w-full mb-6">
                    <input type="text" placeholder="Search for books by title, author, or category..." className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border border-r-0" value={keyword} onChange={e => setKeyword(e.target.value)} />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 flex items-center shadow-sm">
                        <Search className="w-5 h-5 mr-2"/> Search
                    </button>
                </form>

                <div className="space-y-4">
                    {loading ? <div className="text-center">Loading books...</div> : 
                     items.map(item => (
                         <div key={item._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                             <div>
                                 <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                 <p className="text-sm text-gray-500">{item.author} &bull; {item.category}</p>
                                 <div className="mt-1 flex items-center space-x-2">
                                     <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700">{item.type}</span>
                                     <span className={`text-xs font-semibold px-2 py-1 rounded ${item.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                         {item.availableCopies > 0 ? `${item.availableCopies} Available` : 'Out of Stock'}
                                     </span>
                                 </div>
                             </div>
                             <div>
                                 <button 
                                     onClick={() => requestItem(item._id)}
                                     disabled={item.availableCopies <= 0}
                                     className={`flex items-center px-4 py-2 rounded-md font-medium text-white shadow-sm ${item.availableCopies > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                 >
                                     <Send className="w-4 h-4 mr-2"/> Request Issue
                                 </button>
                             </div>
                         </div>
                     ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">My Requests</h2>
                <div className="space-y-3">
                    {myRequests.map(req => (
                        <div key={req._id} className="flex justify-between items-center p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                            <div className="flex items-center">
                                {req.status === 'Pending' ? <Clock className="w-5 h-5 text-yellow-600 mr-3"/> : <CheckCircle className="w-5 h-5 text-green-600 mr-3"/>}
                                <div>
                                    <h4 className="font-semibold text-gray-800">{req.item?.name || 'Unknown Item'}</h4>
                                    <p className="text-xs text-gray-500">Requested on: {new Date(req.requestDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${req.status === 'Pending' ? 'text-yellow-800 bg-yellow-200' : req.status === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                    {req.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchAndRequests;
