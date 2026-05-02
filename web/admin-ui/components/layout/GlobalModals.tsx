"use client";

import AddMachineModal from "@/components/machines/AddMachineModal";
import { useUI } from "@/lib/context/UIContext";

export default function GlobalModals() {
  const { isAddMachineOpen, closeAddMachine } = useUI();

  return (
    <>
      <AddMachineModal 
        open={isAddMachineOpen} 
        onClose={closeAddMachine} 
      />
    </>
  );
}
