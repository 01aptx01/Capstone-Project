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
  isEditMachineOpen: boolean;
  editingMachine: any | null;
  openEditMachine: (machine: any) => void;
  closeEditMachine: () => void;
  isAddProductOpen: boolean;
  openAddProduct: () => void;
  closeAddProduct: () => void;
  isEditProductOpen: boolean;
  editingProduct: any | null;
  openEditProduct: (product: any) => void;
  closeEditProduct: () => void;
  isExportModalOpen: boolean;
  exportSections: ExportSection[];
  exportPageTitle: string;
  openExportModal: (sections: ExportSection[], pageTitle?: string) => void;
  closeExportModal: () => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [isEditMachineOpen, setIsEditMachineOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any | null>(null);
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSections, setExportSections] = useState<ExportSection[]>([]);
  const [exportPageTitle, setExportPageTitle] = useState("รายงาน");

  const openAddMachine = () => setIsAddMachineOpen(true);
  const closeAddMachine = () => setIsAddMachineOpen(false);

  const openEditMachine = (machine: any) => {
    setEditingMachine(machine);
    setIsEditMachineOpen(true);
  };
  const closeEditMachine = () => {
    setEditingMachine(null);
    setIsEditMachineOpen(false);
  };

  const openAddProduct = () => setIsAddProductOpen(true);
  const closeAddProduct = () => setIsAddProductOpen(false);

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };
  const closeEditProduct = () => {
    setEditingProduct(null);
    setIsEditProductOpen(false);
  };

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
      isEditMachineOpen,
      editingMachine,
      openEditMachine,
      closeEditMachine,
      isAddProductOpen,
      openAddProduct,
      closeAddProduct,
      isEditProductOpen,
      editingProduct,
      openEditProduct,
      closeEditProduct,
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
