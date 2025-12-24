"""Seed default legal content for terms of service and privacy policy

Revision ID: seed_legal_content_defaults
Revises: add_legal_content_table
Create Date: 2024-12-24

"""
from alembic import op
import sqlalchemy as sa
from uuid import uuid4


# revision identifiers, used by Alembic.
revision = 'seed_legal_content_defaults'
down_revision = 'add_legal_content_table'
branch_labels = None
depends_on = None

# 默认利用约款内容 (韩语)
DEFAULT_TERMS_OF_SERVICE = """
<h2>이용약관</h2>

<h3>제1조 (목적)</h3>
<p>이 약관은 강원창업포털(이하 "포털")이 제공하는 서비스의 이용조건 및 절차, 회원과 포털의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

<h3>제2조 (용어의 정의)</h3>
<p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
<ul>
<li>"서비스"란 포털이 제공하는 모든 서비스를 의미합니다.</li>
<li>"회원"이란 포털에 개인정보를 제공하여 회원등록을 한 자로서, 포털의 정보를 지속적으로 제공받으며, 포털이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
<li>"아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 포털이 승인하는 문자와 숫자의 조합을 말합니다.</li>
<li>"비밀번호"란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 말합니다.</li>
</ul>

<h3>제3조 (약관의 효력과 변경)</h3>
<p>이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다. 포털은 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 포털 내에 공지함으로써 효력을 발생합니다.</p>

<h3>제4조 (서비스의 제공 및 변경)</h3>
<p>포털은 다음과 같은 서비스를 제공합니다.</p>
<ul>
<li>창업 지원 정보 제공</li>
<li>프로젝트 신청 및 관리</li>
<li>기업 실적 관리</li>
<li>기타 포털이 정하는 서비스</li>
</ul>

<h3>제5조 (회원가입)</h3>
<p>회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 포털이 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>

<h3>제6조 (회원 탈퇴 및 자격 상실)</h3>
<p>회원은 포털에 언제든지 탈퇴를 요청할 수 있으며 포털은 즉시 회원탈퇴를 처리합니다.</p>

<h3>제7조 (회원의 의무)</h3>
<p>회원은 다음 행위를 하여서는 안 됩니다.</p>
<ul>
<li>신청 또는 변경 시 허위내용의 등록</li>
<li>타인의 정보 도용</li>
<li>포털에 게시된 정보의 변경</li>
<li>포털이 정한 정보 이외의 정보 등의 송신 또는 게시</li>
<li>포털 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
<li>포털 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
</ul>

<h3>제8조 (면책조항)</h3>
<p>포털은 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
"""

# 默认个人信息处理方针内容 (韩语)
DEFAULT_PRIVACY_POLICY = """
<h2>개인정보 처리방침</h2>

<h3>제1조 (개인정보의 처리 목적)</h3>
<p>강원창업포털(이하 "포털")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
<ul>
<li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리 등</li>
<li>서비스 제공: 창업 지원 서비스 제공, 프로젝트 신청 처리, 실적 관리 등</li>
<li>민원 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 등</li>
</ul>

<h3>제2조 (개인정보의 처리 및 보유기간)</h3>
<p>포털은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
<ul>
<li>회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
<li>서비스 제공: 서비스 공급완료 및 요금결제·정산 완료 시까지</li>
</ul>

<h3>제3조 (처리하는 개인정보의 항목)</h3>
<p>포털은 다음의 개인정보 항목을 처리하고 있습니다.</p>
<ul>
<li>필수항목: 회사명, 사업자등록번호, 대표자명, 연락처, 이메일, 주소</li>
<li>선택항목: 홈페이지, 기업소개, 주요사업 내용</li>
</ul>

<h3>제4조 (개인정보의 제3자 제공)</h3>
<p>포털은 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>

<h3>제5조 (개인정보의 파기)</h3>
<p>포털은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>

<h3>제6조 (정보주체의 권리·의무 및 행사방법)</h3>
<p>정보주체는 포털에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
<ul>
<li>개인정보 열람 요구</li>
<li>오류 등이 있을 경우 정정 요구</li>
<li>삭제 요구</li>
<li>처리정지 요구</li>
</ul>

<h3>제7조 (개인정보의 안전성 확보조치)</h3>
<p>포털은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
<ul>
<li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
<li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화</li>
<li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
</ul>

<h3>제8조 (개인정보 보호책임자)</h3>
<p>포털은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>

<h3>제9조 (개인정보 처리방침 변경)</h3>
<p>이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
"""


def upgrade() -> None:
    """Insert default legal content."""
    # Insert terms of service
    op.execute(
        f"""
        INSERT INTO legal_content (id, content_type, content_html, updated_by, updated_at, created_at)
        VALUES (
            '{str(uuid4())}',
            'terms_of_service',
            '{DEFAULT_TERMS_OF_SERVICE.replace("'", "''")}',
            NULL,
            NOW(),
            NOW()
        )
        ON CONFLICT (content_type) DO NOTHING
        """
    )
    
    # Insert privacy policy
    op.execute(
        f"""
        INSERT INTO legal_content (id, content_type, content_html, updated_by, updated_at, created_at)
        VALUES (
            '{str(uuid4())}',
            'privacy_policy',
            '{DEFAULT_PRIVACY_POLICY.replace("'", "''")}',
            NULL,
            NOW(),
            NOW()
        )
        ON CONFLICT (content_type) DO NOTHING
        """
    )


def downgrade() -> None:
    """Remove default legal content."""
    op.execute("DELETE FROM legal_content WHERE content_type IN ('terms_of_service', 'privacy_policy')")
