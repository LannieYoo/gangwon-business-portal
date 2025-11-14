/**
 * Footer Component - Admin Portal
 * 管理员端页脚
 */

import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p>&copy; {currentYear} {t('admin.footer.copyright')}</p>
        </div>
        <div className="footer-section">
          <p>{t('admin.footer.version')}: 1.0.0</p>
        </div>
      </div>
    </footer>
  );
}

