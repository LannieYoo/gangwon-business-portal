/**
 * Address Search Component
 * 주소 검색 컴포넌트 - Daum 주소 API 사용
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

/**
 * Daum 주소 검색 API를 사용한 주소 검색 컴포넌트
 * @param {Object} props
 * @param {string} props.value - 현재 주소 값
 * @param {Function} props.onChange - 주소 변경 콜백 (address, zonecode)
 * @param {boolean} props.disabled - 비활성화 여부
 * @param {string} props.error - 에러 메시지
 * @param {boolean} props.required - 필수 여부
 */
export default function AddressSearch({ 
  value = '', 
  onChange,
  onSelect, 
  disabled = false, 
  error,
  required = false 
}) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // 支持 onChange 和 onSelect 两种回调方式
  const handleAddressChange = useCallback((address, zonecode) => {
    if (onSelect) {
      onSelect(address, zonecode);
    } else if (onChange) {
      onChange(address, zonecode);
    }
  }, [onChange, onSelect]);

  // Daum 주소 API 스크립트 로드
  useEffect(() => {
    if (window.daum && window.daum.Postcode) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // 스크립트는 제거하지 않음 (다른 컴포넌트에서 사용할 수 있음)
    };
  }, []);

  // 주소 검색 팝업 열기
  const openAddressSearch = useCallback(() => {
    if (!scriptLoaded || !window.daum || !window.daum.Postcode) {
      console.error('Daum Postcode API not loaded');
      return;
    }

    setIsModalOpen(true);

    // 약간의 지연 후 팝업 생성 (모달이 열린 후)
    setTimeout(() => {
      const container = document.getElementById('daum-postcode-container');
      if (!container) return;

      new window.daum.Postcode({
        oncomplete: (data) => {
          // 도로명 주소 우선, 없으면 지번 주소
          const address = data.roadAddress || data.jibunAddress;
          const zonecode = data.zonecode;
          
          handleAddressChange(address, zonecode);
          setIsModalOpen(false);
        },
        onclose: () => {
          setIsModalOpen(false);
        },
        width: '100%',
        height: '100%'
      }).embed(container);
    }, 100);
  }, [scriptLoaded, handleAddressChange]);

  return (
    <div className="address-search">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => handleAddressChange(e.target.value)}
            disabled={disabled}
            required={required}
            error={error}
            placeholder={t('common.addressPlaceholder', '주소를 검색하세요')}
            readOnly={!disabled}
            inline
            className="w-full"
          />
        </div>
        {!disabled && (
          <Button
            type="button"
            variant="secondary"
            onClick={openAddressSearch}
            disabled={!scriptLoaded}
            className="whitespace-nowrap h-[42px]"
          >
            {t('common.searchAddress', '주소 검색')}
          </Button>
        )}
      </div>

      {/* 주소 검색 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('common.searchAddress', '주소 검색')}
        size="md"
      >
        <div 
          id="daum-postcode-container" 
          style={{ width: '100%', height: '450px' }}
        />
      </Modal>
    </div>
  );
}
