/**
 * Footer Component - Member Portal
 * 会员端页脚
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="member-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{t('footer.about')}</h4>
          <ul>
            <li>
              <Link to="/member/about">{t('footer.systemIntro')}</Link>
            </li>
            <li>
              <Link to="/member/support">{t('footer.faq')}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('footer.support')}</h4>
          <ul>
            <li>
              <Link to="/member/support">{t('footer.contact')}</Link>
            </li>
            <li>{t('footer.phone')}: 033-123-4567</li>
            <li>{t('footer.email')}: support@gangwonbiz.or.kr</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('footer.legal')}</h4>
          <ul>
            <li>
              <Link to="/terms">{t('footer.termsOfService')}</Link>
            </li>
            <li>
              <Link to="/privacy">{t('footer.privacyPolicy')}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}

