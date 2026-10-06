import { RouterProvider } from "react-router-dom";

import {Toaster} from "sonner";

import { router } from "./router/app.routes";
import { AppProvider } from "./context/AppContext";

export const AgoraApp = () => {
  return (
    <AppProvider>
      <Toaster  richColors/>
      <RouterProvider router={router} />
    </AppProvider>
  );
};
