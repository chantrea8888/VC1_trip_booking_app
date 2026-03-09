// Placeholder for Auth service
export const authService = {
  login: async (credentials: any) => {
    return { user: { name: 'Test User', role: 'customer' } };
  },
  logout: async () => {
    return { success: true };
  }
};
