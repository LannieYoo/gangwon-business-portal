# 编码规范 (Coding Standard)

基于接口驱动和数据完整性的编码约束。

---

## 命名前缀

| 类型 | 前缀 | 示例 |
|------|------|------|
| 接口 | `I` | `IUserService` |
| 数据契约 | `D` | `DUserContext` |
| 枚举 | `E` | `EUserRole` |
| 抽象类 | `Abstract` | `AbstractClassifier` |

---

## 禁用项

### 函数和方法
- 模块级函数 → 使用接口+类方法
- 私有方法（_前缀） → 使用接口定义
- @staticmethod/@classmethod → 使用实例方法
- *args/**kwargs → 明确定义参数

### 控制流和类型
- if/match/三元表达式 → 数据已完整
- Optional/None → 所有值必须存在
- isinstance()/hasattr() → 数据结构统一
- Any 类型 → 使用具体类型

### 数据转换
- 内联字典/字典字面量 → dataclass 的 from_*/to_* 方法
- 手动序列化 → dataclass 的 to_json() 方法
- 返回字典 → DTO 的 from_result() 方法

### 类设计
- 私有成员/类变量/常量 → 使用枚举或接口
- 通用变量名（data/result/value） → 使用具体名称

### 导入和依赖
- 跨层导入 → 遵循模块分层
- 方法内实例化 → 通过 __init__ 注入
- 模块级状态 → 通过 __init__ 注入

### 异常处理
- 裸 except → 捕获具体异常
- 具体实现类 → 使用接口类型

---

## 检查清单

- [ ] 无独立函数/私有方法/静态方法
- [ ] 无 if/Optional/fallback 逻辑
- [ ] 无手动数据转换/类变量
- [ ] 无跨层导入/模块级状态
- [ ] 类型注解完整
