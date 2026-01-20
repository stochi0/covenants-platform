from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import (
    AnalyticsType,
    CertificationType,
    Company,
    CompanyAnalytics,
    CompanyCertification,
    CompanyEquipment,
    CompanyProcess,
    CompanyProduct,
    CompanyService,
    EquipmentType,
    ProcessType,
    ServiceType,
)


def seed_dummy_data(db: Session) -> None:
    """
    Seeds a small, deterministic dataset into *all* tables in database_schema.md.
    Intended for local/dev/demo usage.
    """

    # --- lookup tables ---
    cert_types = [
        ("USFDA", "US FDA"),
        ("EDQM", "EDQM"),
        ("WHO_GMP", "WHO GMP"),
        ("ISO9001", "ISO 9001"),
        ("GLP", "GLP"),
    ]
    process_types = [
        ("HYDROGENATION", "Hydrogenation"),
        ("NITRATION", "Nitration"),
        ("ACYLATION", "Acylation"),
        ("OXIDATION", "Oxidation"),
        ("REDUCTION", "Reduction"),
    ]
    equipment_types = [
        ("SPRAY_DRYER", "Spray dryer", "Drying equipment"),
        ("FBD", "Fluid Bed Dryer (FBD)", "Drying equipment"),
        ("MICRONIZER", "Micronizer", "Particle size reduction"),
        ("DISTILLATION_COLUMN", "Distillation columns", "Solvent recovery / distillation"),
        ("KILO_LAB", "Kilo lab", "Scale-up lab"),
    ]
    analytics_types = [
        ("HPLC", "HPLC"),
        ("GC", "GC"),
        ("NMR", "NMR"),
        ("LCMS", "LCMS"),
        ("STABILITY_CHAMBER", "Stability chamber"),
    ]
    service_types = [
        ("METHOD_DEVELOPMENT", "Method Development"),
        ("IMPURITY_SYNTHESIS", "Impurity Synthesis"),
        ("CHARACTERIZATION", "Characterization Studies"),
        ("STABILITY_STUDIES", "Stability Studies"),
        ("PATENT_CHECK", "Patent Check"),
    ]

    cert_rows = [CertificationType(code=code, name=name) for code, name in cert_types]
    proc_rows = [ProcessType(code=code, name=name) for code, name in process_types]
    equip_rows = [EquipmentType(code=code, name=name, comment=comment) for code, name, comment in equipment_types]
    analy_rows = [AnalyticsType(code=code, name=name) for code, name in analytics_types]
    serv_rows = [ServiceType(code=code, name=name) for code, name in service_types]

    db.add_all(cert_rows + proc_rows + equip_rows + analy_rows + serv_rows)
    db.flush()  # get ids

    cert_by_code = {c.code: c for c in cert_rows}
    proc_by_code = {p.code: p for p in proc_rows}
    equip_by_code = {e.code: e for e in equip_rows}
    analy_by_code = {a.code: a for a in analy_rows}
    serv_by_code = {s.code: s for s in serv_rows}

    # --- companies ---
    companies = [
        Company(
            name="Acme Pharma CDMO",
            location="Bangalore, Karnataka, India",
            city="Bangalore",
            state="Karnataka",
            country="India",
            lat=12.9716,
            lon=77.5946,
            company_type="CDMO",
            turnover=12500000.00,
            no_of_facilities=2,
            manpower=420,
            phd_count=18,
            msc_count=90,
            chemical_engineers=35,
            no_of_products=22,
            under_dev_products=8,
            customer_audit=True,
            ssr="SSR-ACME-01",
            glr="GLR-ACME-02",
            ssr_capacity=1200.0,
            glr_capacity=800.0,
        ),
        Company(
            name="Nova Intermediates",
            location="Hyderabad, Telangana, India",
            city="Hyderabad",
            state="Telangana",
            country="India",
            lat=17.3850,
            lon=78.4867,
            company_type="API manufacturer",
            turnover=7200000.00,
            no_of_facilities=1,
            manpower=260,
            phd_count=6,
            msc_count=45,
            chemical_engineers=22,
            no_of_products=14,
            under_dev_products=5,
            customer_audit=False,
        ),
        Company(
            name="BluePeak Chemicals",
            location="Ahmedabad, Gujarat, India",
            city="Ahmedabad",
            state="Gujarat",
            country="India",
            # Intentionally missing lat/lon to validate non-point fallback behavior.
            lat=None,
            lon=None,
            company_type="Contract Manufacturer",
            turnover=3100000.00,
            no_of_facilities=1,
            manpower=140,
            chemical_engineers=12,
            no_of_products=9,
            under_dev_products=2,
        ),
        Company(
            name="EuroSynth Labs",
            location="Basel, Switzerland",
            city="Basel",
            state=None,
            country="Switzerland",
            lat=47.5596,
            lon=7.5886,
            company_type="CRO",
            turnover=5400000.00,
            no_of_facilities=1,
            manpower=180,
            phd_count=24,
            msc_count=60,
            chemical_engineers=10,
            no_of_products=3,
            under_dev_products=12,
            customer_audit=True,
        ),
    ]
    db.add_all(companies)
    db.flush()

    # --- mappings ---
    today = date.today()
    for i, c in enumerate(companies):
        # Certifications: rotate a few per company
        picked_certs = ["ISO9001", "USFDA"] if i % 2 == 0 else ["WHO_GMP", "GLP"]
        for code in picked_certs:
            db.add(
                CompanyCertification(
                    company_id=c.id,
                    certification_type_id=cert_by_code[code].id,
                    has_cert=True,
                    cert_number=f"{code}-{c.id:03d}",
                    cert_issued_by="Dummy Authority",
                    cert_valid_from=today - timedelta(days=365),
                    cert_valid_to=today + timedelta(days=365),
                    notes="Dummy seeded certification",
                )
            )

        # Processes
        picked_procs = [
            "HYDROGENATION",
            "OXIDATION",
            "REDUCTION",
        ] if i % 2 == 0 else ["NITRATION", "ACYLATION"]
        for code in picked_procs:
            db.add(
                CompanyProcess(
                    company_id=c.id,
                    process_type_id=proc_by_code[code].id,
                    available=True,
                    capability_level="commercial" if i % 2 == 0 else "pilot",
                    max_scale_kg=5000.0 if i % 2 == 0 else 500.0,
                    notes="Dummy seeded process capability",
                )
            )

        # Equipment
        for code in ["KILO_LAB", "DISTILLATION_COLUMN", "FBD"]:
            db.add(
                CompanyEquipment(
                    company_id=c.id,
                    equipment_type_id=equip_by_code[code].id,
                    count=1 + (i % 3),
                    capacity=250.0 + (i * 50.0),
                    notes="Dummy seeded equipment",
                )
            )

        # Analytics
        for code in ["HPLC", "GC", "LCMS"]:
            db.add(
                CompanyAnalytics(
                    company_id=c.id,
                    analytics_type_id=analy_by_code[code].id,
                    available=True,
                    instrument_count=1 + (i % 2),
                    model_info="Dummy Model",
                    notes="Dummy seeded analytics capability",
                )
            )

        # Services
        for code in ["METHOD_DEVELOPMENT", "IMPURITY_SYNTHESIS", "STABILITY_STUDIES"]:
            db.add(
                CompanyService(
                    company_id=c.id,
                    service_type_id=serv_by_code[code].id,
                    offered=True,
                    details="Dummy seeded service offering",
                )
            )

        # Products
        products = [
            ("API-A", "API", "commercial"),
            ("INT-B", "Intermediate", "development"),
            ("API-C", "API", "commercial"),
        ]
        for (pname, ptype, stage) in products[: 2 + (i % 2)]:
            db.add(
                CompanyProduct(
                    company_id=c.id,
                    product_name=f"{pname}-{c.id}",
                    product_type=ptype,
                    stage=stage,
                    price_per_unit=125.0 + (i * 10.0),
                    units="kg",
                    notes="Dummy seeded product",
                )
            )

    db.commit()


