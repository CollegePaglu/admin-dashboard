import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from './Modal';
import { api } from '../api/client';
import { ENDPOINTS } from '../config/constants';
import { formatCurrency, getInitials } from '../utils/formatters';
import './AssignAlphaModal.css';

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
      <div className="assign-modal-content">
        <form onSubmit={handleSubmit}>
          {/* Summary Card */}
          <div className="assignment-summary-card">
            <div className="summary-header">
              <div>
                <p className="summary-label">Assignment</p>
                <h3 className="summary-value">{assignment?.title}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="summary-label">Budget</p>
                <p className="summary-value budget">
                  {formatCurrency(assignment?.budget?.min)} - {formatCurrency(assignment?.budget?.max)}
                </p>
              </div>
            </div>
          </div>

          {/* Select Alpha */}
          <div className="form-group">
            <label className="form-label">
              Select Alpha <span className="required-badge">Required</span>
            </label>
            {loading ? (
              <div className="loading-skeleton"></div>
            ) : (
              <select
                className="form-select"
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
            )}
            {!loading && alphas.length === 0 && (
              <p className="error-message">⚠ No verified alphas available.</p>
            )}
          </div>

          {/* Agreed Price */}
          <div className="form-group">
            <label className="form-label">
              Agreed Price <span className="required-badge">Required</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span className="currency-symbol" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                ₹
              </span>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                placeholder="Enter amount"
                min="0"
                required
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading || !selectedAlpha}
              className="btn-submit"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

