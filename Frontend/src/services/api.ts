// Placeholder for API service
export const api = {
  get: async (url: string) => {
    console.log(`GET ${url}`);
    return { data: {} };
  },
  post: async (url: string, data: any) => {
    console.log(`POST ${url}`, data);
    return { data: {} };
  }
};
