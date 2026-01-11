# Requirements Document

## Introduction

本文档定义了江原门户系统的 UI 修改需求。包含 12 个页面的 UI 变更、功能添加、多语言修正及 Bug 修复。

## Glossary

- **Portal_System**: 江原门户 Web 应用系统
- **Admin_Panel**: 管理员专用页面区域
- **Member_Portal**: 企业会员专用页面区域
- **Banner_Manager**: 横幅图片管理组件
- **Export_Service**: Excel/CSV 导出服务
- **KSIC_Code**: 韩国标准产业分类代码 (Korean Standard Industrial Classification)
- **HSK_Code**: 海关税则商品分类代码 (10位数字)

## Requirements

### Requirement 1: 主页 UI 修改

**User Story:** As a 用户, I want 主页的品牌形象更新为新设计, so that 能够体验一致的品牌标识。

#### Acceptance Criteria

1. WHEN 用户访问主页时, THE Portal_System SHALL 将头部 Logo 显示为 "강원창업톡" 文字
2. WHEN 主页和会员页面加载时, THE Portal_System SHALL 将菜单栏背景色设置为 #E3F2FD（淡蓝色）
3. WHEN 菜单栏显示时, THE Portal_System SHALL 将菜单文字颜色设置为 #002244（深蓝色）以确保可读性
4. THE Portal_System SHALL 将全局字体设置为 "pretendard", sans-serif
5. WHEN 菜单显示时, THE Portal_System SHALL 将"프로젝트"菜单名称显示为"사업공고"
6. WHEN 首页区块显示时, THE Portal_System SHALL 将"최신 공고"标题显示为"사업공고"
7. WHEN 首页区块显示时, THE Portal_System SHALL 将"뉴스 자료"标题显示为"신규공고"
8. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示

### Requirement 2: 企业信息页面 - 添加法人代表信息

**User Story:** As a 企业会员, I want 能够输入法人代表的出生年月和性别, so that 可以登记详细的企业信息。

#### Acceptance Criteria

1. WHEN 企业信息页面加载时, THE Portal_System SHALL 在法人代表姓名输入项下方显示出生年月输入字段
2. WHEN 点击出生年月字段时, THE Portal_System SHALL 显示日历选择器(Date Picker)以便选择日期
3. WHEN 选择出生年月后, THE Portal_System SHALL 以 YYYY/MM/DD 格式显示
4. WHEN 企业信息页面加载时, THE Portal_System SHALL 在法人代表姓名输入项下方显示性别选择字段
5. WHEN 性别字段显示时, THE Portal_System SHALL 以单选按钮或下拉框形式提供男/女选项
6. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示

### Requirement 3: 企业信息页面 - 添加所在地下拉框

**User Story:** As a 企业会员, I want 能够从下拉框中选择所在地, so that 可以方便地输入准确的地区信息。

#### Acceptance Criteria

1. WHEN 企业信息页面加载时, THE Portal_System SHALL 以下拉选择形式提供所在地选项
2. WHEN 所在地下拉框显示时, THE Portal_System SHALL 包含春川市、原州市、江陵市、东海市、太白市、束草市、三陟市、洪川郡、横城郡、宁越郡、平昌郡、旌善郡、铁原郡、华川郡、杨口郡、麟蹄郡、襄阳郡、其他地区选项
3. WHEN 选择所在地后, THE Portal_System SHALL 保存选中的值
4. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示

### Requirement 4: 业绩录入页面 - 添加 HSK 代码和出口国家

**User Story:** As a 企业会员, I want 能够输入出口相关的 HSK 代码和出口国家, so that 可以详细记录出口业绩。

#### Acceptance Criteria

1. WHEN 业绩录入页面的销售/雇佣标签页加载时, THE Portal_System SHALL 在出口额(韩元)区域显示 HSK 代码输入字段
2. WHEN 在 HSK 代码字段输入时, THE Portal_System SHALL 仅允许输入数字
3. WHEN HSK 代码不是10位数字时, THE Portal_System SHALL 显示错误或禁止保存
4. WHEN HSK 代码字段显示时, THE Portal_System SHALL 显示 https://cls.kipro.or.kr/hsk 参考链接
5. WHEN 业绩录入页面的销售/雇佣标签页加载时, THE Portal_System SHALL 显示2个出口国家输入字段(国家1、国家2)
6. WHEN 执行保存/临时保存时, THE Portal_System SHALL 确保现有功能正常运行不受影响
7. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示

