import { useTranslation } from "react-i18next";
import { Modal, Button } from "@shared/components";

export default function RejectionReasonModal({ isOpen, onClose, reason }) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('member.projects.applicationRecords.rejectionReason.title', '거절 사유')}
    >
      <div className="p-4">
        <p className="text-gray-700 mb-4">
          {reason ||
            t(
              "projects.applicationRecords.rejectionReason.noReason",
              "거절 사유가 제공되지 않았습니다.",
            )}
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t('member.projects.applicationRecords.rejectionReason.close', '닫기')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
