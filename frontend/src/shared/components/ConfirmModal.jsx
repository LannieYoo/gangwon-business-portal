/**
 * Confirm Modal Component
 * 确认弹框 - 用于删除/清理等需要二次确认的操作
 */

import { Modal, ModalFooter } from './Modal';
import Button from './Button';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '确认操作', 
  message, 
  confirmText = '确定',
  cancelText = '取消',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-2">
        <p className="text-gray-600">{message}</p>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? '处理中...' : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
