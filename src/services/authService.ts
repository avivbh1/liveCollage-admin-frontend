export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock generic login - accept any email with password 'admin' or just allow all for demo?
    // User requested "Simple admin login (email + password)". "Mock authentication allowed".
    
    if (password === 'password' || password === 'admin') {
      return {
        id: 'u_1',
        email,
        name: 'Event Organizer',
      };
    }
    
    throw new Error('Invalid credentials');
  },

  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};
