import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from './Modal';
import { api } from '../api/client';
import { ENDPOINTS } from '../config/constants';
import { formatCurrency, getInitials } from '../utils/formatters';

export default function AssignAlphaModal({ isOpen, onClose, assignment, onAssign }) {
  const [alphas, setAlphas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAlpha, setSelectedAlpha] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVerifiedAlphas();
      setAgreedPrice(assignment?.budget?.min || '');
    }
  }, [isOpen]);

  const fetchVerifiedAlphas = async () => {
    setLoading(true);
    const { data, error } = await api.get(ENDPOINTS.ALPHAS, {
      params: { status: 'verified', limit: 100 }
    });

    if (error) toast.error('Failed to load alphas');
    else setAlphas(data.alphas || data.data || []);

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAlpha) return toast.error('Please select an alpha');
    if (!agreedPrice) return toast.error('Please enter agreed price');

    setSubmitting(true);

    try {
      const { error } = await api.post(
        ENDPOINTS.ASSIGN_ALPHA(assignment._id),
        {
          alphaId: selectedAlpha,
          agreedPrice: Number(agreedPrice)
        }
      );

      if (error) toast.error(error.message || 'Failed to assign alpha');
      else {
        toast.success('Alpha assigned successfully');
        onAssign();
        onClose();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const getAlphaName = (alpha) => {
    const user = alpha.user;
    return (
      user?.displayName ||
      (user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : 'Unknown')
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Alpha" size="medium">
      <div className="p-4 max-h-[80vh] overflow-y-auto">

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  Assignment
                </p>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {assignment?.title}
                </h3>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  Budget
                </p>
                <p className="text-lg font-bold text-indigo-700">
                  {formatCurrency(assignment?.budget?.min)} - {formatCurrency(assignment?.budget?.max)}
                </p>
              </div>
            </div>
          </div>

          {/* Select Alpha */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Select Alpha
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Required
              </span>
            </label>

            {loading ? (
              <div className="h-11 w-full bg-gray-200 animate-pulse rounded-xl"></div>
            ) : (
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  value={selectedAlpha}
                  onChange={(e) => setSelectedAlpha(e.target.value)}
                  required
                >
                  <option value="" disabled>Choose an Alpha...</option>
                  {alphas.map(alpha => (
                    <option key={alpha._id} value={alpha.userId || alpha.user?._id}>
                      {getInitials(getAlphaName(alpha))} - {getAlphaName(alpha)} • {alpha.skills?.slice(0, 2).join(', ')}
                    </option>
                  ))}
                </select>

                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            )}

            {!loading && alphas.length === 0 && (
              <p className="text-xs text-amber-600">⚠ No verified alphas available.</p>
            )}
          </div>

          {/* Agreed Price */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Agreed Price
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Required
              </span>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₹
              </span>
              <input
                type="number"
                className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                placeholder="Enter amount"
                min="0"
                required
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition active:scale-95"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loading || !selectedAlpha}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>

        </form>
      </div>
    </Modal>
  );
}
