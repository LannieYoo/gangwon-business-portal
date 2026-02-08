/**
 * Confirm Modal Component
 */

import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from './Modal';
import Button from './Button';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText,
  cancelText,
  confirmVariant = 'danger',
  loading = false,
}) {
  const { t } = useTranslation();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t('common.confirm')} size="sm">
      <div className="py-2">
        <p className="text-gray-600">{message}</p>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText || t('common.cancel')}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? t('common.processing') : (confirmText || t('common.confirm'))}
        </Button>
      </ModalFooter>
    </Modal>
  );
}