### Requirement 5: 业务信息页面 - 创业类型和产业分类代码变更

**User Story:** As a 企业会员, I want 能够准确选择创业类型和产业分类代码, so that 可以登记标准化的业务信息。

#### Acceptance Criteria

1. WHEN 业务信息页面加载时, THE Portal_System SHALL 以下拉框形式显示创业类型
2. WHEN 创业类型下拉框显示时, THE Portal_System SHALL 提供预备、创业3年以下、跃升7年以上、再创业选项
3. WHEN 业务信息页面加载时, THE Portal_System SHALL 将"업종"项目名称显示为"한국표준산업분류코드[대분류]"
4. WHEN 大分类下拉框显示时, THE Portal_System SHALL 提供 A~U 大分类代码列表
5. WHEN 业务信息页面加载时, THE Portal_System SHALL 将"사업분야"项目名称显示为"지역주력산업코드[중분류]"
6. WHEN 选择大分类后, THE Portal_System SHALL 根据所选大分类筛选并显示对应的中分类列表
7. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示

### Requirement 6: 企业信息底部 - 添加产业合作/参与项目/投资引进

**User Story:** As a 企业会员, I want 能够输入产业合作意向领域、参与项目、投资引进信息, so that 可以管理企业的合作及投资状况。

#### Acceptance Criteria

1. WHEN 企业信息页面底部加载时, THE Portal_System SHALL 显示产业合作意向领域区块
2. WHEN 产业合作意向领域显示时, THE Portal_System SHALL 提供技术合作、市场拓展、人才培养复选框
3. WHEN 企业信息页面底部加载时, THE Portal_System SHALL 显示参与项目区块
4. WHEN 参与项目显示时, THE Portal_System SHALL 提供创业中心大学、全球事业、RISE事业、无 复选框并支持多选
5. WHEN 企业信息页面底部加载时, THE Portal_System SHALL 显示投资引进区块
6. WHEN 投资引进区块显示时, THE Portal_System SHALL 提供无选项、投资额(百万韩元)输入、投资机构输入字段
7. WHEN 选择"无"时, THE Portal_System SHALL 禁用投资额/投资机构输入或清空其值
8. WHEN 保存后重新进入时, THE Portal_System SHALL 保持并显示已输入的值
9. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示


### Requirement 7: 业务管理页面 - 申请记录查询和搜索功能

**User Story:** As a 企业会员, I want 能够查询项目申请记录并通过关键词搜索, so that 可以方便地确认申请状态。

#### Acceptance Criteria

1. WHEN 业务管理页面加载时, THE Portal_System SHALL 在顶部显示可跳转到申请记录的菜单
2. WHEN 点击申请记录菜单时, THE Portal_System SHALL 跳转到申请记录查询页面
3. WHEN 申请记录页面加载时, THE Portal_System SHALL 显示包含项目名称、申请日期、进度状态、处理日期、操作按钮的列表
4. WHEN 没有申请记录时, THE Portal_System SHALL 显示空状态提示文字
5. WHEN 点击搜索按钮时, THE Portal_System SHALL 根据输入的关键词筛选列表
6. WHEN 按下 Enter 键时, THE Portal_System SHALL 执行搜索
7. WHEN 删除搜索词时, THE Portal_System SHALL 恢复显示全部列表
8. THE Portal_System SHALL 在 PC 和移动端无布局错乱地显示
9. WHEN 申请状态为待审核或审核中时, THE Portal_System SHALL 显示"撤销申请"按钮
10. WHEN 点击"撤销申请"按钮时, THE Portal_System SHALL 显示确认弹窗并在确认后取消该申请
11. WHEN 申请状态为已拒绝时, THE Portal_System SHALL 显示"查看原因"按钮
12. WHEN 点击"查看原因"按钮时, THE Portal_System SHALL 显示拒绝原因弹窗
13. THE Portal_System SHALL 不显示"查看进度"按钮
14. THE Portal_System SHALL 将申请记录相关的国际化文本存放在 projects 模块的 locales 文件中

### Requirement 8: 项目申请弹窗 - 字数显示中文化

**User Story:** As a 企业会员, I want 申请理由输入框的字数显示为韩语, so that 能够体验一致的韩语 UI。

