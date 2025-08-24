CREATE TABLE
  IF NOT EXISTS "attachment_master" (
    id SERIAL PRIMARY KEY,
    row_id INTEGER NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    added_by INTEGER NOT NULL,
    add_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    updated_by INTEGER,
    update_date TIMESTAMP,
  );