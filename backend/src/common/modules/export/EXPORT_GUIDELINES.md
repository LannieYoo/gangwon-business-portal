# Export 模块规范

## 目录结构

```
export/
├── __init__.py    # 模块入口
└── exporter.py    # 导出服务
```

## 使用方式

```python
from src.common.modules.export import ExportService

# 导出为 Excel
excel_bytes = ExportService.export_to_excel(
    data=[
        {"name": "张三", "email": "zhang@example.com", "status": "active"},
        {"name": "李四", "email": "li@example.com", "status": "pending"}
    ],
    sheet_name="会员列表",
    headers=["name", "email", "status"],  # 可选，默认使用 dict keys
    title="会员数据导出"  # 可选，添加标题行
)

# 导出为 CSV
csv_content = ExportService.export_to_csv(
    data=[
        {"name": "张三", "email": "zhang@example.com"},
        {"name": "李四", "email": "li@example.com"}
    ],
    headers=["name", "email"]  # 可选
)
```

## 在路由中使用

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from src.common.modules.export import ExportService
import io

router = APIRouter()

@router.get("/members/export")
async def export_members():
    # 获取数据
    members = await get_members_data()
    
    # 导出 Excel
    excel_bytes = ExportService.export_to_excel(
        data=members,
        sheet_name="회원목록",
        title="회원 데이터 내보내기"
    )
    
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=members.xlsx"
        }
    )

@router.get("/members/export/csv")
async def export_members_csv():
    members = await get_members_data()
    
    csv_content = ExportService.export_to_csv(data=members)
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=members.csv"
        }
    )
```

## Excel 导出特性

- 自动调整列宽（最大 50 字符）
- 标题行样式：深蓝背景、白色粗体
- 表头样式：浅蓝背景、粗体
- 自动格式化 `datetime` 对象
- `None` 值转换为空字符串
- 支持文本换行

## CSV 导出特性

- UTF-8 编码
- 自动格式化 `datetime` 对象
- `None` 值转换为空字符串
- 忽略 headers 中不存在的字段

## 数据格式要求

```python
# 输入数据格式
data = [
    {
        "column1": "value1",
        "column2": 123,
        "column3": datetime.now(),
        "column4": None
    },
    # ...
]

# headers 可选，指定导出列和顺序
headers = ["column1", "column2", "column3"]
```

## 注意事项

1. 方法为静态方法，无需实例化
2. 空数据返回空文件/空字符串
3. 导出失败会抛出异常并记录日志
4. Excel 使用 openpyxl 库
5. 大数据量导出建议分批处理
