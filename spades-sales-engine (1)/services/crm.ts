
import { User } from '../types';
import { api } from './api';

export const CrmService = {
  syncUserToClose: async (user: User): Promise<{ leadId: string; contactId: string } | null> => {
    try {
      console.log(`[Close CRM] Syncing user: ${user.email}`);
      const result = await api.post<{ leadId: string; contactId: string }>('/crm/sync', { userData: user });
      return result;
    } catch (error) {
      console.error('[Close CRM] Sync Failed:', error);
      return null;
    }
  }
};
