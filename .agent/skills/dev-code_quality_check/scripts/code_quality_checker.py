"""
Code Quality Checker
检查代码质量问题：函数大小、文件大小、嵌套深度等
"""

import ast
import sys
from pathlib import Path
from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class QualityIssue:
    """代码质量问题"""
    severity: str  # 'error', 'warning', 'info'
    file: str
    line: int
    message: str
    rule: str


class CodeQualityChecker:
    """代码质量检查器"""
    
    # 阈值配置
    MAX_FUNCTION_LINES = 50
    MAX_FILE_LINES = 800
    MAX_NESTING_DEPTH = 4
    MAX_FUNCTION_PARAMS = 5
    
    def __init__(self):
        self.issues: List[QualityIssue] = []
    
    def check_file(self, file_path: str) -> List[QualityIssue]:
        """检查单个文件"""
        self.issues = []
        path = Path(file_path)
        
        if not path.exists():
            return self.issues
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            # 检查文件大小
            self._check_file_size(file_path, len(lines))
            
            # 解析 AST
            try:
                tree = ast.parse(content)
                self._check_ast(tree, file_path, lines)
            except SyntaxError as e:
                self.issues.append(QualityIssue(
                    severity='error',
                    file=file_path,
                    line=e.lineno or 0,
                    message=f"Syntax error: {e.msg}",
                    rule='syntax'
                ))
        
        except Exception as e:
            self.issues.append(QualityIssue(
                severity='error',
                file=file_path,
                line=0,
                message=f"Failed to check file: {e}",
                rule='file_access'
            ))
        
        return self.issues
    
    def _check_file_size(self, file_path: str, line_count: int):
        """检查文件大小"""
        if line_count > self.MAX_FILE_LINES:
            self.issues.append(QualityIssue(
                severity='warning',
                file=file_path,
                line=0,
                message=f"File too large: {line_count} lines (max {self.MAX_FILE_LINES}). Consider splitting.",
                rule='file_size'
            ))
    
    def _check_ast(self, tree: ast.AST, file_path: str, lines: List[str]):
        """检查 AST"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                self._check_function(node, file_path, lines)
            elif isinstance(node, ast.ClassDef):
                self._check_class(node, file_path)
    
    def _check_function(self, node: ast.FunctionDef, file_path: str, lines: List[str]):
        """检查函数"""
        # 计算函数行数
        if hasattr(node, 'end_lineno') and node.end_lineno:
            func_lines = node.end_lineno - node.lineno + 1
            
            if func_lines > self.MAX_FUNCTION_LINES:
                self.issues.append(QualityIssue(
                    severity='warning',
                    file=file_path,
                    line=node.lineno,
                    message=f"Function '{node.name}' too large: {func_lines} lines (max {self.MAX_FUNCTION_LINES}). Consider splitting.",
                    rule='function_size'
                ))
        
        # 检查参数数量
        param_count = len(node.args.args)
        if param_count > self.MAX_FUNCTION_PARAMS:
            self.issues.append(QualityIssue(
                severity='info',
                file=file_path,
                line=node.lineno,
                message=f"Function '{node.name}' has {param_count} parameters (max {self.MAX_FUNCTION_PARAMS}). Consider using a data class.",
                rule='function_params'
            ))
        
        # 检查嵌套深度
        max_depth = self._calculate_nesting_depth(node)
        if max_depth > self.MAX_NESTING_DEPTH:
            self.issues.append(QualityIssue(
                severity='warning',
                file=file_path,
                line=node.lineno,
                message=f"Function '{node.name}' has nesting depth {max_depth} (max {self.MAX_NESTING_DEPTH}). Use early returns or extract functions.",
                rule='nesting_depth'
            ))
        
        # 检查是否缺少文档字符串
        if not ast.get_docstring(node) and not node.name.startswith('_'):
            self.issues.append(QualityIssue(
                severity='info',
                file=file_path,
                line=node.lineno,
                message=f"Public function '{node.name}' missing docstring.",
                rule='missing_docstring'
            ))
    
    def _check_class(self, node: ast.ClassDef, file_path: str):
        """检查类"""
        # 检查类是否缺少文档字符串
        if not ast.get_docstring(node) and not node.name.startswith('_'):
            self.issues.append(QualityIssue(
                severity='info',
                file=file_path,
                line=node.lineno,
                message=f"Public class '{node.name}' missing docstring.",
                rule='missing_docstring'
            ))
        
        # 检查方法数量（God Class）
        methods = [n for n in node.body if isinstance(n, ast.FunctionDef)]
        if len(methods) > 20:
            self.issues.append(QualityIssue(
                severity='warning',
                file=file_path,
                line=node.lineno,
                message=f"Class '{node.name}' has {len(methods)} methods. Consider splitting (God Class anti-pattern).",
                rule='god_class'
            ))
    
    def _calculate_nesting_depth(self, node: ast.AST, current_depth: int = 0) -> int:
        """计算嵌套深度"""
        max_depth = current_depth
        
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.With, ast.Try)):
                child_depth = self._calculate_nesting_depth(child, current_depth + 1)
                max_depth = max(max_depth, child_depth)
            else:
                child_depth = self._calculate_nesting_depth(child, current_depth)
                max_depth = max(max_depth, child_depth)
        
        return max_depth
    
    def format_issues(self) -> str:
        """格式化问题报告"""
        if not self.issues:
            return "✓ No code quality issues found!"
        
        # 按严重程度分组
        errors = [i for i in self.issues if i.severity == 'error']
        warnings = [i for i in self.issues if i.severity == 'warning']
        infos = [i for i in self.issues if i.severity == 'info']
        
        output = []
        
        if errors:
            output.append(f"\n❌ ERRORS ({len(errors)}):")
            for issue in errors:
                output.append(f"  {issue.file}:{issue.line} - {issue.message}")
        
        if warnings:
            output.append(f"\n⚠️  WARNINGS ({len(warnings)}):")
            for issue in warnings:
                output.append(f"  {issue.file}:{issue.line} - {issue.message}")
        
        if infos:
            output.append(f"\nℹ️  INFO ({len(infos)}):")
            for issue in infos:
                output.append(f"  {issue.file}:{issue.line} - {issue.message}")
        
        return '\n'.join(output)


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python code_quality_checker.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    checker = CodeQualityChecker()
    issues = checker.check_file(file_path)
    
    print(checker.format_issues())
    
    # 如果有错误，返回非零退出码
    if any(i.severity == 'error' for i in issues):
        sys.exit(1)


if __name__ == '__main__':
    main()
