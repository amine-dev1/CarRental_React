import { api } from './http';

export const contractsApi = {
  /**
   * Generates a draft contract
   */
  generate: (data) =>
    api('/api/contracts/generate', {
      method: 'POST',
      body: data
    }),

  /**
   * Finalizes contract with signature
   */
  sign: (contract_id, payload) =>
    api(`/api/contracts/${contract_id}/sign`, {
      method: 'POST',
      body: payload
    }),

  /**
   * Gets download URL (returns the URL from API)
   */
  getDownloadUrl: (contract_id) => {
    const token = localStorage.getItem("token");
    return `${import.meta.env.VITE_API_URL}/api/contracts/${contract_id}/download?token=${token}`;
  },

  /**
   * Gets download URL by rental ID (finds latest signed contract)
   */
  getDownloadByRentalUrl: (rental_id) => {
    const token = localStorage.getItem("token");
    return `${import.meta.env.VITE_API_URL}/api/contracts/by-rental/${rental_id}/download?token=${token}`;
  },

  /**
   * List contracts for a specific rental
   */
  listByRental: (rental_id) =>
    api(`/api/contracts?rental_id=${rental_id}`),

  /**
   * List available templates
   */
  listTemplates: () =>
    api('/api/templates')
};
