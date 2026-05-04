"use client";

import AddMachineModal from "@/components/machines/AddMachineModal";
import EditMachineModal from "@/components/machines/EditMachineModal";
import AddProductModal from "@/components/products/AddProductModal";
import EditProductModal from "@/components/products/EditProductModal";
import ExportModal from "@/components/dashboard/ExportModal";
import CreateCouponModal from "@/components/customers/CreateCouponModal";
import { useUI } from "@/lib/context/UIContext";

export default function GlobalModals() {
  const {
    isAddMachineOpen, closeAddMachine,
    isEditMachineOpen, closeEditMachine, editingMachine,
    isAddProductOpen, closeAddProduct,
    isEditProductOpen, closeEditProduct, editingProduct,
    isExportModalOpen, closeExportModal,
    exportSections, exportPageTitle,
    isCreateCouponOpen, closeCreateCoupon,
  } = useUI();

  return (
    <>
      <AddMachineModal
        open={isAddMachineOpen}
        onClose={closeAddMachine}
      />
      <EditMachineModal
        open={isEditMachineOpen}
        onClose={closeEditMachine}
        machine={editingMachine}
      />
      <AddProductModal
        open={isAddProductOpen}
        onClose={closeAddProduct}
      />
      <EditProductModal
        open={isEditProductOpen}
        onClose={closeEditProduct}
        product={editingProduct}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        sections={exportSections}
        pageTitle={exportPageTitle}
      />
      <CreateCouponModal
        open={isCreateCouponOpen}
        onClose={closeCreateCoupon}
      />
    </>
  );
}

