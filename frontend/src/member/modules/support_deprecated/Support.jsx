/**
 * Support Page - Member Portal
 * 支持页面容器组件（默认重定向到 FAQ 页面）
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Support() {
  const navigate = useNavigate();

  useEffect(() => {
    // 默认重定向到 FAQ 页面
    navigate('/member/support/faq', { replace: true });
  }, [navigate]);

  return null;
}
