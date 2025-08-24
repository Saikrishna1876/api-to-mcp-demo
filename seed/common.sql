CREATE TABLE
  IF NOT EXISTS common_master (
    id SERIAL PRIMARY KEY,
    doc_type VARCHAR(10),
    priority_in_daily_task VARCHAR(20),
    category VARCHAR(100),
    current_status VARCHAR(20),
    bank_name VARCHAR(100),
    month_name VARCHAR(20),
    financial_year VARCHAR(9),
    from_date DATE,
    to_date DATE,
    year_abbr VARCHAR(4),
    attachment_size INT,
    unit VARCHAR(20),
    vendor_type VARCHAR(50),
    sector VARCHAR(50),
    asset_type VARCHAR(50),
    asset_make VARCHAR(50),
    attachment_file_types VARCHAR(255),
    alert_email_id VARCHAR(100),
    alert_id_pwd VARCHAR(100),
    alert_id_smtp VARCHAR(100),
    alert_id_port INT,
    alert_ssl_type VARCHAR(10),
    currency TEXT,
    rev_type VARCHAR(20), -- Normal, OT, Others, Advance, -
    component_for VARCHAR(20), -- Crawler, Forklift, Hydra, Palfinger, Sale of goods, Telehandler, Trailer, TMC
    invoice_for VARCHAR(20), -- Mob, Demob, Mob-Demob, Hiring
    encl VARCHAR(25), -- Logsheet, Completion Certificate, Deployment Certificate, Diesel Bill Copy, WTG Certificate
    alert_show_time TIME,
    backup_time_m TIME,
    backup_time_e TIME,
    active BOOLEAN DEFAULT TRUE NOT NULL
  );