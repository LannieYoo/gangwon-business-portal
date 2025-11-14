/**
 * Home Page - Member Portal
 * 企业会员首页
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';

export default function Home() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [notices, setNotices] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    // TODO: 从 API 获取横幅和公告数据
    // Mock data for development
    setBanners([
      { id: 1, imageUrl: '/images/banner1.jpg', link: '/about' },
      { id: 2, imageUrl: '/images/banner2.jpg', link: '/projects' },
      { id: 3, imageUrl: '/images/banner3.jpg', link: '/support' }
    ]);

    setNotices([
      { id: 1, title: '2025年度创业支持项目公告', date: '2025-01-15', important: true },
      { id: 2, title: '第一季度绩效数据提交通知', date: '2025-01-10', important: false },
      { id: 3, title: '系统维护通知', date: '2025-01-05', important: false }
    ]);
  }, []);

  // 横幅自动切换
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const quickLinks = [
    { 
      title: t('home.quickLinks.projectApplication'),
      description: t('home.quickLinks.projectApplicationDesc'),
      icon: '📋',
      link: '/member/projects',
      color: 'primary'
    },
    { 
      title: t('home.quickLinks.performance'),
      description: t('home.quickLinks.performanceDesc'),
      icon: '📊',
      link: '/member/performance',
      color: 'success'
    },
    { 
      title: t('home.quickLinks.profile'),
      description: t('home.quickLinks.profileDesc'),
      icon: '🏢',
      link: '/member/profile',
      color: 'info'
    },
    { 
      title: t('home.quickLinks.support'),
      description: t('home.quickLinks.supportDesc'),
      icon: '💬',
      link: '/member/support',
      color: 'warning'
    }
  ];

  return (
    <div className="home">
      {/* 横幅轮播 */}
      <section className="banner-section">
        <div className="banner-carousel">
          {banners.length > 0 && (
            <>
              <div 
                className="banner-image"
                style={{ 
                  backgroundImage: `url(${banners[currentBanner].imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '400px',
                  borderRadius: '8px'
                }}
              >
                <div className="banner-overlay">
                  <h1>{t('home.banner.welcome')}</h1>
                  <p>{t('home.banner.subtitle')}</p>
                </div>
              </div>
              
              {/* 横幅指示器 */}
              {banners.length > 1 && (
                <div className="banner-indicators">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentBanner ? 'active' : ''}`}
                      onClick={() => setCurrentBanner(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 快捷入口 */}
      <section className="quick-links-section">
        <h2>{t('home.quickLinks.title')}</h2>
        <div className="quick-links-grid">
          {quickLinks.map((link, index) => (
            <Card key={index} className={`quick-link-card ${link.color}`}>
              <Link to={link.link}>
                <div className="card-icon">{link.icon}</div>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 最新公告 */}
      <section className="notices-section">
        <div className="section-header">
          <h2>{t('home.notices.title')}</h2>
          <Link to="/member/projects" className="view-all">
            {t('common.more')} →
          </Link>
        </div>
        
        <Card>
          <div className="notices-list">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-item">
                <Link to={`/member/projects/notices/${notice.id}`}>
                  <div className="notice-content">
                    {notice.important && (
                      <span className="badge badge-danger">{t('home.notices.important')}</span>
                    )}
                    <span className="notice-title">{notice.title}</span>
                  </div>
                  <span className="notice-date">{notice.date}</span>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* 统计概览 */}
      <section className="stats-section">
        <h2>{t('home.stats.title')}</h2>
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">{t('home.stats.projectsParticipated')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">8</div>
            <div className="stat-label">{t('home.stats.performanceSubmitted')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">2</div>
            <div className="stat-label">{t('home.stats.pendingReview')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">15</div>
            <div className="stat-label">{t('home.stats.documentsUploaded')}</div>
          </Card>
        </div>
      </section>
    </div>
  );
}

