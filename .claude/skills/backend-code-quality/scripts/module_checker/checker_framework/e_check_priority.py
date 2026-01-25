"""检查优先级枚举。"""
from enum import Enum, auto


class EDataclassCheckPriority(Enum):
    """Dataclass 检查优先级。"""
    
    FILE_ORGANIZATION = auto()      # 1. 文件组织检查
    BASIC_STRUCTURE = auto()        # 2. 基础结构检查  
    DECORATORS = auto()             # 3. 装饰器检查
    NAMING = auto()                 # 4. 命名规范检查
    FACTORY_METHODS = auto()        # 5. 工厂方法检查
    COMPOSITION = auto()            # 6. 组合模式检查
    USAGE = auto()                  # 7. 使用情况检查


class EInterfaceCheckPriority(Enum):
    """接口检查优先级。"""
    
    DATACLASS_DEPENDENCY = auto()   # 1. 依赖的 dataclass 存在
    METHOD_SIGNATURE = auto()       # 2. 方法签名规范
    PARAMETER_TYPES = auto()        # 3. 参数类型检查
    RETURN_TYPES = auto()           # 4. 返回类型检查


class EModuleCheckPriority(Enum):
    """模块检查优先级。"""
    
    INTERFACE_COUNT = auto()        # 1. 接口数量检查
    FILE_ORGANIZATION = auto()      # 2. 文件组织检查
    DEPENDENCY_STRUCTURE = auto()   # 3. 依赖结构检查