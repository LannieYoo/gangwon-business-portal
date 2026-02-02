/*
 * ProgramFilters - 政策关联项目筛选组件 (支持多选)
 * 使用标签按钮组提升可用性
 */
import { useTranslation } from "react-i18next";
import { POLICY_TAGS_OPTIONS } from "../../enum";
import { TagButton, TagGroup } from "./TagButton";

export const ProgramFilters = ({ tags = [], onChange }) => {
  const { t } = useTranslation();

  const handleToggle = (value) => {
    const newTags = tags.includes(value)
      ? tags.filter((t) => t !== value)
      : [...tags, value];
    onChange("policyTags", newTags);
  };

  return (
    <TagGroup>
      {POLICY_TAGS_OPTIONS.map((opt) => (
        <TagButton
          key={opt.value}
          value={opt.value}
          selected={tags.includes(opt.value)}
          onClick={handleToggle}
        >
          {t(`statistics.filters.participation.${opt.value.toLowerCase()}`)}
        </TagButton>
      ))}
    </TagGroup>
  );
};
