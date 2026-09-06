'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    centerName: '',
    contactEmail: '',
    defaultFee: 1000
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setFormData({
          centerName: data.centerName || '',
          contactEmail: data.contactEmail || '',
          defaultFee: data.defaultFee || 1000
        });
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const tId = toast.loading('Saving settings...');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Settings saved successfully. Refresh to see changes globally.', { id: tId });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save settings', { id: tId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="mt-2 text-sm text-gray-700">
        Manage your coaching center profile, staff, and application configurations.
      </p>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h2 className="text-lg font-medium">Coaching Profile</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Center Name</label>
            <input 
              type="text" 
              name="centerName"
              value={formData.centerName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input 
              type="email" 
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Monthly Fee (৳)</label>
            <p className="text-xs text-gray-500 mb-1">Used to estimate 'Total Due' on the dashboard.</p>
            <input 
              type="number" 
              name="defaultFee"
              value={formData.defaultFee}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
          </div>
        </div>
        <div className="mt-6">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
