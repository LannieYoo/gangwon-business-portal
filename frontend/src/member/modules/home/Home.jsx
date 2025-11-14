/**
 * Home Page - Member Portal
 * 企业会员首页
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';

export default function Home() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({
    projectsParticipated: 0,
    performanceSubmitted: 0,
    pendingReview: 0,
    documentsUploaded: 0
  });
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    loadBanners();
    loadNotices();
    loadStats();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await apiService.get(`${API_PREFIX}/content/banners`);
      if (response.banners) {
        setBanners(response.banners.map(b => ({
          id: b.id,
          imageUrl: b.imageUrl,
          link: b.linkUrl
        })));
      }
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await apiService.get(`${API_PREFIX}/content/notices`, { limit: 5 });
      if (response.notices) {
        setNotices(response.notices.map(n => ({
          id: n.id,
          title: n.title,
          date: n.publishedAt ? new Date(n.publishedAt).toISOString().split('T')[0] : '',
          important: n.category === 'announcement'
        })));
      }
    } catch (error) {
      console.error('Failed to load notices:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.get(`${API_PREFIX}/member/dashboard/stats`);
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

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
            <div className="stat-value">{stats.projectsParticipated}</div>
            <div className="stat-label">{t('home.stats.projectsParticipated')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.performanceSubmitted}</div>
            <div className="stat-label">{t('home.stats.performanceSubmitted')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.pendingReview}</div>
            <div className="stat-label">{t('home.stats.pendingReview')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.documentsUploaded}</div>
            <div className="stat-label">{t('home.stats.documentsUploaded')}</div>
          </Card>
        </div>
      </section>
    </div>
  );
}

