import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Search } from 'lucide-react';

const Transactions = () => {
    const { user: currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.role === 'Admin';
    
    // Admin Items Search state
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Admin Issue form state
    const defaultIssueDate = new Date().toISOString().split('T')[0];
    const defaultReturnDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [issueData, setIssueData] = useState({ 
        userId: '', 
        issueDate: defaultIssueDate,
        expectedReturnDate: defaultReturnDate 
    });
    const [issueError, setIssueError] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);

    // Admin Return form state
    const [returnTid, setReturnTid] = useState('');
    const [returnRemarks, setReturnRemarks] = useState('');
    const [returnError, setReturnError] = useState('');
    
    // User state
    const [myTransactions, setMyTransactions] = useState([]);
    
    useEffect(() => {
        if (!isAdmin) fetchMyTransactions();
        else fetchActiveUsers();
    }, [isAdmin]);

    const fetchActiveUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/users');
            setActiveUsers(data.filter(u => u.role === 'User' && u.active));
        } catch (error) { console.error("Error fetching users for dropdown"); }
    };

    const fetchMyTransactions = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/transactions/my');
            setMyTransactions(data);
        } catch (error) { console.error(error); }
    };

    // ------------- Admin Functions ----------------
    const handleSearchItem = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.get(`http://localhost:5000/api/items?keyword=${keyword}`);
            // Filter only available items
            setSearchResults(data.filter(item => item.availableCopies > 0));
            setSelectedItem(null);
            if (data.length === 0) setIssueError('No available books found matching search.');
            else setIssueError('');
        } catch (error) { 
            console.error(error); 
        }
    };

    const handleIssue = async (e) => {
        e.preventDefault();
        setIssueError('');
        
        if (!selectedItem) {
            return setIssueError('Please search and select a Book/Movie from the Availability list first.');
        }
        if (!issueData.userId) {
            return setIssueError('User ID is legally required to issue an item.');
        }

        // Validate 15 day maximum
        const iDate = new Date(issueData.issueDate);
        const eDate = new Date(issueData.expectedReturnDate);
        const diffTime = Math.abs(eDate - iDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 15) {
            return setIssueError('Error: Maximum loan period is strictly bounded to 15 days.');
        }
        if (eDate < iDate) {
            return setIssueError('Error: Expected return date cannot be before the issue date.');
        }

        try {
            await axios.post('http://localhost:5000/api/transactions/issue', {
                serialNo: selectedItem.serialNo,
                userId: issueData.userId,
                issueDate: issueData.issueDate,
                expectedReturnDate: issueData.expectedReturnDate
            });
            alert('Item issued successfully!');
            
            // Reset Issue state entirely
            setIssueData({ userId: '', issueDate: defaultIssueDate, expectedReturnDate: defaultReturnDate });
            setSelectedItem(null);
            setSearchResults([]);
            setKeyword('');
            setIssueError('');
        } catch (error) {
            setIssueError(error.response?.data?.message || 'Server error computing issue request.');
        }
    };

    const handleReturn = async (e) => {
        e.preventDefault();
        setReturnError('');

        if (!returnRemarks.trim()) {
            return setReturnError("Remarks field is strictly mandatory for logging Return transactions.");
        }

        try {
            await axios.post(`http://localhost:5000/api/transactions/return/${returnTid}`, { remarks: returnRemarks });
            alert('Item securely returned to inventory!');
            setReturnTid(''); setReturnRemarks('');
            setReturnError('');
        } catch (error) {
            setReturnError(error.response?.data?.message || 'Server error processing return request.');
        }
    };

    // ------------- User Functions ----------------
    const handlePayFine = async (tid) => {
         try {
             await axios.post(`http://localhost:5000/api/transactions/pay-fine/${tid}`);
             alert('Fine confirmed as paid successfully! Transaction closed.');
             fetchMyTransactions();
         } catch(error) {
             alert(error.response?.data?.message || 'Error executing fine payment via gateway.');
         }
    };

    if (isAdmin) {
        return (
            <div className="space-y-8">
                <h1 className="text-2xl font-bold text-gray-800">Transactions Ledger Management</h1>
                
                {/* Search and Select Workflow */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 text-blue-700">1. Book Availability Search</h2>
                    <form onSubmit={handleSearchItem} className="flex max-w-lg mb-4">
                        <input type="text" placeholder="Search by exact name, author, or keyword..." className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border border-r-0" value={keyword} onChange={e => setKeyword(e.target.value)} />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md border border-blue-600 hover:bg-blue-700 flex items-center">
                            <Search className="w-4 h-4 mr-1"/> Check Availability
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="mt-4 border rounded-md overflow-hidden bg-gray-50 max-h-48 overflow-y-auto">
                            {searchResults.map(item => (
                                <label key={item._id} className={`flex items-center p-3 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedItem?._id === item._id ? 'bg-blue-100 border-blue-200' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="selectedBook" 
                                        className="form-radio h-4 w-4 text-blue-600 mr-3" 
                                        checked={selectedItem?._id === item._id} 
                                        onChange={() => setSelectedItem(item)} 
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.author}</div>
                                    </div>
                                    <div className="text-sm font-bold text-green-700">
                                        {item.availableCopies} Copies Available
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Issue Book Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-green-700">2. Issue Selected Item</h2>
                        {issueError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">{issueError}</div>}
                        
                        <form onSubmit={handleIssue} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Locked Serial No.</label>
                                <input type="text" readOnly className="mt-1 block w-full p-2 border bg-gray-100 rounded-md shadow-sm text-gray-600 font-mono" value={selectedItem?.serialNo || 'Search & Select above first'} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Author Validation</label>
                                <input type="text" readOnly className="mt-1 block w-full p-2 border bg-gray-100 rounded-md shadow-sm text-gray-600" value={selectedItem?.author || ''} placeholder="Auto-populated" />
                            </div>
                            <hr className="my-2"/>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Target User <span className="text-red-500">*</span></label>
                                <select required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" value={issueData.userId} onChange={e=>setIssueData({...issueData, userId: e.target.value})}>
                                    <option value="" disabled>-- Select an Active User --</option>
                                    {activeUsers.map(u => (
                                        <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Issue Date <span className="text-red-500">*</span></label>
                                    <input type="date" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={issueData.issueDate} onChange={e=>setIssueData({...issueData, issueDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Max Expiry (Limit 15d) <span className="text-red-500">*</span></label>
                                    <input type="date" required className="mt-1 block w-full p-2 border bg-yellow-50 border-yellow-300 rounded-md shadow-sm focus:ring-yellow-500" 
                                        value={issueData.expectedReturnDate} 
                                        onChange={e=>setIssueData({...issueData, expectedReturnDate: e.target.value})} 
                                        min={issueData.issueDate}
                                    />
                                    <p className="text-xs mt-1 text-gray-500">Auto-calculated mapping to 15.0 days</p>
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded shadow-sm">Execute Formal Issue</button>
                        </form>
                    </div>

                    {/* Return Book Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-orange-700">Return & Inspect Item</h2>
                        {returnError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">{returnError}</div>}

                        <form onSubmit={handleReturn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transaction ID <span className="text-red-500">*</span></label>
                                <input type="text" required placeholder="Paste Transaction ID" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 font-mono text-sm" value={returnTid} onChange={e=>setReturnTid(e.target.value)} />
                                <p className="text-xs text-gray-500 mt-1">Found in active issues report.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Inspection Remarks <span className="text-red-500">*</span></label>
                                <textarea required rows="4" placeholder="Mandatory remarks regarding physical condition of binding, CD surface, or pages..." className="mt-1 block w-full p-2 border border-orange-300 bg-orange-50 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500" value={returnRemarks} onChange={e=>setReturnRemarks(e.target.value)}></textarea>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded shadow-sm">Authorise Return Record</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    } // End Admin view

    // User View
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Ledger & Fine Administration</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Structure</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Log</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Log</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Remarks</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fine Tracking</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myTransactions.length === 0 ? <tr><td colSpan="5" className="text-center py-8 text-gray-400">No active or historical transactions exist on record.</td></tr> : 
                         myTransactions.map(t => (
                            <tr key={t._id} className={t.fineCalculated > 0 && !t.finePaid ? "bg-red-50" : "hover:bg-gray-50"}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-bold text-gray-900">{t.item?.name || 'Asset removed'}</div>
                                    <div className="text-xs text-gray-500">{t._id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{new Date(t.issueDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="text-xs">Due:</span> {new Date(t.expectedReturnDate).toLocaleDateString()}<br/>
                                    {t.actualReturnDate ? <span className="text-gray-900 font-bold">In: {new Date(t.actualReturnDate).toLocaleDateString()}</span> : <span className="text-blue-600 font-bold animate-pulse">Pending drop</span>}
                                </td>
                                <td className="px-6 py-4 text-sm max-w-xs">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded shadow-sm ${t.status === 'Issued' ? 'bg-yellow-400 text-yellow-900' : 'bg-green-500 text-white'}`}>{t.status}</span>
                                    {t.remarks && <div className="mt-2 text-xs italic text-gray-600 border-l-2 border-gray-300 pl-2">"{t.remarks}"</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    {t.fineCalculated > 0 && (
                                         <div className="flex flex-col items-end">
                                             <div className="text-red-700 font-black text-lg">Rs. {t.fineCalculated}</div>
                                             {t.finePaid ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded border border-green-200 mt-1">Conf: Fine Paid via POS</span> : 
                                             <button onClick={() => handlePayFine(t._id)} className="text-xs bg-red-600 hover:bg-red-700 shadow-md text-white font-bold py-1 px-3 rounded mt-2 transition-colors">Clear Account Penalty</button>}
                                         </div>
                                    )}
                                    {t.fineCalculated === 0 && <span className="text-gray-400 font-mono text-xs">Rs. 0 Balance</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;
