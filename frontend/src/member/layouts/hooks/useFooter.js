import { useState } from "react";

/**
 * Footer logic hook
 */
export function useFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTermType, setCurrentTermType] = useState(null);

  const handleOpenModal = (type) => {
    setIsModalOpen(true);
    setCurrentTermType(type);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTermType(null);
  };

  return {
    state: {
      isModalOpen,
      currentTermType,
    },
    actions: {
      handleOpenModal,
      handleCloseModal,
    },
  };
}
