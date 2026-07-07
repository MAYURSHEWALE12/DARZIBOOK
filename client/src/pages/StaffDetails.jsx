import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStaff } from '../api/staff.js';
import { listWorkAssignments } from '../api/staff.js'; // From the staff api
import { listSalaryTransactions, createSalaryTransaction } from '../api/staff.js';
import Card, { CardHeader, CardContent } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Input from '../components/Input.jsx';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

export default function StaffDetails() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workload');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState('salary_credit'); // salary_credit, advance, payment
  const [txForm, setTxForm] = useState({ amount: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, workRes, txRes] = await Promise.all([
        getStaff(id),
        listWorkAssignments(id),
        listSalaryTransactions(id)
      ]);
      setStaff(staffRes.data.staff);
      setAssignments(workRes.data.assignments);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      toast.error('Failed to load staff details');
    } finally {
      setLoading(false);
    }
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSalaryTransaction({
        staffId: id,
        type: txType,
        amount: Number(txForm.amount),
        notes: txForm.notes
      });
      toast.success('Transaction recorded');
      setIsTxModalOpen(false);
      setTxForm({ amount: '', notes: '' });
      fetchData(); // refresh to get new balance and tx list
    } catch (err) {
      toast.error('Failed to record transaction');
    }
  };

  const handleUpdateAssignment = async (assignmentId, currentStatus) => {
    try {
      const { updateWorkAssignment } = await import('../api/staff.js');
      const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
      await updateWorkAssignment(assignmentId, { status: newStatus });
      toast.success(`Work marked as ${newStatus.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update assignment status');
    }
  };

  const openTxModal = (type) => {
    setTxType(type);
    setTxForm({ amount: '', notes: '' });
    setIsTxModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#1e3a8a] rounded-full"></span>
          <span className="text-slate-500 font-medium text-lg">Loading staff details...</span>
        </div>
      </div>
    );
  }
  if (!staff) return <div className="p-8 text-center text-slate-500">Staff not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/staff" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {staff.name}
            <span className="text-[11px] px-2 py-1 bg-slate-100 border border-slate-200 rounded-md font-semibold text-slate-600 uppercase tracking-wider">{staff.role}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">{staff.phone || 'No phone number'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button 
          className={cn("px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors", activeTab === 'workload' ? "border-[#1e3a8a] text-[#1e3a8a]" : "border-transparent text-slate-500 hover:text-slate-800")}
          onClick={() => setActiveTab('workload')}
        >
          Workload
        </button>
        <button 
          className={cn("px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors", activeTab === 'salary' ? "border-[#1e3a8a] text-[#1e3a8a]" : "border-transparent text-slate-500 hover:text-slate-800")}
          onClick={() => setActiveTab('salary')}
        >
          Salary & Ledger
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'workload' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-800">Assigned Work</h2>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No work assigned yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Garment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Piece Rate</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map(a => (
                    <tr key={a._id}>
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-700">
                        {a.orderId?.garmentType || 'Unknown Garment'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500">
                        {new Date(a.assignedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-700">
                        ₹{a.pieceRate || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                          a.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                          a.status === 'in_progress' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant={a.status === 'completed' ? "outline" : "default"} 
                          onClick={() => handleUpdateAssignment(a._id, a.status)}
                          className={a.status === 'completed' ? "" : "bg-[#1e3a8a] text-white"}
                        >
                          {a.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'salary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-center shadow-sm">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
              <h3 className={cn(
                "text-3xl font-bold", 
                staff.balance > 0 ? "text-emerald-600" : staff.balance < 0 ? "text-rose-600" : "text-slate-800"
              )}>
                ₹{Math.abs(staff.balance)}
                <span className="text-[13px] ml-2 text-slate-500 font-medium">
                  {staff.balance > 0 ? '(Shop Owes)' : staff.balance < 0 ? '(Advance Taken)' : ''}
                </span>
              </h3>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-3">
              <Button onClick={() => openTxModal('salary_credit')} className="bg-[#1e3a8a] text-white flex-1 hover:bg-[#152a66]">
                <span className="material-symbols-outlined mr-2 text-[18px]">account_balance_wallet</span>
                Add Custom Credit
              </Button>
              <Button onClick={() => openTxModal('advance')} className="bg-rose-50 text-rose-600 border border-rose-200 flex-1 hover:bg-rose-100">
                <span className="material-symbols-outlined mr-2 text-[18px]">money_off</span>
                Give Advance
              </Button>
              <Button onClick={() => openTxModal('payment')} className="bg-emerald-50 text-emerald-600 border border-emerald-200 flex-1 hover:bg-emerald-100">
                <span className="material-symbols-outlined mr-2 text-[18px]">payments</span>
                Settle Payment
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-800">Ledger History</h2>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Credit (Salary)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit (Paid)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx._id}>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-600">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                          tx.type === 'salary_credit' ? "bg-blue-50 text-blue-600" :
                          tx.type === 'advance' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-right text-slate-700">
                        {tx.type === 'salary_credit' ? `₹${tx.amount}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-right text-slate-700">
                        {tx.type !== 'salary_credit' ? `₹${tx.amount}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500">
                        {tx.notes || '-'}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal open={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={txType === 'salary_credit' ? 'Add Custom Credit' : txType === 'advance' ? 'Give Advance' : 'Settle Payment'}>
        <form onSubmit={handleTxSubmit} className="space-y-4">
          <Input 
            label="Amount (₹)" 
            type="number"
            value={txForm.amount} 
            onChange={(e) => setTxForm({...txForm, amount: e.target.value})} 
            required 
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
            <textarea 
              value={txForm.notes} 
              onChange={(e) => setTxForm({...txForm, notes: e.target.value})}
              className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-[13px] font-medium text-slate-700 bg-white resize-none h-24"
              placeholder="e.g. Week 12 salary, Medical advance..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1e3a8a] text-white">Save Transaction</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
