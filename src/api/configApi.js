import { api } from './client';
import { ENDPOINTS } from '../config/constants';

export const configApi = {
    // Get all configs
    getAll: async () => {
        return await api.get(ENDPOINTS.CONFIG);
    },

    // Update or create config
    update: async (data) => {
        return await api.put(ENDPOINTS.CONFIG, data);
    },

    // Delete config
    delete: async (key) => {
        return await api.delete(`${ENDPOINTS.CONFIG}/${key}`);
    },
};
