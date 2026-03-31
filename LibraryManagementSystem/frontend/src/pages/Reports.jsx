import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';

const Reports = () => {
    const [reportType, setReportType] = useState('master_books');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const tabs = [
        'master_books', 'master_movies', 'master_memberships', 
        'master_users', 'active_users', 'pending_requests', 
        'active_issues', 'overdue_returns'
    ];

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/reports?type=${reportType}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleApproveRequest = async (requestId) => {
        if (!window.confirm("Approve this request? This will formally Issue the item and start the 15-day loan countdown.")) return;
        try {
            await axios.put(`http://localhost:5000/api/requests/${requestId}`, { status: 'Approved' });
            alert('Request Approved! Item has been officially issued to the user.');
            fetchReport(); // Refresh grid
        } catch (error) {
            alert(error.response?.data?.message || 'Error auto-issuing item');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center"><FileText className="mr-2 w-6 h-6 text-blue-600"/> Reports Module</h1>
            
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-full overflow-x-auto">
                 {tabs.map(type => (
                     <button key={type} onClick={() => setReportType(type)} className={`px-4 py-2 flex-shrink-0 rounded-md text-sm font-medium transition-colors ${reportType === type ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>
                         {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                     </button>
                 ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-x-auto min-h-[400px]">
                {loading ? <div className="text-center py-12 text-gray-500">Loading data...</div> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {(reportType === 'master_books' || reportType === 'master_movies') && (
                                    <><th>Serial No</th><th>Name</th><th>Category</th><th>Total</th><th>Available</th>{reportType === 'master_books' && <th>Procurement Date</th>}</>
                                )}
                                {(reportType === 'master_users' || reportType === 'active_users') && (
                                    <><th>Name</th><th>Email</th><th>Role</th><th>Active</th></>
                                )}
                                {reportType === 'master_memberships' && (
                                    <><th>Name</th><th>Email</th><th>Membership Start</th><th>Membership End</th></>
                                )}
                                {reportType === 'pending_requests' && (
                                    <><th>User Name</th><th>Item Requested</th><th>Request Date</th><th>Status</th><th>Action</th></>
                                )}
                                {(reportType === 'active_issues' || reportType === 'overdue_returns') && (
                                    <><th>Transaction ID</th><th>User</th><th>Item</th><th>Issue Date</th><th>Target Return</th>{reportType === 'overdue_returns' && <th>Calculated Fine</th>}</>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-gray-400">No records found for this report.</td></tr> : 
                             data.map(row => (
                                <tr key={row._id} className="hover:bg-gray-50 text-sm text-center">
                                    {(reportType === 'master_books' || reportType === 'master_movies') && (
                                        <><td className="py-3">{row.serialNo}</td><td className="font-medium text-gray-900">{row.name} <div className="text-xs text-gray-500 font-normal">{row.author}</div></td><td>{row.category}</td><td>{row.quantity}</td><td>{row.availableCopies}</td>{reportType === 'master_books' && <td>{row.procurementDate ? new Date(row.procurementDate).toLocaleDateString() : '-'}</td>}</>
                                    )}
                                    {(reportType === 'master_users' || reportType === 'active_users') && (
                                        <><td className="py-3 font-medium text-gray-900">{row.firstName} {row.lastName}</td><td>{row.email}</td><td>{row.role}</td><td><span className={`px-2 py-1 rounded text-xs text-white ${row.active ? 'bg-green-500' : 'bg-red-500'}`}>{row.active ? 'Yes' : 'No'}</span></td></>
                                    )}
                                    {reportType === 'master_memberships' && (
                                        <><td className="py-3 font-medium text-gray-900">{row.firstName} {row.lastName}</td><td>{row.email}</td><td>{row.membership?.startDate ? new Date(row.membership.startDate).toLocaleDateString() : '-'}</td><td>{row.membership?.endDate ? new Date(row.membership.endDate).toLocaleDateString() : '-'}</td></>
                                    )}
                                    {reportType === 'pending_requests' && (
                                        <><td className="py-3 font-medium text-gray-900">{row.user?.firstName || 'Unknown User'}</td><td>{row.item?.name || 'Unknown Item'} <span className="text-xs ml-1 text-gray-500">({row.item?.type})</span></td><td>{new Date(row.requestDate).toLocaleDateString()}</td><td><span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">{row.status}</span></td><td>{row.status === 'Pending' && <button onClick={() => handleApproveRequest(row._id)} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded shadow-sm">Approve & Issue</button>}</td></>
                                    )}
                                    {(reportType === 'active_issues' || reportType === 'overdue_returns') && (
                                        <>
                                            <td className="py-3 text-xs text-gray-500">{row._id}</td>
                                            <td className="font-medium text-gray-900">{row.user?.firstName || 'Unknown'}</td>
                                            <td>{row.item?.name || 'Unknown'}</td>
                                            <td>{new Date(row.issueDate).toLocaleDateString()}</td>
                                            <td className={reportType === 'overdue_returns' ? 'text-red-600 font-bold' : ''}>{new Date(row.expectedReturnDate).toLocaleDateString()}</td>
                                            {reportType === 'overdue_returns' && <td className="text-red-600 font-bold tracking-wider">Rs. {row.currentFine}</td>}
                                        </>
                                    )}
                                </tr>
                             ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Reports;
