import { useTranslation } from "react-i18next";
import { Modal, Button, FileUploadButton } from "@shared/components";
import { CloseIcon } from "@shared/components/Icons";

export default function SupplementMaterialsModal({
  isOpen,
  onClose,
  onSubmit,
  supplementMessage,
  files,
  onFilesSelected,
  onFileRemove,
  loading,
}) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('member.projects.applicationRecords.supplementTitle', '추가 자료 제출')}
    >
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t('member.projects.applicationRecords.requestedMaterials', '요청된 자료')}
          </h4>
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
            {supplementMessage ||
              t(
                "projects.applicationRecords.supplementDefaultMessage",
                "관리자가 요청한 추가 자료를 제출해 주세요.",
              )}
          </p>
        </div>

        <div className="mb-4">
          <FileUploadButton
            onFilesSelected={onFilesSelected}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            label={t('member.projects.applicationRecords.selectFiles', '파일 선택')}
            variant="outline"
            size="medium"
            className="w-full"
          />
          <p className="text-gray-400 text-xs mt-2 text-center">
            {t(
              "projects.applicationRecords.uploadHint",
              "PDF, DOC, XLS 형식 지원, 최대 10MB",
            )}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('member.projects.applicationRecords.selectedFiles', '선택된 파일')} (
              {files.length})
            </h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                >
                  <span className="text-gray-700 truncate flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onFileRemove(index)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t('member.projects.applicationRecords.cancel', '취소')}
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={loading || files.length === 0}
          >
            {loading
              ? t('member.projects.applicationRecords.loading', '로딩중...')
              : t('member.projects.applicationRecords.submit', '제출')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
