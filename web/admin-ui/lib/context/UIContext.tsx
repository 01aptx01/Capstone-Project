"use client";

import React, { createContext, useContext, useState } from "react";

type UIContextType = {
  isAddMachineOpen: boolean;
  openAddMachine: () => void;
  closeAddMachine: () => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);

  const openAddMachine = () => setIsAddMachineOpen(true);
  const closeAddMachine = () => setIsAddMachineOpen(false);

  return (
    <UIContext.Provider value={{ isAddMachineOpen, openAddMachine, closeAddMachine }}>
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
