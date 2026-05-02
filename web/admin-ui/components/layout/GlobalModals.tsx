"use client";

import AddMachineModal from "@/components/machines/AddMachineModal";
import ExportModal from "@/components/dashboard/ExportModal";
import { useUI } from "@/lib/context/UIContext";

export default function GlobalModals() {
  const {
    isAddMachineOpen, closeAddMachine,
    isExportModalOpen, closeExportModal,
    exportSections, exportPageTitle,
  } = useUI();

  return (
    <>
      <AddMachineModal
        open={isAddMachineOpen}
        onClose={closeAddMachine}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        sections={exportSections}
        pageTitle={exportPageTitle}
      />
    </>
  );
}
