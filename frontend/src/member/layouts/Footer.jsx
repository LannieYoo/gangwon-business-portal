/**
 * Footer Component - Member Portal
 * 会员端页脚 - Windster Style
 *
 * 遵循 dev-frontend_patterns skill 规范。
 * 已重构为组合式组件。
 */

import { TermsModal } from "@shared/components";
import { FooterLinks } from "./components/Footer/FooterLinks";
import { useFooter } from "./hooks/useFooter";

export default function Footer() {
  const {
    state: { isModalOpen, currentTermType },
    actions: { handleOpenModal, handleCloseModal },
  } = useFooter();

  return (
    <>
      <footer className="bg-white py-4 px-8 mt-auto transition-all duration-300 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] max-md:py-3 max-md:px-4 max-sm:py-2">
        <FooterLinks onOpenModal={handleOpenModal} />
      </footer>

      <TermsModal
        isOpen={isModalOpen}
        termType={currentTermType}
        onClose={handleCloseModal}
      />
    </>
  );
}
