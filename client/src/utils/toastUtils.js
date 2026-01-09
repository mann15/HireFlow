import { toast } from "react-toastify";

export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showWarning = (message) => toast.warn(message);
export const showInfo = (message) => toast.info(message);

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.error ||
    error?.data?.error ||
    error?.message ||
    fallback
  );
};
