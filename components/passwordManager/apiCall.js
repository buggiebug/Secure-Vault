// services/api.js
const API_BASE_URL = 'https://your-api-domain.com/api'; // Replace with your actual API URL

class PasswordManagerAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setAuthToken(token) {
    this.token = token;
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Password-related API calls
  async getPasswords() {
    return this.apiCall('/passwords');
  }

  async createPassword(passwordData) {
    return this.apiCall('/passwords', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async updatePassword(id, passwordData) {
    return this.apiCall(`/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deletePassword(id) {
    return this.apiCall(`/passwords/${id}`, {
      method: 'DELETE',
    });
  }

  // Group-related API calls
  async getGroups() {
    return this.apiCall('/groups');
  }

  async createGroup(groupData) {
    return this.apiCall('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(id, groupData) {
    return this.apiCall(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(id) {
    return this.apiCall(`/groups/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export default new PasswordManagerAPI();