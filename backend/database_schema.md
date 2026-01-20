-- === Master companies table ===
CREATE TABLE companies (
    id               SERIAL PRIMARY KEY,
    name             TEXT NOT NULL UNIQUE,
    city             TEXT,
    country          TEXT,
    company_type     TEXT,
    turnover         NUMERIC(18,2),         -- currency amount
    no_of_facilities INT,
    manpower         INT,
    contract_manpower INT,
    phd_count        INT,
    msc_count        INT,
    chemical_engineers INT,
    no_of_products   INT,
    under_dev_products INT,
    fei               VARCHAR(100),
    duns              VARCHAR(100),
    customer_audit    BOOLEAN DEFAULT FALSE,
    ssr               VARCHAR(100),
    glr               VARCHAR(100),
    ssr_capacity      NUMERIC(18,2),
    glr_capacity      NUMERIC(18,2),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_country ON companies(country);

-- === Certifications (lookup) ===
CREATE TABLE certification_types (
    id   SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'USFDA', 'EDQM'
    name TEXT NOT NULL
);

-- mapping: company <-> certification, with optional details
CREATE TABLE company_certifications (
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    certification_type_id INT REFERENCES certification_types(id) ON DELETE CASCADE,
    has_cert BOOLEAN NOT NULL DEFAULT TRUE,
    cert_number VARCHAR(200),
    cert_issued_by TEXT,
    cert_valid_from DATE,
    cert_valid_to DATE,
    notes TEXT,
    PRIMARY KEY (company_id, certification_type_id)
);

-- Seed examples (optional)
-- INSERT INTO certification_types (code, name) VALUES
-- ('USFDA','US FDA'),('EDQM','EDQM'),('WHO_GMP','WHO GMP'),('PMDA','PMDA'),
-- ('COFEPRIS','Cofepris'),('ANVISA','ANVISA'),('AIFA','AIFA'),('TGA','TGA'),
-- ('STATE_GMP','State GMP'),('ISO9001','ISO 9001'),('nGMP','nGMP'),('GLP','GLP');

-- === Chemistry/process types (lookup) ===
CREATE TABLE process_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(80) UNIQUE NOT NULL,   -- e.g. 'ACYLATION'
    name TEXT NOT NULL
);

-- mapping: company <-> process, with capability, notes, experience level
CREATE TABLE company_processes (
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    process_type_id INT REFERENCES process_types(id) ON DELETE CASCADE,
    available BOOLEAN DEFAULT TRUE,
    capability_level VARCHAR(50), -- e.g. 'lab', 'pilot', 'commercial'
    max_scale_kg NUMERIC(14,2),   -- if known
    notes TEXT,
    PRIMARY KEY (company_id, process_type_id)
);

-- Example process types: acylation, alkylation, amination, birch_reduction, bromination, carboxylation, cannizzaro, chiral_chemistry, chlorination, chlorosulfonation, column_chromatography, condensation, cryogenic_reaction, cyclization_high_temp, diazotization, high_vacuum_distillation, esterification, fluorination, friedel_craft, grignard, halide_exchange_reaction, heck_reaction, high_temp_reactions, hoffman_degradation, hydrogenation, hydrolysis, iodination, isomerization, lyophilisation, neutralization, nitration, oxidation, photochemical_reaction, perkin, phosgenation, reduction, reductive_cyclization, sand_meyer, sulphonation, thiophosgenation, ozonolysis

-- === Equipment/facilities types (lookup) ===
CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(80) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    comment TEXT
);

-- mapping: company <-> equipment with counts/capacities
CREATE TABLE company_equipment (
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    count INT DEFAULT 0,
    capacity NUMERIC(18,2),    -- optional numeric capacity (e.g. L, kg/h)
    notes TEXT,
    PRIMARY KEY (company_id, equipment_type_id)
);

-- Equipment examples: ANFD, FBD, Spray_dryer, RCVD, Milling, Sifter, Micronizer,
-- Clean_rooms, Isolators, Distillation_columns, Solvent_recovery, Kilo_lab, Pilot_plant

-- === Analytics / Instrumentation types (lookup) ===
CREATE TABLE analytics_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(80) UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE company_analytics (
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    analytics_type_id INT REFERENCES analytics_types(id) ON DELETE CASCADE,
    available BOOLEAN DEFAULT TRUE,
    instrument_count INT DEFAULT 0,
    model_info TEXT,
    notes TEXT,
    PRIMARY KEY (company_id, analytics_type_id)
);

