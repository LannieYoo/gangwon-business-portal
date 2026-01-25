"""
Security Scanner
扫描代码中的安全问题：硬编码密钥、SQL 注入风险等
"""

import re
import sys
from pathlib import Path
from typing import List, Dict, Set
from dataclasses import dataclass


@dataclass
class SecurityIssue:
    """安全问题"""
    severity: str  # 'critical', 'high', 'medium', 'low'
    file: str
    line: int
    message: str
    code_snippet: str
    rule: str


class SecurityScanner:
    """安全扫描器"""
    
    # 密钥模式
    SECRET_PATTERNS = [
        (r'sk-[a-zA-Z0-9]{20,}', 'OpenAI API Key'),
        (r'sk-proj-[a-zA-Z0-9]{20,}', 'OpenAI Project API Key'),
        (r'ghp_[a-zA-Z0-9]{36}', 'GitHub Personal Access Token'),
        (r'gho_[a-zA-Z0-9]{36}', 'GitHub OAuth Token'),
        (r'AKIA[0-9A-Z]{16}', 'AWS Access Key'),
        (r'AIza[0-9A-Za-z\\-_]{35}', 'Google API Key'),
        (r'ya29\\.[0-9A-Za-z\\-_]+', 'Google OAuth Token'),
        (r'[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com', 'Google OAuth Client ID'),
        (r'postgres://[^:]+:[^@]+@', 'PostgreSQL Connection String with Password'),
        (r'mysql://[^:]+:[^@]+@', 'MySQL Connection String with Password'),
    ]
    
    # SQL 注入模式
    SQL_INJECTION_PATTERNS = [
        (r'execute\s*\(\s*f["\']', 'SQL query with f-string'),
        (r'execute\s*\(\s*["\'].*\{', 'SQL query with string formatting'),
        (r'execute\s*\(\s*.*\s*\+\s*', 'SQL query with string concatenation'),
        (r'cursor\.execute\s*\(\s*["\'].*%s.*["\'].*%', 'Potential SQL injection'),
    ]
    
    # 危险函数
    DANGEROUS_FUNCTIONS = [
        ('eval(', 'Use of eval() is dangerous'),
        ('exec(', 'Use of exec() is dangerous'),
        ('pickle.loads(', 'Unsafe deserialization with pickle'),
        ('yaml.load(', 'Unsafe YAML loading (use yaml.safe_load)'),
        ('subprocess.call(shell=True', 'Shell injection risk'),
        ('os.system(', 'Command injection risk'),
    ]
    
    def __init__(self):
        self.issues: List[SecurityIssue] = []
    
    def scan_file(self, file_path: str) -> List[SecurityIssue]:
        """扫描单个文件"""
        self.issues = []
        path = Path(file_path)
        
        if not path.exists():
            return self.issues
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                self._check_line(file_path, line_num, line)
        
        except Exception as e:
            print(f"Error scanning {file_path}: {e}", file=sys.stderr)
        
        return self.issues
    
    def _check_line(self, file_path: str, line_num: int, line: str):
        """检查单行代码"""
        # 跳过注释
        if line.strip().startswith('#'):
            return
        
        # 检查硬编码密钥
        self._check_secrets(file_path, line_num, line)
        
        # 检查 SQL 注入
        self._check_sql_injection(file_path, line_num, line)
        
        # 检查危险函数
        self._check_dangerous_functions(file_path, line_num, line)
        
        # 检查其他安全问题
        self._check_other_issues(file_path, line_num, line)
    
    def _check_secrets(self, file_path: str, line_num: int, line: str):
        """检查硬编码密钥"""
        for pattern, description in self.SECRET_PATTERNS:
            if re.search(pattern, line):
                self.issues.append(SecurityIssue(
                    severity='critical',
                    file=file_path,
                    line=line_num,
                    message=f"Hardcoded secret detected: {description}",
                    code_snippet=line.strip(),
                    rule='hardcoded_secret'
                ))
    
    def _check_sql_injection(self, file_path: str, line_num: int, line: str):
        """检查 SQL 注入风险"""
        for pattern, description in self.SQL_INJECTION_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(SecurityIssue(
                    severity='critical',
                    file=file_path,
                    line=line_num,
                    message=f"SQL injection risk: {description}",
                    code_snippet=line.strip(),
                    rule='sql_injection'
                ))
    
    def _check_dangerous_functions(self, file_path: str, line_num: int, line: str):
        """检查危险函数"""
        for func, description in self.DANGEROUS_FUNCTIONS:
            if func in line:
                self.issues.append(SecurityIssue(
                    severity='high',
                    file=file_path,
                    line=line_num,
                    message=description,
                    code_snippet=line.strip(),
                    rule='dangerous_function'
                ))
    
    def _check_other_issues(self, file_path: str, line_num: int, line: str):
        """检查其他安全问题"""
        # 检查不安全的随机数生成
        if 'random.random()' in line or 'random.randint(' in line:
            if 'token' in line.lower() or 'password' in line.lower() or 'secret' in line.lower():
                self.issues.append(SecurityIssue(
                    severity='high',
                    file=file_path,
                    line=line_num,
                    message="Use secrets.token_hex() or secrets.token_urlsafe() for cryptographic randomness",
                    code_snippet=line.strip(),
                    rule='weak_random'
                ))
        
        # 检查不安全的哈希算法
        if re.search(r'hashlib\.(md5|sha1)\(', line):
            self.issues.append(SecurityIssue(
                severity='medium',
                file=file_path,
                line=line_num,
                message="MD5/SHA1 are cryptographically broken. Use SHA256 or better.",
                code_snippet=line.strip(),
                rule='weak_hash'
            ))
        
        # 检查调试模式
        if re.search(r'debug\s*=\s*True', line, re.IGNORECASE):
            self.issues.append(SecurityIssue(
                severity='medium',
                file=file_path,
                line=line_num,
                message="Debug mode enabled. Disable in production.",
                code_snippet=line.strip(),
                rule='debug_mode'
            ))
    
    def format_issues(self) -> str:
        """格式化问题报告"""
        if not self.issues:
            return "✓ No security issues found!"
        
        # 按严重程度分组
        critical = [i for i in self.issues if i.severity == 'critical']
        high = [i for i in self.issues if i.severity == 'high']
        medium = [i for i in self.issues if i.severity == 'medium']
        low = [i for i in self.issues if i.severity == 'low']
        
        output = []
        
        if critical:
            output.append(f"\n🚨 CRITICAL ({len(critical)}) - FIX IMMEDIATELY:")
            for issue in critical:
                output.append(f"  {issue.file}:{issue.line}")
                output.append(f"    {issue.message}")
                output.append(f"    Code: {issue.code_snippet}")
        
        if high:
            output.append(f"\n⚠️  HIGH ({len(high)}) - FIX SOON:")
            for issue in high:
                output.append(f"  {issue.file}:{issue.line}")
                output.append(f"    {issue.message}")
                output.append(f"    Code: {issue.code_snippet}")
        
        if medium:
            output.append(f"\n⚡ MEDIUM ({len(medium)}):")
            for issue in medium:
                output.append(f"  {issue.file}:{issue.line} - {issue.message}")
        
        if low:
            output.append(f"\nℹ️  LOW ({len(low)}):")
            for issue in low:
                output.append(f"  {issue.file}:{issue.line} - {issue.message}")
        
        return '\n'.join(output)


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python security_scanner.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    scanner = SecurityScanner()
    issues = scanner.scan_file(file_path)
    
    print(scanner.format_issues())
    
    # 如果有 critical 或 high 问题，返回非零退出码
    if any(i.severity in ('critical', 'high') for i in issues):
        sys.exit(1)


if __name__ == '__main__':
    main()
