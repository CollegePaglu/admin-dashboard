import React, { useState, useEffect } from 'react';
import { configApi } from '../api/configApi';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './FeatureFlags.css';

export default function FeatureFlags() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        enabled: false,
        allowedPhones: '',
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        const { data, error } = await configApi.getAll();
        if (error) {
            toast.error(error.message || 'Failed to fetch configurations');
        } else {
            setConfigs(data.data || []);
        }
        setLoading(false);
    };

    const normalizeValue = (value) => {
        if (typeof value === 'object' && value !== null && 'enabled' in value) {
            return value;
        }
        return { enabled: !!value, allowedPhones: [] };
    };

    const handleEdit = (config) => {
        const val = normalizeValue(config.value);
        setEditingConfig(config);
        setFormData({
            enabled: val.enabled,
            allowedPhones: (val.allowedPhones || []).join(', '),
        });
    };

    const handleCloseModal = () => {
        setEditingConfig(null);
        setFormData({ enabled: false, allowedPhones: '' });
    };

    const handleSave = async () => {
        if (!editingConfig) return;

        // Parse allowed phones
        const phones = formData.allowedPhones
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const newValue = {
            enabled: formData.enabled,
            allowedPhones: phones,
            // Preserve other fields if needed, or simple reset
        };

        const { data, error } = await configApi.update({
            key: editingConfig.key,
            value: newValue,
            description: editingConfig.description,
            isPublic: editingConfig.isPublic,
        });

        if (error) {
            toast.error(error.message || 'Failed to update configuration');
        } else {
            toast.success('Configuration updated successfully');
            fetchConfigs();
            handleCloseModal();
        }
    };

    const ensureFlags = () => {
        const requiredFlags = [
            { key: 'feature_lazypeeps_enabled', description: 'Enable LazyPeeps Feature', value: false },
            { key: 'feature_assignment_enabled', description: 'Enable Assignment Feature', value: false },
        ];

        const merged = [...configs];
        requiredFlags.forEach(req => {
            if (!merged.find(c => c.key === req.key)) {
                merged.push({ ...req, isPublic: true, isVirtual: true });
            }
        });
        return merged;
    };

    const displayConfigs = ensureFlags();

    return (
        <div className="page-container">
            <Sidebar active="feature-flags" />
            <main className="main-content">
                <div className="page-header">
                    <h1>🚩 Feature Flags</h1>
                    <p>Manage application features and beta access.</p>
                </div>

                {loading ? (
                    <div className="loading">Loading configurations...</div>
                ) : (
                    <div className="glass-card feature-flags-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Feature Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayConfigs.map((config) => {
                                    const val = normalizeValue(config.value);
                                    const hasExceptions = val.allowedPhones && val.allowedPhones.length > 0;
                                    
                                    return (
                                        <tr key={config.key}>
                                            <td className="font-semibold">{config.key}</td>
                                            <td>{config.description || 'No description'}</td>
                                            <td>
                                                <span className={`status-badge ${val.enabled ? 'active' : 'inactive'}`}>
                                                    {val.enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                                {hasExceptions && (
                                                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#6b7280' }}>
                                                        + {val.allowedPhones.length} User Exceptions
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-toggle off"
                                                    onClick={() => handleEdit(config)}
                                                >
                                                    ⚙️ Configure
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {displayConfigs.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">No configurations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal */}
                {editingConfig && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Configure {editingConfig.key}</h2>
                            </div>
                            
                            <div className="form-group">
                                <label className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input 
                                        type="checkbox"
                                        checked={formData.enabled}
                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                    />
                                    Global Enable (On for everyone)
                                </label>
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                                    If unchecked, feature is disabled unless user is in the exception list below.
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Allowed Users (Phone Numbers)</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter phone numbers separated by commas (e.g. +919876543210, +919988776655)"
                                    value={formData.allowedPhones}
                                    onChange={(e) => setFormData({ ...formData, allowedPhones: e.target.value })}
                                />
                                <small style={{ color: '#6b7280' }}>
                                    These users will have access even if Global Enable is OFF.
                                </small>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
