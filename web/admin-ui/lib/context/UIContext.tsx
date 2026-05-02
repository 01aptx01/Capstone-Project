"use client";

import React, { createContext, useContext, useState } from "react";
import { ExportColumn } from "@/lib/utils/exportUtils";

// Re-export so pages can import from one place
export type { ExportColumn };

export type ExportSection = {
  id: string;
  label: string;
  description: string;
  columns: ExportColumn[];
  fetchData: () => Promise<Record<string, unknown>[]>;
};

type UIContextType = {
  isAddMachineOpen: boolean;
  openAddMachine: () => void;
  closeAddMachine: () => void;
  isExportModalOpen: boolean;
  exportSections: ExportSection[];
  exportPageTitle: string;
  openExportModal: (sections: ExportSection[], pageTitle?: string) => void;
  closeExportModal: () => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSections, setExportSections] = useState<ExportSection[]>([]);
  const [exportPageTitle, setExportPageTitle] = useState("รายงาน");

  const openAddMachine = () => setIsAddMachineOpen(true);
  const closeAddMachine = () => setIsAddMachineOpen(false);

  const openExportModal = (sections: ExportSection[], pageTitle = "รายงาน") => {
    setExportSections(sections);
    setExportPageTitle(pageTitle);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => setIsExportModalOpen(false);

  return (
    <UIContext.Provider value={{
      isAddMachineOpen,
      openAddMachine,
      closeAddMachine,
      isExportModalOpen,
      exportSections,
      exportPageTitle,
      openExportModal,
      closeExportModal,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
