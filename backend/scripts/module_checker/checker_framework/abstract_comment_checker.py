"""注释检查抽象类。"""
import ast
import re
from typing import List

from .i_comment_checker import ICommentChecker


class AbstractCommentChecker(ICommentChecker):
    """注释检查抽象类。"""

    def check_docstring_format(self, tree: ast.AST, file_path: str):
        """检查 docstring 格式（一句话说明）。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                if node.name.startswith('_'):  # 内部方法可省略
                    continue
                    
                docstring = ast.get_docstring(node)
                if docstring:
                    self._check_single_sentence_docstring(docstring, node, file_path)

    def check_no_requirements_reference(self, tree: ast.AST, file_path: str):
        """检查禁止 Requirements 引用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                if self._contains_requirements_reference(node.value):
                    self.add_violation(
                        file_path, node.lineno,
                        "禁止在注释中引用 Requirements，应直接说明功能",
                    )

    def check_no_type_duplication_in_docstring(self, tree: ast.AST, file_path: str):
        """检查禁止在 docstring 中重复类型说明。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                docstring = ast.get_docstring(node)
                if docstring and self._has_type_duplication(node, docstring):
                    self.add_violation(
                        file_path, node.lineno,
                        f"方法 {node.name} 的 docstring 重复了类型注解信息，应只说明功能",
                    )

    def check_no_grouping_comments(self, tree: ast.AST, file_path: str):
        """检查禁止分组注释。"""
        # 获取源代码来检查注释
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines, 1):
                stripped = line.strip()
                if self._is_grouping_comment(stripped):
                    self.add_violation(
                        file_path, i,
                        f"禁止分组注释 '{stripped}'，应通过代码结构体现分组",
                    )
        except Exception:
            pass  # 文件读取失败时跳过

    def check_inline_comment_necessity(self, tree: ast.AST, file_path: str):
        """检查行内注释是否必要（只解释非显而易见的逻辑）。"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines, 1):
                if '#' in line and not line.strip().startswith('#'):
                    comment = line.split('#', 1)[1].strip()
                    if self._is_obvious_comment(line, comment):
                        self.add_violation(
                            file_path, i,
                            f"行内注释过于显而易见: '{comment}'，应删除或说明非显而易见的逻辑",
                        )
        except Exception:
            pass  # 文件读取失败时跳过

    def _check_single_sentence_docstring(self, docstring: str, node: ast.AST, file_path: str):
        """检查 docstring 是否为一句话说明。"""
        # 移除多余空白和换行
        cleaned = ' '.join(docstring.strip().split())
        
        # 检查是否超过一句话（简单检查：多个句号、问号、感叹号）
        sentence_endings = cleaned.count('.') + cleaned.count('!') + cleaned.count('?')
        if sentence_endings > 1:
            self.add_violation(
                file_path, node.lineno,
                f"Docstring 应为一句话说明，当前包含 {sentence_endings} 个句子",
            )
        
        # 检查是否过长（超过100字符可能不是一句话说明）
        if len(cleaned) > 100:
            self.add_violation(
                file_path, node.lineno,
                f"Docstring 过长 ({len(cleaned)} 字符)，应为简洁的一句话说明",
            )

    def _contains_requirements_reference(self, text: str) -> bool:
        """检查是否包含 Requirements 引用。"""
        patterns = [
            r'REQ[-_]?\d+',
            r'requirement\s*\d+',
            r'需求\s*\d+',
            r'根据需求',
            r'按照需求',
        ]
        
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    def _has_type_duplication(self, func_node: ast.FunctionDef, docstring: str) -> bool:
        """检查 docstring 是否重复了类型注解信息。"""
        # 获取参数类型
        param_types = []
        for arg in func_node.args.args:
            if arg.annotation:
                if isinstance(arg.annotation, ast.Name):
                    param_types.append(arg.annotation.id)
                elif isinstance(arg.annotation, ast.Constant):
                    param_types.append(str(arg.annotation.value))
        
        # 获取返回类型
        return_type = None
        if func_node.returns:
            if isinstance(func_node.returns, ast.Name):
                return_type = func_node.returns.id
            elif isinstance(func_node.returns, ast.Constant):
                return_type = str(func_node.returns.value)
        
        # 检查 docstring 是否包含这些类型信息
        docstring_lower = docstring.lower()
        for param_type in param_types:
            if param_type.lower() in docstring_lower:
                return True
        
        if return_type and return_type.lower() in docstring_lower:
            return True
        
        return False

    def _is_grouping_comment(self, comment: str) -> bool:
        """检查是否为分组注释。"""
        grouping_patterns = [
            r'^#+\s*(开始|结束|start|end)\s*#+$',
            r'^#+\s*=+\s*#+$',
            r'^#+\s*-+\s*#+$',
            r'^#+.*分组.*#+$',
            r'^#+.*section.*#+$',
            r'^#+.*区域.*#+$',
            r'^#+.*部分.*#+$',
        ]
        
        for pattern in grouping_patterns:
            if re.match(pattern, comment, re.IGNORECASE):
                return True
        
        # 检查重复字符的分隔线
        if len(comment) > 10 and len(set(comment.replace('#', '').replace(' ', ''))) <= 2:
            return True
        
        return False

    def _is_obvious_comment(self, code_line: str, comment: str) -> bool:
        """检查注释是否过于显而易见。"""
        code_part = code_line.split('#')[0].strip()
        comment_lower = comment.lower()
        
        # 显而易见的注释模式
        obvious_patterns = [
            # 重复代码内容
            (r'return', r'返回|return'),
            (r'import', r'导入|import'),
            (r'def\s+\w+', r'定义|函数|方法|function|method'),
            (r'class\s+\w+', r'类|class'),
            (r'if\s+', r'如果|判断|if'),
            (r'for\s+', r'循环|遍历|for|loop'),
            (r'while\s+', r'循环|while'),
            (r'try:', r'尝试|异常|try|except'),
            (r'print\s*\(', r'打印|输出|print'),
            (r'=\s*\[', r'列表|数组|list'),
            (r'=\s*\{', r'字典|dict'),
        ]
        
        for code_pattern, comment_pattern in obvious_patterns:
            if re.search(code_pattern, code_part, re.IGNORECASE):
                if re.search(comment_pattern, comment_lower):
                    return True
        
        # 检查注释是否只是翻译了变量名
        words_in_code = re.findall(r'\b\w+\b', code_part.lower())
        words_in_comment = re.findall(r'\b\w+\b', comment_lower)
        
        # 如果注释中的词汇大部分都在代码中出现，可能是显而易见的
        if len(words_in_comment) > 0:
            overlap = len(set(words_in_code) & set(words_in_comment))
            if overlap / len(words_in_comment) > 0.7:
                return True
        
        return False