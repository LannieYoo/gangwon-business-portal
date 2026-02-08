import { useTranslation } from "react-i18next";
import { Modal, Button } from "@shared/components";

export default function CancelApplicationModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('member.projects.applicationRecords.cancelConfirm.title', '신청 취소')}
    >
      <div className="p-4">
        <p className="text-gray-700 mb-2">
          {t(
            "projects.applicationRecords.cancelConfirm.message",
            "정말로 이 신청을 취소하시겠습니까?",
          )}
        </p>
        <p className="text-sm text-red-500 mb-4">
          {t(
            "projects.applicationRecords.cancelConfirm.warning",
            "취소 후에는 복구할 수 없습니다.",
          )}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t('member.projects.applicationRecords.cancelConfirm.cancel', '돌아가기')}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading
              ? t('member.projects.applicationRecords.loading', '로딩중...')
              : t(
                  "projects.applicationRecords.cancelConfirm.confirm",
                  "취소하기",
                )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
