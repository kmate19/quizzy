import { toast, type ToastOptions } from 'vue3-toastify';

const loginWrapper = (res) =>{
    console.log(res);
    switch (res.statusText) {
      case "Not found":
        toast("Helytelen felhasználónév vagy jelszó páros!", {
          autoClose: 5000,
          position: toast.POSITION.TOP_CENTER,
          type: 'error',
          transition: "zoom",
          pauseOnHover: false,
        } as ToastOptions);
        break;
      case "Unauthorized":
        break; 
      }
}

export default loginWrapper;