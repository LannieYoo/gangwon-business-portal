/**
 * Member List Component - Admin Portal
 * 企业会员列表
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Select, Badge, Pagination } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './MemberList.css';

export default function MemberList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('companyName');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadMembers();
  }, [currentPage, pageSize, statusFilter, searchTerm, searchField]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        search_field: searchField
      };
      const response = await apiService.get(`${API_PREFIX}/admin/members`, params);
      if (response.members) {
        setMembers(response.members);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadMembers();
  };

  const handleExport = () => {
    // TODO: 实现 Excel 导出
    console.log('Exporting members...');
  };

  const handleApprove = async (memberId) => {
    try {
      await apiService.patch(`${API_PREFIX}/admin/members/${memberId}/status`, {
        approvalStatus: 'approved'
      });
      loadMembers();
    } catch (error) {
      console.error('Failed to approve member:', error);
      alert(t('admin.members.approveFailed'));
    }
  };

  const handleViewDetail = (memberId) => {
    navigate(`/admin/members/${memberId}`);
  };

  const handleViewPerformance = (memberId) => {
    navigate(`/admin/performance?memberId=${memberId}`);
  };

  const columns = [
    {
      key: 'companyName',
      label: t('admin.members.table.companyName'),
      sortable: true
    },
    {
      key: 'representative',
      label: t('admin.members.table.representative'),
      sortable: true
    },
    {
      key: 'businessNumber',
      label: t('admin.members.table.businessNumber'),
      sortable: true
    },
    {
      key: 'address',
      label: t('admin.members.table.address')
    },
    {
      key: 'industry',
      label: t('admin.members.table.industry')
    },
    {
      key: 'approvalStatus',
      label: t('admin.members.table.status'),
      render: (value) => (
        <Badge 
          variant={value === 'approved' ? 'success' : value === 'pending' ? 'warning' : 'danger'}
        >
          {t(`members.status.${value}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: t('admin.members.table.actions'),
      render: (_, row) => (
        <div className="action-buttons">
          <Button 
            size="small" 
            variant="outline"
            onClick={() => handleViewDetail(row.id)}
          >
            {t('common.view')}
          </Button>
          {row.approvalStatus === 'pending' && (
            <Button 
              size="small"
              onClick={() => handleApprove(row.id)}
            >
              {t('admin.members.approve')}
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="admin-member-list">
      <div className="page-header">
        <h1 className="page-title">{t('admin.members.title')}</h1>
        <Button onClick={handleExport}>
          {t('admin.members.export')}
        </Button>
      </div>

      <Card className="search-card">
        <div className="search-form">
          <Select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            options={[
              { value: 'companyName', label: t('admin.members.search.companyName') },
              { value: 'representative', label: t('admin.members.search.representative') },
              { value: 'businessField', label: t('admin.members.search.businessField') }
            ]}
            style={{ width: '150px' }}
          />
          <Input
            type="text"
            placeholder={t('admin.members.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'pending', label: t('admin.members.status.pending') },
              { value: 'approved', label: t('admin.members.status.approved') },
              { value: 'rejected', label: t('admin.members.status.rejected') }
            ]}
          />
          <Button onClick={handleSearch}>
            {t('common.search')}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="table-header">
          <div className="table-info">
            <span>{t('common.total')}: {totalCount} {t('common.items')}</span>
            <Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' },
                { value: 50, label: '50' }
              ]}
              style={{ width: '80px' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-placeholder">{t('common.loading')}</div>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={members}
              onRowClick={(row) => handleViewDetail(row.id)}
            />
            {totalCount > 0 && (
              <Pagination
                current={currentPage}
                total={totalCount}
                pageSize={pageSize}
                onChange={setCurrentPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

