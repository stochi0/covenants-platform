from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)

    # Plan.md expects these fields for location aggregations.
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    lat: Mapped[float | None] = mapped_column(Numeric(10, 6), nullable=True)
    lon: Mapped[float | None] = mapped_column(Numeric(10, 6), nullable=True)
    state: Mapped[str | None] = mapped_column(Text, nullable=True)

    city: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(Text, nullable=True)

    company_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    turnover: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    no_of_facilities: Mapped[int | None] = mapped_column(Integer, nullable=True)
    manpower: Mapped[int | None] = mapped_column(Integer, nullable=True)
    contract_manpower: Mapped[int | None] = mapped_column(Integer, nullable=True)
    phd_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    msc_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chemical_engineers: Mapped[int | None] = mapped_column(Integer, nullable=True)
    no_of_products: Mapped[int | None] = mapped_column(Integer, nullable=True)
    under_dev_products: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fei: Mapped[str | None] = mapped_column(String(100), nullable=True)
    duns: Mapped[str | None] = mapped_column(String(100), nullable=True)
    customer_audit: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    ssr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    glr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ssr_capacity: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    glr_capacity: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    certifications: Mapped[list["CompanyCertification"]] = relationship(back_populates="company")
    processes: Mapped[list["CompanyProcess"]] = relationship(back_populates="company")
    equipment: Mapped[list["CompanyEquipment"]] = relationship(back_populates="company")
    analytics: Mapped[list["CompanyAnalytics"]] = relationship(back_populates="company")
    services: Mapped[list["CompanyService"]] = relationship(back_populates="company")
    products: Mapped[list["CompanyProduct"]] = relationship(back_populates="company")

    __table_args__ = (
        Index("idx_companies_city", "city"),
        Index("idx_companies_country", "country"),
        Index("idx_companies_state", "state"),
    )


class CertificationType(Base):
    __tablename__ = "certification_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)


class CompanyCertification(Base):
    __tablename__ = "company_certifications"

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    certification_type_id: Mapped[int] = mapped_column(
        ForeignKey("certification_types.id", ondelete="CASCADE"), primary_key=True
    )

    has_cert: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    cert_number: Mapped[str | None] = mapped_column(String(200), nullable=True)
    cert_issued_by: Mapped[str | None] = mapped_column(Text, nullable=True)
    cert_valid_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    cert_valid_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped["Company"] = relationship(back_populates="certifications")
    certification_type: Mapped["CertificationType"] = relationship()

    __table_args__ = (Index("idx_company_cert_company", "company_id"),)


class ProcessType(Base):
    __tablename__ = "process_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)


class CompanyProcess(Base):
    __tablename__ = "company_processes"

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    process_type_id: Mapped[int] = mapped_column(
        ForeignKey("process_types.id", ondelete="CASCADE"), primary_key=True
    )

    available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    capability_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    max_scale_kg: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped["Company"] = relationship(back_populates="processes")
    process_type: Mapped["ProcessType"] = relationship()

    __table_args__ = (Index("idx_company_proc_company", "company_id"),)


class EquipmentType(Base):
    __tablename__ = "equipment_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)


class CompanyEquipment(Base):
    __tablename__ = "company_equipment"

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    equipment_type_id: Mapped[int] = mapped_column(
        ForeignKey("equipment_types.id", ondelete="CASCADE"), primary_key=True
    )

    count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    capacity: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped["Company"] = relationship(back_populates="equipment")
    equipment_type: Mapped["EquipmentType"] = relationship()


class AnalyticsType(Base):
    __tablename__ = "analytics_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)


class CompanyAnalytics(Base):
    __tablename__ = "company_analytics"

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    analytics_type_id: Mapped[int] = mapped_column(
        ForeignKey("analytics_types.id", ondelete="CASCADE"), primary_key=True
    )

    available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    instrument_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    model_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped["Company"] = relationship(back_populates="analytics")
    analytics_type: Mapped["AnalyticsType"] = relationship()


class ServiceType(Base):
    __tablename__ = "service_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)


class CompanyService(Base):
    __tablename__ = "company_services"

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    service_type_id: Mapped[int] = mapped_column(
        ForeignKey("service_types.id", ondelete="CASCADE"), primary_key=True
    )

    offered: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped["Company"] = relationship(back_populates="services")
    service_type: Mapped["ServiceType"] = relationship()


class CompanyProduct(Base):
    __tablename__ = "company_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)

    product_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    product_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    stage: Mapped[str | None] = mapped_column(String(50), nullable=True)
    price_per_unit: Mapped[float | None] = mapped_column(Numeric(18, 4), nullable=True)
    units: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped["Company"] = relationship(back_populates="products")

    __table_args__ = (
        Index("idx_company_products_company_id", "company_id"),
        UniqueConstraint("company_id", "product_name", name="uq_company_product_name_per_company"),
    )


