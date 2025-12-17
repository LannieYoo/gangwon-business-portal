"""Add nice_dnb_company_info table"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "c9a6c5f8c0c1"
down_revision = "fb6b4ef9db06"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "nice_dnb_company_info",
        sa.Column("biz_no", sa.String(length=20), nullable=False),
        sa.Column("corp_no", sa.String(length=30), nullable=True),
        sa.Column("cmp_nm", sa.String(length=255), nullable=True),
        sa.Column("cmp_enm", sa.String(length=255), nullable=True),
        sa.Column("ceo_nm", sa.String(length=255), nullable=True),
        sa.Column("emp_cnt", sa.Integer(), nullable=True),
        sa.Column("emp_acc_ym", sa.String(length=6), nullable=True),
        sa.Column("ind_cd1", sa.String(length=20), nullable=True),
        sa.Column("ind_nm", sa.String(length=255), nullable=True),
        sa.Column("cmp_scl_nm", sa.String(length=100), nullable=True),
        sa.Column("cmp_typ_nm", sa.String(length=100), nullable=True),
        sa.Column("bzcnd_nm", sa.Text(), nullable=True),
        sa.Column("estb_date", sa.String(length=8), nullable=True),
        sa.Column("eml_adr", sa.String(length=255), nullable=True),
        sa.Column("tel_no", sa.String(length=50), nullable=True),
        sa.Column("fax_tel_no", sa.String(length=50), nullable=True),
        sa.Column("zip", sa.String(length=20), nullable=True),
        sa.Column("addr1", sa.String(length=255), nullable=True),
        sa.Column("addr2", sa.String(length=255), nullable=True),
        sa.Column("stt", sa.String(length=50), nullable=True),
        sa.Column("stt_ymd", sa.String(length=8), nullable=True),
        sa.Column("up_ymd", sa.String(length=8), nullable=True),
        sa.Column("cri_grd", sa.String(length=10), nullable=True),
        sa.Column("cr_date", sa.String(length=8), nullable=True),
        sa.Column("stt_date", sa.String(length=8), nullable=True),
        sa.Column("sales_amt", sa.Numeric(20, 2), nullable=True),
        sa.Column("opr_ic_amt", sa.Numeric(20, 2), nullable=True),
        sa.Column("sh_eq_amt", sa.Numeric(20, 2), nullable=True),
        sa.Column("debt_amt", sa.Numeric(20, 2), nullable=True),
        sa.Column("asset_amt", sa.Numeric(20, 2), nullable=True),
        sa.Column("res_cd", sa.String(length=10), nullable=True),
        sa.Column("msg_guid", sa.String(length=64), nullable=True),
        sa.Column("msg_req_dttm", sa.String(length=20), nullable=True),
        sa.Column("msg_res_dttm", sa.String(length=20), nullable=True),
        sa.Column("raw_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("biz_no"),
    )


def downgrade() -> None:
    op.drop_table("nice_dnb_company_info")