-- Analytics examples: NMR, HPLC, GC, UPLC, Malvern, LCMS, Stability_Chamber, Fumehood

-- === Services & capabilities (lookup) ===
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(80) UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE company_services (
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    service_type_id INT REFERENCES service_types(id) ON DELETE CASCADE,
    offered BOOLEAN DEFAULT TRUE,
    details TEXT,
    PRIMARY KEY (company_id, service_type_id)
);

-- Service examples: Paper_Chemistry_Evaluation, Patent_Check, Method_Development,
-- Impurity_Synthesis, Reference_Standard_Provision, Characterization_Studies, Stability_Studies

-- === Optional: product catalog per company ===
CREATE TABLE company_products (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    product_name TEXT,
    product_type TEXT,
    stage VARCHAR(50), -- e.g. 'commercial','development'
    price_per_unit NUMERIC(18,4),
    units TEXT,
    notes TEXT
);

-- === Useful views / indexes (examples) ===
CREATE INDEX idx_company_cert_company ON company_certifications(company_id);
CREATE INDEX idx_company_proc_company ON company_processes(company_id);
CREATE INDEX idx_company_equip_company ON company_equipment(company_id);

-- === Trigger to update updated_at (optional) ===
CREATE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_companies_updated_at();


-- --- companies table & columns ---
COMMENT ON TABLE companies IS 'Master record for each company: base metadata, headcounts, simple registry identifiers and basic capacities.';

COMMENT ON COLUMN companies.id IS 'Primary key: internal unique identifier for the company (generated).';
COMMENT ON COLUMN companies.name IS 'Official company name. Use the legal / marketing name for de-duplication and display.';
COMMENT ON COLUMN companies.city IS 'City where the company is located. Use a consistent format for city names.';
COMMENT ON COLUMN companies.country IS 'Country where the company is located. Use a consistent format for country names (e.g., ISO country codes or full country names).';
COMMENT ON COLUMN companies.company_type IS 'Type/category of company (e.g., CDMO, API manufacturer, CRO, Contract Manufacturer).';
COMMENT ON COLUMN companies.turnover IS 'Annual turnover / revenue as a currency amount. Store in a consistent currency and document currency separately if needed.';
COMMENT ON COLUMN companies.no_of_facilities IS 'Number of distinct physical facilities/sites owned or operated by the company.';
COMMENT ON COLUMN companies.manpower IS 'Total number of full-time in-house employees (headcount).';
COMMENT ON COLUMN companies.contract_manpower IS 'Number of contract / temporary staff usually engaged by the company.';
COMMENT ON COLUMN companies.phd_count IS 'Number of employees with a Ph.D. (headcount). Useful for R&D capability signals.';
COMMENT ON COLUMN companies.msc_count IS 'Number of employees with an MSc degree (headcount).';
COMMENT ON COLUMN companies.chemical_engineers IS 'Number of chemical engineers on staff (headcount).';
COMMENT ON COLUMN companies.no_of_products IS 'Count of commercial products (approved/commercialized).';
COMMENT ON COLUMN companies.under_dev_products IS 'Count of products currently under development (pre-commercial).';
COMMENT ON COLUMN companies.fei IS 'FEI or other factory identifier string (if applicable). Use for regulatory or vendor lookups.';
COMMENT ON COLUMN companies.duns IS 'DUNS number (Dun & Bradstreet identifier) or other external company ID.';
COMMENT ON COLUMN companies.customer_audit IS 'Boolean flag indicating if the company allows/has hosted customer audits (true/false).';
COMMENT ON COLUMN companies.ssr IS 'Free-text: SSR identifier or internal strategic supply reference (domain-specific).';
COMMENT ON COLUMN companies.glr IS 'Free-text: GLR identifier or internal register reference (domain-specific).';
COMMENT ON COLUMN companies.ssr_capacity IS 'Numeric capacity measure associated with SSR (use consistent units, e.g., kg/month).';
COMMENT ON COLUMN companies.glr_capacity IS 'Numeric capacity measure associated with GLR (use consistent units, e.g., kg/month).';
COMMENT ON COLUMN companies.created_at IS 'Timestamp when the company record was created in the database.';
COMMENT ON COLUMN companies.updated_at IS 'Timestamp when the company record was last updated. Maintained via trigger in the schema.';

