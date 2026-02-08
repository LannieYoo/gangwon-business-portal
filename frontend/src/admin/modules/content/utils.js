/**
 * Content Management Utilities
 * 内容管理工具函数
 */

/**
 * Create empty banner form
 */
export function createEmptyBannerForm() {
  return {
    id: null,
    bannerType: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    displayOrder: 0,
  };
}

/**
 * Validate banner form
 */
export function validateBannerForm(form, t) {
  const errors = {};
  if (!form.bannerType?.trim()) {
    errors.bannerType = t("error.validation.required", {
      field: t("admin.content.banners.form.fields.bannerType", "배너 유형"),
    });
  }
  if (!form.imageUrl?.trim()) {
    errors.imageUrl = t("error.validation.required", {
      field: t("admin.content.banners.form.fields.imageUrl", "이미지 URL"),
    });
  }
  return errors;
}

/**
 * Create empty notice form
 */
export function createEmptyNoticeForm() {
  return {
    id: null,
    title: "",
    contentHtml: "",
    boardType: "notice",
  };
}

/**
 * Validate notice form
 */
export function validateNoticeForm(form, t) {
  const errors = {};
  if (!form.title?.trim()) {
    errors.title = t("error.validation.required", {
      field: t("admin.content.notices.form.fields.title", "제목"),
    });
  }
  if (!form.contentHtml?.trim()) {
    errors.contentHtml = t("error.validation.required", {
      field: t("admin.content.notices.form.fields.contentHtml", "내용"),
    });
  }
  return errors;
}

/**
 * Create empty news form
 */
export function createEmptyNewsForm() {
  return {
    id: null,
    title: "",
    imageUrl: "",
  };
}

/**
 * Validate news form
 */
export function validateNewsForm(form, t) {
  const errors = {};
  if (!form.title?.trim()) {
    errors.title = t("error.validation.required", {
      field: t("admin.content.news.form.fields.title", "제목"),
    });
  }
  if (!form.imageUrl?.trim()) {
    errors.imageUrl = t("error.validation.required", {
      field: t("admin.content.news.form.fields.imageUrl", "이미지 URL"),
    });
  }
  return errors;
}
