import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, CheckCircle, Search } from 'lucide-react';

const ItemsManagement = () => {
    const [items, setItems] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Book',
        serialNo: '',
        name: '',
        author: '',
        category: 'Science',
        quantity: 1,
        procurementDate: ''
    });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/items?keyword=${keyword}`);
            setItems(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Strict Front-End Validation
        if (!formData.serialNo || !formData.name || !formData.author || !formData.quantity) {
             return alert("Please fill out all mandatory fields.");
        }
        if (formData.type === 'Book' && !formData.procurementDate) {
             return alert("Date of Procurement is mandatory for Books.");
        }

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/items/${currentItemId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/items', formData);
            }
            fetchItems();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    const editItem = (item) => {
        setIsEditing(true);
        setCurrentItemId(item._id);
        setFormData({
            type: item.type,
            serialNo: item.serialNo,
            name: item.name,
            author: item.author || '',
            category: item.category,
            quantity: item.quantity,
            procurementDate: item.procurementDate ? new Date(item.procurementDate).toISOString().split('T')[0] : ''
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentItemId(null);
        setFormData({ type: 'Book', serialNo: '', name: '', author: '', category: 'Science', quantity: 1, procurementDate: '' });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Movies & Books Maintenance</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                            <button type="button" onClick={() => setFormData({...formData, type: 'Book'})} className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${formData.type === 'Book' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Book</button>
                            <button type="button" onClick={() => setFormData({...formData, type: 'Movie'})} className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${formData.type === 'Movie' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Movie</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Serial No <span className="text-red-500">*</span></label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: e.target.value})} disabled={isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Author/Director <span className="text-red-500">*</span></label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Science</option>
                            <option>Economics</option>
                            <option>Fiction</option>
                            <option>Children</option>
                            <option>Personal Development</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
                        <input type="number" min="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                    </div>
                    {formData.type === 'Book' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Procurement <span className="text-red-500">*</span></label>
                            <input type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" value={formData.procurementDate} onChange={e => setFormData({...formData, procurementDate: e.target.value})} />
                        </div>
                    )}
                    
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3 mt-4">
                        {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>}
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            {isEditing ? <CheckCircle className="w-5 h-5 mr-1"/> : <PlusCircle className="w-5 h-5 mr-1"/>}
                            {isEditing ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Inventory List</h2>
                    <form onSubmit={handleSearch} className="flex max-w-sm w-full">
                        <input type="text" placeholder="Search by name, author, serial..." className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border border-r-0" value={keyword} onChange={e => setKeyword(e.target.value)} />
                        <button type="submit" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-r-md border border-blue-200 hover:bg-blue-100 flex items-center">
                            <Search className="w-4 h-4"/>
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr> : 
                             items.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.serialNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="text-gray-900 font-medium">{item.name}</div>
                                        <div className="text-gray-500 text-xs">{item.author}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'Book' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {item.type}
                                        </span>
                                        <div className="text-xs mt-1 text-gray-400">{item.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.availableCopies} / {item.quantity} available
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => editItem(item)} className="text-blue-600 hover:text-blue-900 p-1 flex items-center justify-end w-full">
                                            <Edit2 className="w-4 h-4 mr-1"/> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ItemsManagement;