-- --- certification_types table & columns ---
COMMENT ON TABLE certification_types IS 'Lookup table listing possible certifications/regulatory approvals (US FDA, EDQM, WHO GMP, etc.).';
COMMENT ON COLUMN certification_types.id IS 'Primary key for certification types.';
COMMENT ON COLUMN certification_types.code IS 'Short machine-friendly code for the certification (e.g., USFDA, EDQM, WHO_GMP).';
COMMENT ON COLUMN certification_types.name IS 'Human-readable name of the certification (e.g., "US Food & Drug Administration").';

-- --- company_certifications mapping ---
COMMENT ON TABLE company_certifications IS 'Mapping between companies and the certifications they hold; supports storing certificate metadata and validity windows.';
COMMENT ON COLUMN company_certifications.company_id IS 'FK to companies.id.';
COMMENT ON COLUMN company_certifications.certification_type_id IS 'FK to certification_types.id.';
COMMENT ON COLUMN company_certifications.has_cert IS 'Boolean: whether the company currently holds this certification (true) or not (false).';
COMMENT ON COLUMN company_certifications.cert_number IS 'Official certificate number / reference issued by the regulator.';
COMMENT ON COLUMN company_certifications.cert_issued_by IS 'Issuing authority or office for the certificate.';
COMMENT ON COLUMN company_certifications.cert_valid_from IS 'Certificate start/issue date (use ISO date).';
COMMENT ON COLUMN company_certifications.cert_valid_to IS 'Certificate expiry date (use ISO date).';
COMMENT ON COLUMN company_certifications.notes IS 'Free-text notes about the certification (restrictions, scope, audited sites).';

-- --- process_types table & columns ---
COMMENT ON TABLE process_types IS 'Lookup table of chemistry/process capabilities (acylation, hydrogenation, nitration, etc.).';
COMMENT ON COLUMN process_types.id IS 'Primary key for process types.';
COMMENT ON COLUMN process_types.code IS 'Short code for the chemical/process type (e.g., ACYLATION, HYDROGENATION).';
COMMENT ON COLUMN process_types.name IS 'Human-readable name for the process/chemistry type.';

-- --- company_processes mapping ---
COMMENT ON TABLE company_processes IS 'Join table mapping companies to the processes they perform with optional capability details and scale.';
COMMENT ON COLUMN company_processes.company_id IS 'FK to companies.id.';
COMMENT ON COLUMN company_processes.process_type_id IS 'FK to process_types.id.';
COMMENT ON COLUMN company_processes.available IS 'Boolean: whether the company currently offers/do this process.';
COMMENT ON COLUMN company_processes.capability_level IS 'Free-text or enum indicating development level (e.g., "lab", "pilot", "commercial").';
COMMENT ON COLUMN company_processes.max_scale_kg IS 'Maximum reported scale for that process, in kilograms (or other documented unit).';
COMMENT ON COLUMN company_processes.notes IS 'Free-text: details like special expertise, hazardous chemistries handled, or known limits.';

-- --- equipment_types table & columns ---
COMMENT ON TABLE equipment_types IS 'Lookup of equipment/facility categories (spray dryer, FBD, micronizer, clean room, distillation columns, etc.).';
COMMENT ON COLUMN equipment_types.id IS 'Primary key for equipment types.';
COMMENT ON COLUMN equipment_types.code IS 'Short code for the equipment (e.g., SPRAY_DRYER, DISTILLATION_COLUMN).';
COMMENT ON COLUMN equipment_types.name IS 'Human-readable equipment name.';
COMMENT ON COLUMN equipment_types.comment IS 'Notes about how the equipment type is defined or typical units/capacity expected.';

-- --- company_equipment mapping ---
COMMENT ON TABLE company_equipment IS 'Mapping of company to equipment items with counts and optional capacity numbers.';
COMMENT ON COLUMN company_equipment.company_id IS 'FK to companies.id.';
COMMENT ON COLUMN company_equipment.equipment_type_id IS 'FK to equipment_types.id.';
COMMENT ON COLUMN company_equipment.count IS 'Count of this equipment type available at the company (integer).';
COMMENT ON COLUMN company_equipment.capacity IS 'Optional numeric capacity measure (e.g., L, kg/h). Document anticipated units in notes or equipment_types.comment.';
COMMENT ON COLUMN company_equipment.notes IS 'Free-text: model info, year commissioned, limitations, or single-use vs. multi-use.';

