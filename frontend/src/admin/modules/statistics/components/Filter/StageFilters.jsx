/*
 * StageFilters - 创业阶段筛选组件
 * 使用标签按钮组支持多选
 */
import { useTranslation } from "react-i18next";
import { STARTUP_STAGE_OPTIONS } from "../../enum";
import { TagButton, TagGroup } from "./TagButton";

export const StageFilters = ({ stages = [], onChange }) => {
  const { t } = useTranslation();

  const handleToggle = (value) => {
    const newStages = stages.includes(value)
      ? stages.filter((s) => s !== value)
      : [...stages, value];
    onChange("startupStages", newStages);
  };

  return (
    <TagGroup>
      {STARTUP_STAGE_OPTIONS.map((opt) => (
        <TagButton
          key={opt.value}
          value={opt.value}
          selected={stages.includes(opt.value)}
          onClick={handleToggle}
        >
          {t(opt.labelKey)}
        </TagButton>
      ))}
    </TagGroup>
  );
};
