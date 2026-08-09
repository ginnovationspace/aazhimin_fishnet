import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title: string;
  description?: string;
};

// Keep the app's existing shadcn-style API while using Sonner's public API.
export const useToast = () => ({
  toast: ({ title, description }: ToastOptions) => sonnerToast(title, { description }),
});
