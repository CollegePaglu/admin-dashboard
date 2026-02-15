import React, { useState, useEffect } from 'react';
import { configApi } from '../api/configApi';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './FeatureFlags.css';

export default function FeatureFlags() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleToggle = async (config) => {
        const newValue = !config.value;
        const { data, error } = await configApi.update({
            key: config.key,
            value: newValue,
            description: config.description,
            isPublic: config.isPublic,
        });

        if (error) {
            toast.error(error.message || 'Failed to update configuration');
        } else {
            toast.success(`Feature ${newValue ? 'enabled' : 'disabled'} successfully`);
            fetchConfigs(); // Refresh to ensure sync
        }
    };

    // Helpler to ensure we have the required flags even if not in DB yet
    const ensureFlags = () => {
        const requiredFlags = [
            { key: 'feature_lazypeeps_enabled', description: 'Enable LazyPeeps Feature', value: false },
            { key: 'feature_assignment_enabled', description: 'Enable Assignment Feature', value: false },
        ];

        const merged = [...configs];
        requiredFlags.forEach(req => {
            if (!merged.find(c => c.key === req.key)) {
                merged.push({ ...req, isPublic: true, isVirtual: true }); // isVirtual means not saved yet used for UI
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
                    <p>Manage application features and system configurations.</p>
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
                                {displayConfigs.map((config) => (
                                    <tr key={config.key}>
                                        <td className="font-semibold">{config.key}</td>
                                        <td>{config.description || 'No description'}</td>
                                        <td>
                                            <span className={`status-badge ${config.value ? 'active' : 'inactive'}`}>
                                                {config.value ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn-toggle ${config.value ? 'on' : 'off'}`}
                                                onClick={() => handleToggle(config)}
                                            >
                                                {config.value ? 'Disable' : 'Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {displayConfigs.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">No configurations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
