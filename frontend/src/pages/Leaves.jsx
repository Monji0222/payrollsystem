import { useState, useEffect } from 'react';
import { getMyLeaves, getLeaveTypes, createLeave, cancelLeave, approveLeave, declineLeave } from '../api/leaveApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';
import { PlusCircle, X, Check, XCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { STATUS_COLORS } from '../utils/constants';

export const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'decline'
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Get user role from localStorage or auth context
  const userRole = JSON.parse(localStorage.getItem('user'))?.role || '';
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesRes, typesRes] = await Promise.all([
        getMyLeaves(),
        getLeaveTypes()
      ]);
      setLeaves(leavesRes.data.leaves);
      setLeaveTypes(typesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createLeave(formData);
      toast.success('Leave request submitted successfully');
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await cancelLeave(id);
        toast.success('Leave request cancelled');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel leave request');
      }
    }
  };

  const openReviewModal = (id, action) => {
    setSelectedLeaveId(id);
    setReviewAction(action);
    setReviewRemarks('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (reviewAction === 'approve') {
        await approveLeave(selectedLeaveId, { remarks: reviewRemarks });
        toast.success('Leave request approved successfully');
      } else {
        await declineLeave(selectedLeaveId, { remarks: reviewRemarks });
        toast.success('Leave request declined');
      }
      
      setShowReviewModal(false);
      setReviewRemarks('');
      setSelectedLeaveId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${reviewAction} leave request`);
    }
  };

  const resetForm = () => {
    setFormData({
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const columns = [
    { 
      key: 'leave_type_name', 
      label: 'Type'
    },
    { 
      key: 'start_date', 
      label: 'Start Date',
      render: (row) => formatDate(row.start_date)
    },
    { 
      key: 'end_date', 
      label: 'End Date',
      render: (row) => formatDate(row.end_date)
    },
    { 
      key: 'total_days', 
      label: 'Days',
      render: (row) => `${row.total_days} day(s)`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[row.status]}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <>
              {isAdminOrHR ? (
                <>
                  <button 
                    onClick={() => openReviewModal(row.id, 'approve')}
                    className="text-green-600 hover:text-green-800"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openReviewModal(row.id, 'decline')}
                    className="text-red-600 hover:text-red-800"
                    title="Decline"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleCancel(row.id)} 
                  className="text-red-600 hover:text-red-800"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Leave Requests</h1>
        <Button onClick={() => setShowModal(true)}>
          <PlusCircle className="w-4 h-4 inline mr-2" />
          Request Leave
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={leaves} loading={loading} />
      </Card>

      {/* Create Leave Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title="Request Leave"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.leaveTypeId}
              onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
              className="input"
              required
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.max_days} days max)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
          />

          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="input"
              rows="3"
              placeholder="Enter reason for leave..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => { setShowModal(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve/Decline Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => { setShowReviewModal(false); setReviewRemarks(''); }}
        title={reviewAction === 'approve' ? 'Approve Leave Request' : 'Decline Leave Request'}
      >
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              {reviewAction === 'approve' 
                ? 'Are you sure you want to approve this leave request?' 
                : 'Are you sure you want to decline this leave request?'}
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks {reviewAction === 'decline' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              className="input"
              rows="4"
              placeholder="Add your remarks here..."
              required={reviewAction === 'decline'}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => { setShowReviewModal(false); setReviewRemarks(''); }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant={reviewAction === 'approve' ? 'primary' : 'danger'}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Decline'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};