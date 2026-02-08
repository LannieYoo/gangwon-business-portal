import { useEffect, useRef } from "react";

/**
 * Mobile Menu logic hook
 * @param {Object} params
 * @param {boolean} params.isOpen
 * @param {Function} params.onClose
 */
export function useMobileMenu({ isOpen, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return {
    menuRef,
  };
}




