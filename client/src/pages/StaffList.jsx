import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listStaff, createStaff } from '../api/staff.js';
import Card, { CardHeader, CardContent } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination.jsx';

export default function StaffList() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'Tailor', salaryType: 'piece_rate', baseSalary: 0 });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDeleteStaff = async () => {
    if (!deleteConfirmId) return;
    try {
      const { deleteStaff } = await import('../api/staff.js');
      await deleteStaff(deleteConfirmId);
      toast.success('Staff deleted successfully');
      setDeleteConfirmId(null);
      fetchStaff();
    } catch (err) {
      toast.error('Failed to delete staff');
      setDeleteConfirmId(null);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await listStaff({ page, limit: 10 });
      setStaffList(data.staff);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (newStaff.phone && !/^\d{10}$/.test(newStaff.phone.trim())) {
      return toast.error('Phone number must be exactly 10 digits');
    }

    setIsSubmitting(true);
    try {
      await createStaff(newStaff);
      toast.success('Staff added successfully');
      setIsModalOpen(false);
      setNewStaff({ name: '', phone: '', role: 'Tailor', salaryType: 'piece_rate', baseSalary: 0 });
      fetchStaff();
    } catch (err) {
      toast.error('Failed to add staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your team, track workloads, and handle salaries.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#1e3a8a] text-white hover:bg-[#152a66]">
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
          Add Staff
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff) => (
                <tr key={staff._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-slate-600">{staff.role}</span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-500">{staff.phone || '-'}</td>
                  <td className="px-6 py-4 text-[13px] font-bold text-right">
                    {staff.balance > 0 ? (
                      <span className="text-emerald-600">₹{staff.balance} (Payable)</span>
                    ) : staff.balance < 0 ? (
                      <span className="text-rose-600">₹{Math.abs(staff.balance)} (Advance)</span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setDeleteConfirmId(staff._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Staff"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                      <Link 
                        to={`/staff/${staff._id}`} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-[#1e3a8a] hover:bg-blue-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {staffList.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <span className="material-symbols-outlined text-[40px] text-slate-300">badge</span>
                      </div>
                      <p className="text-slate-600 font-semibold text-lg">No staff members found</p>
                      <p className="text-slate-400 mt-1 max-w-[250px] mx-auto text-sm">
                        Click "Add Staff" to create your first team member.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex justify-center items-center gap-3">
                       <span className="animate-spin w-6 h-6 border-2 border-slate-200 border-t-[#1e3a8a] rounded-full"></span>
                       <span className="text-slate-500 font-medium">Loading staff...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="px-4">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Staff">
        <form onSubmit={handleAddStaff} className="space-y-4">
          <Input 
            label="Full Name" 
            value={newStaff.name} 
            onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} 
            required 
          />
          <Input 
            label="Phone Number" 
            type="tel"
            pattern="[0-9]{10}"
            maxLength="10"
            title="Please enter a valid 10-digit phone number"
            value={newStaff.phone} 
            onChange={(e) => setNewStaff({...newStaff, phone: e.target.value.replace(/\D/g, '')})} 
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
            <select 
              className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-[13px] font-medium text-slate-700 bg-white"
              value={newStaff.role}
              onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
            >
              <option value="Tailor">Tailor</option>
              <option value="Master">Master</option>
              <option value="Cutter">Cutter</option>
              <option value="Helper">Helper</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="bg-[#1e3a8a] text-white">Save Staff</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Staff">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm font-medium">Are you sure you want to delete this staff member? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button type="button" onClick={handleDeleteStaff} className="bg-rose-600 text-white hover:bg-rose-700">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
