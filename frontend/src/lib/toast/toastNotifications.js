import { Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    pauseOnHover: false,
    hideProgressBar: true,
    transition: Bounce,
  });
};

export const ToastError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    pauseOnHover: false,
    hideProgressBar: true,
    transition: Bounce,
  });
};

export const ToastInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 2000,
    pauseOnHover: false,
    hideProgressBar: true,
    transition: Bounce,
  });
};

// export const ToastAlert = (message, router) => {
//   toast.error(message, {
//     position: "top-center",
//     autoClose: false,
//     closeOnClick: false,
//     closeButton: true,
//     draggable: false,
//     progress: undefined,
//     onClose: () => router.replace("/auth/login"),
//   });
// };
