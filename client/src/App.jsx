import { Toaster } from "react-hot-toast";
import Router from "./router";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router />
    </>
  );
}