-- --- analytics_types table & columns ---
COMMENT ON TABLE analytics_types IS 'Lookup of analytical instrumentation and lab capabilities (NMR, HPLC, LCMS, Malvern, stability chambers, etc.).';
COMMENT ON COLUMN analytics_types.id IS 'Primary key for analytics instrument types.';
COMMENT ON COLUMN analytics_types.code IS 'Machine-friendly code for the instrument (e.g., NMR, HPLC, LCMS).';
COMMENT ON COLUMN analytics_types.name IS 'Human-readable instrument name (e.g., "1H NMR").';

-- --- company_analytics mapping ---
COMMENT ON TABLE company_analytics IS 'Mapping table recording which analytical instruments a company has, counts and models.';
COMMENT ON COLUMN company_analytics.company_id IS 'FK to companies.id.';
COMMENT ON COLUMN company_analytics.analytics_type_id IS 'FK to analytics_types.id.';
COMMENT ON COLUMN company_analytics.available IS 'Boolean: whether the instrument is currently available for use or service.';
COMMENT ON COLUMN company_analytics.instrument_count IS 'How many instruments of this type the company has.';
COMMENT ON COLUMN company_analytics.model_info IS 'Specific model/make info (e.g., "Bruker 400 MHz").';
COMMENT ON COLUMN company_analytics.notes IS 'Free-text: maintenance status, calibration expiry, GLP-aligned, etc.';

-- --- service_types table & columns ---
COMMENT ON TABLE service_types IS 'Lookup for service offerings (method development, impurity synthesis, characterization, patent checks, etc.).';
COMMENT ON COLUMN service_types.id IS 'Primary key for service type.';
COMMENT ON COLUMN service_types.code IS 'Short machine-friendly code for the service (e.g., METHOD_DEV).';
COMMENT ON COLUMN service_types.name IS 'Human-readable service name.';

-- --- company_services mapping ---
COMMENT ON TABLE company_services IS 'Mapping table to capture which services a company offers with optional notes.';
COMMENT ON COLUMN company_services.company_id IS 'FK to companies.id.';
COMMENT ON COLUMN company_services.service_type_id IS 'FK to service_types.id.';
COMMENT ON COLUMN company_services.offered IS 'Boolean: whether the service is actively offered.';
COMMENT ON COLUMN company_services.details IS 'Free-text: scope, typical timelines, standard deliverables or extra costs.';

-- --- company_products table & columns ---
COMMENT ON TABLE company_products IS 'Optional product catalog for each company: stores product name, stage and pricing where available.';
COMMENT ON COLUMN company_products.id IS 'Primary key for product record.';
COMMENT ON COLUMN company_products.company_id IS 'FK to companies.id.';
COMMENT ON COLUMN company_products.product_name IS 'Commercial or internal product name.';
COMMENT ON COLUMN company_products.product_type IS 'Category/type of product (e.g., API, intermediate, excipient).';
COMMENT ON COLUMN company_products.stage IS 'Lifecycle stage: e.g., commercial, development, discontinued.';
COMMENT ON COLUMN company_products.price_per_unit IS 'Reported price per unit (numeric). Document currency in notes or separate field if needed.';
COMMENT ON COLUMN company_products.units IS 'Units for price_per_unit (e.g., "kg", "g", "L").';
COMMENT ON COLUMN company_products.notes IS 'Free-text: specifications, regulatory status, or packaging info.';

-- --- triggers / audit fields ---
COMMENT ON FUNCTION update_companies_updated_at IS 'Trigger function to set companies.updated_at to now() before update.';
COMMENT ON TRIGGER trg_companies_updated_at ON companies IS 'Trigger that calls update_companies_updated_at before any update on companies.';

-- --- Usage / mapping guidance comments (optional to add as table-level info) ---
COMMENT ON TABLE company_certifications IS 'Use this table to record whether a certification applies to one or more of the company''s sites, along with cert numbers and validity. If certifications are site-specific, consider extending the schema with a "sites" table and attaching certifications to sites instead of to companies directly.';
COMMENT ON TABLE company_processes IS 'Use capability_level and max_scale_kg to differentiate lab/pilot/commercial readiness and planned maximum demonstrated scale for that chemistry.';
COMMENT ON TABLE company_equipment IS 'Record count as integers and capacity where appropriate. If equipment is unique (model-specific) store details in notes or create an equipment_instances table for inventory-level detail.';
