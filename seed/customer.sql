DROP TABLE IF EXISTS "state_master" CASCADE;

CREATE TABLE
  "state_master" (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL UNIQUE,
    state_code VARCHAR(10) UNIQUE,
    state_no INT UNIQUE,
    active BOOLEAN DEFAULT TRUE
  );

CREATE TABLE
  IF NOT EXISTS "customers" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT Null,
    state_id INT NOT NULL,
    tally_name VARCHAR(255),
    parent_cust_id INTEGER,
    vendor_code VARCHAR(50),
    pan_no VARCHAR(10) UNIQUE NOT NULL,
    gst_no VARCHAR(15) UNIQUE,
    tin_no VARCHAR(15),
    tan_no VARCHAR(10),
    service_tax_no VARCHAR(20),
    vendor_type INTEGER NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email_id VARCHAR(255) NOT NULL,
    contact_details VARCHAR(255) NOT NULL,
    project_ids INTEGER[],
    active BOOLEAN DEFAULT TRUE,
    added_by INTEGER NOT NULL,
    add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    update_date TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES state_master (id),
    FOREIGN KEY (vendor_type) REFERENCES common_master (id),
    FOREIGN KEY (added_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
  );

INSERT INTO
  state_master (state_name, state_code, state_no, active)
VALUES
  ('ANDHRA PRADESH', 'AP', 37, TRUE),
  ('BIHAR', 'BH', 10, TRUE),
  ('CHATTISGARH', 'CG', 22, TRUE),
  ('DELHI', 'DL', 7, TRUE),
  ('GUJARAT', 'GJ', 24, TRUE),
  ('HARYANA', 'HR', 6, TRUE),
  ('HIMACHAL PRADESH', 'HP', 2, TRUE),
  ('JHARKHAND', 'JH', 20, TRUE),
  ('KARNATAKA', 'KA', 29, TRUE),
  ('MADHYA PRADESH', 'MP', 23, TRUE),
  ('MAHARASHTRA', 'MH', 27, TRUE),
  ('ODISHA', 'OD', 21, TRUE),
  ('RAJASTHAN', 'RJ', 8, TRUE),
  ('TAMIL NADU', 'TN', 33, TRUE),
  ('UTTAR PRADESH', 'UP', 9, TRUE),
  ('WEST BENGAL', 'WB', 19, TRUE),
  ('KERALA', 'KL', 32, TRUE),
  ('ASSAM', 'AS', 18, TRUE),
  ('PUNJAB', 'PB', 3, TRUE),
  ('DAMAN', 'DD', 25, TRUE),
  ('GOA', 'GA', 30, TRUE),
  ('UTTARAKHAND', 'UK', 5, TRUE),
  ('TELANGANA', 'TS', 36, TRUE),
  ('JAMMU AND KASHMIR', 'JK', 1, TRUE),
  ('PONDICHERRY', 'PY', 34, TRUE),
  ('ANDAMAN NIKOBAR', 'AN', 35, TRUE),
  ('Nagaland', 'NL', 13, TRUE),
  ('Arunachal Pradesh', 'AR', 12, TRUE),
  ('Chandigarh', 'CH', 4, TRUE),
  ('Dadra & Nagar Haveli', 'DN', 26, TRUE),
  ('Ladakh', 'LA', 38, TRUE),
  ('Lakshadweep Islands', 'LD', 31, TRUE),
  ('Manipur', 'MN', 14, TRUE),
  ('Meghalaya', 'ML', 17, TRUE),
  ('Mizoram', 'MZ', 15, TRUE),
  ('Other Territory', 'OT', 97, TRUE),
  ('Sikkim', 'SK', 11, TRUE),
  ('Tripura', 'TR', 16, TRUE)