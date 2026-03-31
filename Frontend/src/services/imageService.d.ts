export const uploadImage: (file: File, folder?: string) => Promise<{
  success?: boolean;
  url?: string;
  path?: string;
  message?: string;
}>;