#### Acceptance Criteria

1. WHEN 项目申请弹窗显示时, THE Portal_System SHALL 以"24/10 글자"或"24/10 자"格式用韩语显示字数
2. THE Portal_System SHALL 不再显示中文"字符"文字

### Requirement 9: 管理员项目详情 - 按钮文字韩语化

**User Story:** As a 管理员, I want 项目详情页面的按钮显示为韩语, so that 能够体验一致的韩语 UI。

#### Acceptance Criteria

1. WHEN 项目详情页面加载时, THE Admin_Panel SHALL 将"返回"按钮显示为"뒤로가기"
2. WHEN 项目详情页面加载时, THE Admin_Panel SHALL 将"申请列表"按钮显示为"신청 목록"
3. WHEN 项目详情页面加载时, THE Admin_Panel SHALL 将"批准"按钮显示为"승인"
4. WHEN 项目详情页面加载时, THE Admin_Panel SHALL 将"拒绝"按钮显示为"거절"

### Requirement 10: 管理员企业会员详情 - 文字韩语化

**User Story:** As a 管理员, I want 企业会员详情页面的文字显示为韩语, so that 能够体验一致的韩语 UI。

#### Acceptance Criteria

1. WHEN 企业会员详情页面加载时, THE Admin_Panel SHALL 将"待审核"状态显示为"승인 대기"
2. WHEN 显示员工人数时, THE Admin_Panel SHALL 将"人"单位显示为"명"
3. WHEN 财务数据区块显示时, THE Admin_Panel SHALL 将"财务历史数据"标题显示为"재무 이력 데이터"

### Requirement 11: 管理员登录页面 - 链接修复

**User Story:** As a 管理员, I want 登录页面的链接正常工作, so that 可以跳转到找回密码和会员登录页面。

#### Acceptance Criteria

1. WHEN 点击"忘记密码？"链接时, THE Admin_Panel SHALL 跳转到密码重置或引导页面
2. WHEN 点击"跳转到会员登录"链接时, THE Admin_Panel SHALL 正常跳转到会员登录页面
3. THE Admin_Panel SHALL 不显示 404 页面

### Requirement 12: 管理员导出功能修复

**User Story:** As a 管理员, I want Excel/CSV 导出功能正常工作, so that 可以下载正确格式的数据文件。

#### Acceptance Criteria

1. WHEN 在企业会员管理中点击 Excel 导出时, THE Export_Service SHALL 下载 .xlsx 文件
2. WHEN 在企业会员管理中点击 CSV 导出时, THE Export_Service SHALL 下载 .csv 文件
3. WHEN 在业绩管理中点击 Excel 导出时, THE Export_Service SHALL 下载 .xlsx 文件
4. WHEN 在业绩管理中点击 CSV 导出时, THE Export_Service SHALL 下载 .csv 文件
5. WHEN 在项目管理中点击 Excel 导出时, THE Export_Service SHALL 下载 .xlsx 文件
6. WHEN 在项目管理中点击 CSV 导出时, THE Export_Service SHALL 下载 .csv 文件
7. THE Export_Service SHALL 正确设置 Content-Type、文件名和编码

### Requirement 13: 内容管理 - 添加移动端横幅图片

**User Story:** As a 管理员, I want 能够为横幅单独上传移动端图片, so that 可以在移动环境下提供优化的横幅展示。

#### Acceptance Criteria

1. WHEN 内容管理横幅标签页加载时, THE Banner_Manager SHALL 为每个横幅项显示桌面端图片和移动端图片上传字段
2. WHEN 桌面端图片上传区域显示时, THE Banner_Manager SHALL 显示"推荐: 1920 x 600 (16:5), 最小: 1440 x 450"提示
3. WHEN 移动端图片上传区域显示时, THE Banner_Manager SHALL 显示"推荐: 1080 x 1350 (4:5), 最小: 750 x 938"提示
4. WHEN 屏幕宽度小于等于 1024px 且存在移动端图片时, THE Portal_System SHALL 显示移动端图片
5. WHEN 没有移动端图片时, THE Portal_System SHALL 在所有屏幕上显示桌面端图片
6. THE Portal_System SHALL 使用 object-fit: cover 显示图片以防止变形
7. THE Portal_System SHALL 在 PC、平板、移动端上图片不出现破损或变形
