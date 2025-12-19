import { User, UserMode } from '../types';
import { api } from './api';

const FREEMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 
  'icloud.com', 'proton.me', 'protonmail.com', 'aol.com', 'zoho.com'
];

export const extractDomain = (urlOrEmail: string): string | null => {
  try {
    let domain = '';
    if (urlOrEmail.includes('@')) {
      domain = urlOrEmail.split('@')[1];
    } else {
      const urlWithProto = urlOrEmail.startsWith('http') ? urlOrEmail : `https://${urlOrEmail}`;
      const urlObj = new URL(urlWithProto);
      domain = urlObj.hostname;
    }
    return domain.toLowerCase().replace(/^www\./, '');
  } catch (e) {
    return null;
  }
};

const mapUserResponse = (userData: any): User => {
  return {
    ...userData,
    organizationId: userData.organization_id || userData.organizationId,
    name: userData.name || `${userData.firstName} ${userData.lastName}`
  };
};

export const AuthService = {
  isFreeEmail: (email: string): boolean => {
    const domain = extractDomain(email);
    return domain ? FREEMAIL_DOMAINS.includes(domain) : false;
  },

  validateDomainMatch: (email: string, companyUrl: string): boolean => {
    const emailDomain = extractDomain(email);
    const companyDomain = extractDomain(companyUrl);
    if (!emailDomain || !companyDomain) return false;
    return emailDomain === companyDomain || emailDomain.endsWith(`.${companyDomain}`);
  },

  register: async (
    email: string, 
    password: string, 
    firstName: string,
    lastName: string,
    companyName: string,
    companyUrl: string,
    tempStrategy?: any
  ): Promise<void> => {
    if (AuthService.isFreeEmail(email)) {
        throw new Error("Please use your work email.");
    }
    if (!AuthService.validateDomainMatch(email, companyUrl)) {
        throw new Error("DOMAIN_MISMATCH");
    }

    await api.post('/auth/register', {
        email, password, firstName, lastName, companyName, companyUrl, tempStrategy
    });
  },

  verifyUser: async (token: string): Promise<boolean> => {
    return true; 
  },

  login: async (email: string, password: string): Promise<User> => {
    const res = await api.post<{success: boolean, user: any}>('/auth/login', { email, password });
    if (res && res.success && res.user) {
        return mapUserResponse(res.user);
    }
    // Fallback if login endpoint doesn't return user directly but sets cookie
    const meRes = await api.get<{success: boolean, user: any}>('/auth/me');
    if (meRes && meRes.success && meRes.user) {
        return mapUserResponse(meRes.user);
    }
    throw new Error("Login failed");
  },

  logout: async () => {
    try {
        await api.post('/auth/logout', {});
    } catch (e) { console.error(e); }
    window.location.href = "/";
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await api.get<{success: boolean, user: any}>('/auth/me');
      // Added safety check: res can be null if API is down
      if (res && res.success && res.user) {
        return mapUserResponse(res.user);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
};