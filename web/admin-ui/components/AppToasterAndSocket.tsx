"use client";

import { Toaster } from "react-hot-toast";
import AdminSocketListener from "@/components/AdminSocketListener";

export default function AppToasterAndSocket() {
  return (
    <>
      <Toaster position="top-right" />
      <AdminSocketListener />
    </>
  );
}
