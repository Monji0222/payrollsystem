import { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { daysBetween } from '../../utils/formatters';

export const LeaveForm = ({ leaveTypes, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = daysBetween(formData.startDate, formData.endDate) + 1;
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End date must be after start date');
      return;
    }

    onSubmit(formData);
  };

  const selectedLeaveType = leaveTypes.find(lt => lt.id === parseInt(formData.leaveTypeId));

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Leave Type <span className="text-red-500">*</span>
        </label>
        <select
          name="leaveTypeId"
          value={formData.leaveTypeId}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Select leave type</option>
          {leaveTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.max_days} days available)
            </option>
          ))}
        </select>
        {selectedLeaveType && (
          <p className="text-xs text-gray-600 mt-1">
            {selectedLeaveType.description}
          </p>
        )}
      </div>

      <Input
        label="Start Date"
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
        min={new Date().toISOString().split('T')[0]}
      />

      <Input
        label="End Date"
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        required
        min={formData.startDate || new Date().toISOString().split('T')[0]}
      />

      {calculatedDays > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Duration:</span> {calculatedDays} day(s)
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="input"
          rows="4"
          placeholder="Please provide a reason for your leave request..."
          required
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || calculatedDays === 0}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};
