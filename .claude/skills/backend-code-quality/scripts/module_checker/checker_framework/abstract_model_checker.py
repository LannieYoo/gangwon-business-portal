"""Model 检查器抽象实现。"""
import ast
from pathlib import Path
from typing import Dict, Set, List, Tuple

from .i_model_checker import IModelChecker


class AbstractModelChecker(IModelChecker):
    """Model 检查器抽象实现。"""

    def check_model_file_organization(self, module_path: str) -> None:
        """检查 Model 文件组织规范。"""
        if hasattr(self, '_model_organization_checked') and self._model_organization_checked:
            return
            
        # 查找 _04_models 目录
        models_dir = None
        module_path_obj = Path(module_path)
        
        if module_path_obj.name == '_04_models':
            models_dir = module_path_obj
        else:
            for subdir in module_path_obj.rglob('*'):
                if subdir.is_dir() and subdir.name == '_04_models':
                    models_dir = subdir
                    break
        
        if not models_dir:
            self._model_organization_checked = True
            return
            
        # 检查只允许 model_ 和 repo_ 文件
        allowed_prefixes = ['model_', 'repo_']
        organization_issues = 0
        
        for file_path in models_dir.glob('*.py'):
            if file_path.name == '__init__.py':
                continue
                
            has_valid_prefix = any(file_path.name.startswith(prefix) for prefix in allowed_prefixes)
            
            if not has_valid_prefix:
                self.add_violation(
                    str(file_path), 1,
                    f"_04_models 层只允许 model_*.py 和 repo_*.py 文件，发现不规范文件: {file_path.name}",
                )
                organization_issues += 1
            
        self._model_organization_checked = True
        self._model_organization_valid = (organization_issues == 0)

    def check_model_structure(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Model 结构规范。"""
        # 只在 _04_models 层检查
        if '_04_models' not in file_path:
            return
            
        # 按优先级顺序检查
        if 'settings' in node.name.lower():
            if not self.check_settings_class(node, file_path):
                return
        
        self.check_model_naming(node, file_path)

    def check_settings_class(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 Settings 类规范。"""
        has_base_settings = False
        
        for base in node.bases:
            if isinstance(base, ast.Name) and base.id in ['BaseSettings', 'Settings']:
                has_base_settings = True
                break
            elif isinstance(base, ast.Attribute) and base.attr in ['BaseSettings', 'Settings']:
                has_base_settings = True
                break
        
        if not has_base_settings:
            self.add_violation(
                file_path, node.lineno,
                f"Settings 类 {node.name} 必须继承 Pydantic BaseSettings",
            )
            return False
            
        return True

    def check_model_naming(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 Model 命名规范。"""
        # 豁免 Pydantic 内部类
        if node.name in ['Config', 'Meta']:
            return True
            
        if 'model_' in file_path:
            valid_suffixes = ['Model', 'Settings']
            has_valid_suffix = any(node.name.endswith(suffix) for suffix in valid_suffixes)
            
            if not has_valid_suffix:
                self.add_violation(
                    file_path, node.lineno,
                    f"Model 类 {node.name} 应以 Model 或 Settings 结尾",
                )
                return False
        
        elif 'repo_' in file_path:
            if not node.name.endswith('Repository'):
                self.add_violation(
                    file_path, node.lineno,
                    f"Repository 类 {node.name} 应以 Repository 结尾",
                )
                return False
            
        return True

    def check_dto_model_field_matching(self, module_path: str) -> None:
        """检查 DTO 和 Model 字段匹配性。"""
        if hasattr(self, '_dto_model_matching_checked'):
            return
            
        module_path_obj = Path(module_path)
        
        # 查找 DTO 和 Model 目录
        dto_dir = None
        models_dir = None
        
        for subdir in module_path_obj.rglob('*'):
            if subdir.is_dir():
                if subdir.name == '_02_dtos':
                    dto_dir = subdir
                elif subdir.name == '_04_models':
                    models_dir = subdir
        
        if not dto_dir or not models_dir:
            self._dto_model_matching_checked = True
            return
        
        # 解析 DTO 字段
        dto_fields = self._extract_dto_response_fields(dto_dir)
        
        # 解析 Model 字段
        model_fields = self._extract_model_fields(models_dir)
        
        # 检查字段匹配
        self._check_field_matching(dto_fields, model_fields, str(dto_dir))
        
        self._dto_model_matching_checked = True

    def _extract_dto_response_fields(self, dto_dir: Path) -> Dict[str, Set[str]]:
        """提取 DTO Response 类的字段。"""
        dto_fields = {}
        
        for file_path in dto_dir.glob('*.py'):
            if file_path.name == '__init__.py':
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    tree = ast.parse(content)
                    
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        # 只检查 Response 类
                        if 'Response' in node.name and 'Request' not in node.name:
                            fields = self._extract_pydantic_fields(node)
                            if fields:
                                dto_fields[node.name] = fields
            except Exception:
                continue
                
        return dto_fields

    def _extract_model_fields(self, models_dir: Path) -> Dict[str, Set[str]]:
        """提取 Model 类的字段。"""
        model_fields = {}
        
        for file_path in models_dir.glob('model_*.py'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    tree = ast.parse(content)
                    
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        if node.name.endswith('Model'):
                            fields = self._extract_sqlalchemy_fields(node)
                            if fields:
                                model_fields[node.name] = fields
            except Exception:
                continue
                
        return model_fields

    def _extract_pydantic_fields(self, node: ast.ClassDef) -> Set[str]:
        """提取 Pydantic 类的字段。"""
        fields = set()
        
        for item in node.body:
            if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                fields.add(item.target.id)
                
        return fields

    def _extract_sqlalchemy_fields(self, node: ast.ClassDef) -> Set[str]:
        """提取 SQLAlchemy 模型的字段。"""
        fields = set()
        
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        # 排除特殊属性
                        if not target.id.startswith('__') and target.id not in ['metadata']:
                            fields.add(target.id)
                            
        return fields

    def _check_field_matching(self, dto_fields: Dict[str, Set[str]], model_fields: Dict[str, Set[str]], dto_path: str) -> None:
        """检查 DTO 和 Model 字段匹配。"""
        # 关联字段白名单（这些字段可以在 DTO 中但不在 Model 中）
        relation_fields = {'user_email', 'user_company_name', 'company_name', 'user_name'}
        
        # 分页字段白名单（列表响应 DTO 特有）
        pagination_fields = {'items', 'total', 'page', 'page_size', 'total_pages'}
        
        # API 响应字段白名单（API 层特有）
        api_response_fields = {'status', 'processed', 'failed', 'message', 'success', 'deleted_count', 'content', 'media_type', 'filename'}
        
        for dto_name, dto_field_set in dto_fields.items():
            # 查找对应的 Model（通过命名约定）
            corresponding_models = []
            
            # 尝试匹配规则：DtoLogResponse -> AppLogModel, PerformanceLogModel, SystemLogModel
            if 'Log' in dto_name and 'Response' in dto_name and 'List' not in dto_name:
                for model_name in model_fields.keys():
                    if 'LogModel' in model_name:
                        corresponding_models.append(model_name)
            
            if not corresponding_models:
                continue
                
            # 检查每个对应的 Model
            for model_name in corresponding_models:
                model_field_set = model_fields[model_name]
                
                # 构建白名单字段集合
                whitelist_fields = relation_fields | pagination_fields | api_response_fields
                
                # 检查 DTO 字段是否在 Model 中存在（排除白名单字段）
                dto_only_fields = dto_field_set - model_field_set - whitelist_fields
                
                # 对于通用 DTO（如 DtoLogResponse），只检查所有 Model 都有的字段
                if len(corresponding_models) > 1:
                    # 计算所有对应 Model 的交集字段
                    common_fields = model_field_set
                    for other_model in corresponding_models:
                        if other_model != model_name:
                            common_fields = common_fields & model_fields[other_model]
                    
                    # 只检查 DTO 中不在任何 Model 交集中的字段
                    dto_only_fields = dto_field_set - common_fields - whitelist_fields
                    
                    # 只在第一个 Model 时报告问题，避免重复
                    if model_name != corresponding_models[0]:
                        continue
                
                if dto_only_fields:
                    models_info = f"Models {', '.join(corresponding_models)}" if len(corresponding_models) > 1 else f"Model {model_name}"
                    self.add_violation(
                        dto_path, 1,
                        f"DTO {dto_name} 包含 {models_info} 中不存在的字段: {', '.join(sorted(dto_only_fields))}",
                    )
                
                # 检查核心字段是否缺失（只对单个 Model 检查）
                if len(corresponding_models) == 1:
                    important_fields = {'id', 'created_at', 'message', 'level'}
                    missing_important = (important_fields & model_field_set) - dto_field_set
                    
                    if missing_important:
                        self.add_violation(
                            dto_path, 1,
                            f"DTO {dto_name} 缺少 Model {model_name} 中的重要字段: {', '.join(sorted(missing_important))}",
                        )