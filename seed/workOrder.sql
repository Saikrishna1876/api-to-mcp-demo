CREATE TABLE
  IF NOT EXISTS "work_order_master" (
    id SERIAL PRIMARY KEY,
    doc_no VARCHAR(18) UNIQUE NOT NULL,
    wo_no VARCHAR(255) UNIQUE NOT NULL, -- Free field
    wo_date DATE NOT NULL,
    amendment_no VARCHAR(255),
    amendment_date DATE,
    cust_id INTEGER NOT NULL,
    tot_value DECIMAL(18, 2), -- Calculated value
    wo_start TIMESTAMP NOT NULL,
    wo_end TIMESTAMP NOT NULL,
    project_id BIGINT NOT NULL,
    lunch BOOLEAN DEFAULT FALSE NOT NULL,
    weekly_off VARCHAR(3),
    no_shifts INTEGER NOT NULL,
    shift_hours INTEGER,
    include_woff BOOLEAN DEFAULT FALSE NOT NULL,
    kind_attn VARCHAR(255),
    monthly_hrs DECIMAL(10, 2),
    remarks TEXT,
    demob_nil_after INTEGER, -- only in months
    wo_initial_start DATE NOT NULL,
    wo_initial_end DATE NOT NULL,
    sector INTEGER NOT NULL,
    wo_open_close VARCHAR(10) DEFAULT 'Open' NOT NULL CHECK (wo_open_close IN ('Open', 'Closed')),
    bill_to_cust_id INTEGER NOT NULL,
    project_to_id BIGINT NOT NULL,
    attachment_remarks TEXT,
    active BOOLEAN DEFAULT true,
    added_by INTEGER NOT NULL,
    add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INTEGER,
    update_date TIMESTAMP,
    -- Foregin keys
    FOREIGN KEY (cust_id) REFERENCES customers (id),
    FOREIGN KEY (project_id) REFERENCES projects (project_id),
    FOREIGN KEY (sector) REFERENCES common_master (id),
    FOREIGN KEY (bill_to_cust_id) REFERENCES customers (id),
    FOREIGN KEY (project_to_id) REFERENCES projects (project_id),
    FOREIGN KEY (added_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
  );

CREATE TABLE
  IF NOT EXISTS "work_order_tran" (
    id SERIAL PRIMARY KEY,
    wo_id INTEGER NOT NULL, -- Master ID
    wo_sr_no INTEGER NOT NULL,
    asset_id INTEGER NOT NULL, -- Foregin key: Asset Master
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    rate_per_hr DECIMAL(10, 2) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    monthly_rate DECIMAL(10, 2) NOT NULL,
    mob DECIMAL(10, 2),
    demob DECIMAL(10, 2),
    amount DECIMAL(10, 2) NOT NULL,
    working_hrs INTEGER NOT NULL,
    breakdown_penalty DECIMAL(10, 2),
    breakdown_penalty_unit INTEGER, -- Foregin Key: Common_master(unit)
    original_start_date TIMESTAMP NOT NULL,
    original_end_date TIMESTAMP NOT NULL,
    main_equipment BOOLEAN,
    hsd_scope VARCHAR(20), -- DROPDOWN: Customer or Owner
    -- Foreign Keys
    FOREIGN KEY (wo_id) REFERENCES work_order_master (id),
    FOREIGN KEY (asset_id) REFERENCES assets (id),
    FOREIGN KEY (breakdown_penalty_unit) REFERENCES common_master (id)
  );