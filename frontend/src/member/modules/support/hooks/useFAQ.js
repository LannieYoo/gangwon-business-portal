/**
 * FAQ 业务逻辑 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supportService } from "../services/support.service";
import { useApiCache } from "@shared/hooks/useApiCache";

/**
 * FAQ 逻辑控制 Hook
 */
export function useFAQ() {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  const fetchFAQs = useCallback(async () => {
    const response = await supportService.listFAQs({});
    return response.items || [];
  }, []);

  const { data: allFaqs, loading, error, refresh: loadFAQs } = useApiCache(
    fetchFAQs,
    'faq-list',
    {
      cacheDuration: 5 * 60 * 1000, // 5分钟缓存（FAQ 很少更新）
      enabled: true
    }
  );

  // 使用 useMemo 确保返回稳定的数组引用
  const stableAllFaqs = useMemo(() => allFaqs ?? [], [allFaqs]);

  const handleFilterChange = useCallback((filtered) => {
    setFilteredFaqs(filtered);
  }, []);

  // 获取所有分类
  const categories = useMemo(() => {
    const categorySet = new Set();
    stableAllFaqs.forEach((faq) => {
      if (faq.category) {
        categorySet.add(faq.category);
      }
    });
    return Array.from(categorySet);
  }, [stableAllFaqs]);

  // FAQ 分类翻译映射
  const categoryTranslations = useMemo(
    () => ({
      회원가입: t("member.support.faqCategory.registration", "회원가입"),
      general: t("member.support.faqCategory.general", "일반"),
      성과관리: t("member.support.faqCategory.performance", "성과관리"),
      프로젝트: t("member.support.faqCategory.project", "지원사업"),
      기업프로필: t("member.support.faqCategory.profile", "기업프로필"),
      "문의/지원": t("member.support.faqCategory.support", "문의/지원"),
      기타: t("member.support.faqCategory.other", "기타"),
    }),
    [t],
  );

  // 分类选项
  const categoryOptions = useMemo(
    () => [
      { value: "", label: t('common.all', '전체') },
      ...categories.map((cat) => ({
        value: cat,
        label: categoryTranslations[cat] || cat,
      })),
    ],
    [categories, t, categoryTranslations],
  );

  // 按分类过滤
  const categoryFilteredFaqs = useMemo(() => {
    if (!selectedCategory) return stableAllFaqs;
    return stableAllFaqs.filter((faq) => faq.category === selectedCategory);
  }, [stableAllFaqs, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return {
    allFaqs: stableAllFaqs,
    filteredFaqs,
    loading,
    expandedIds,
    selectedCategory,
    categories,
    categoryTranslations,
    categoryOptions,
    categoryFilteredFaqs,
    setSelectedCategory,
    handleFilterChange,
    toggleExpand,
    loadFAQs,
  };
}
