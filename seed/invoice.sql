CREATE TABLE
  IF NOT EXISTS "invoice_master" (
    id SERIAL PRIMARY KEY NOT NULL,
    -- Invoice Details
    doc_no VARCHAR(18) UNIQUE NOT NULL,
    inv_date DATE NOT NULL, -- Date when the invoice was generated
    cust_id INTEGER NOT NULL, -- Customer ID associated with the invoice
    site_id INTEGER NOT NULL, -- Site ID related to the invoice
    wo_id INTEGER NOT NULL, -- Work Order ID (or Sales Order ID)
    start_date TIMESTAMP NOT NULL, -- Start date of the invoice period
    end_date TIMESTAMP NOT NULL, -- End date of the invoice period
    cr_period INTEGER DEFAULT 0, -- Credit Period in days
    due_date DATE NOT NULL, -- Invoice Due Date, auto generated (inv_date + cr_period)
    encl TEXT, -- Details of enclosures with the invoice
    -- Financial Amounts
    taxable_amt NUMERIC(18, 2), -- Taxable amount of the invoice
    tot_cgst NUMERIC(18, 2), -- Total Central GST amount
    tot_sgst NUMERIC(18, 2), -- Total State GST amount
    tot_igst NUMERIC(18, 2), -- Total Integrated GST amount
    tot_cess NUMERIC(18, 2), -- Total CESS amount
    tot_kkc NUMERIC(18, 2), -- Total Krishi Kalyan CESS amount
    amount NUMERIC(18, 2), -- Total amount of the invoice
    inv_roundup NUMERIC(18, 2), -- Invoice Rounding Off Amount
    inv_approval_status VARCHAR(20), -- Approved, Rejected, Waiting for approval, Under edit
    inv_approval_remark VARCHAR(255), -- Reason
    invoice_edit_count INTEGER DEFAULT 0, -- Number of times the invoice has been edited
    -- Audit and Status Information
    added_by INTEGER NOT NULL, -- User ID who added the invoice
    add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Invoice creation timestamp
    updated_by INTEGER, -- User ID who last updated the invoice
    update_date TIMESTAMP WITH TIME ZONE, -- Last update timestamp
    inv_rem TEXT, -- Invoice remarks
    inv_print BOOLEAN DEFAULT FALSE, -- Invoice print status (TRUE if printed, FALSE otherwise)
    irn_gen_status VARCHAR(50), -- IRN (Invoice Reference Number) Generation Status (e.g., 'Pending', 'Generated', 'Failed')
    irn_gen_remark VARCHAR(255), -- IRN Generation Remark
    qrcode TEXT, -- QR Code data or path for verification
    irn_no VARCHAR(100), -- IRN Number
    digisign_status BOOLEAN DEFAULT FALSE, -- Digital Signature Status (TRUE if signed, FALSE otherwise)
    signed_by INTEGER, -- User ID who digitally signed the invoice
    ack_date TIMESTAMP WITH TIME ZONE, -- Acknowledgment Date
    inv_complete BOOLEAN DEFAULT FALSE, -- Invoice completion status (TRUE if complete)
    -- Deletion Status
    deleted_yn BOOLEAN DEFAULT FALSE, -- Deletion status (TRUE if deleted, FALSE otherwise)
    deleted_by INTEGER, -- User ID who deleted the invoice
    deleted_date TIMESTAMP WITH TIME ZONE, -- Invoice deletion timestamp
    -- Bill Transfer (BT) Related Fields (even if the module doesn't actively cover BT, these fields are present in the data)
    bt_docno VARCHAR(50), -- Bill Transfer Document Number
    bt_date DATE, -- Bill Transfer Date
    bill_cust_id INTEGER, -- Billed Customer ID for BT
    bill_ship_to_id INTEGER, -- Billed Ship-To ID for BT
    asset_depot_id INTEGER, -- Asset Depot ID for BT
    bt_tot_cst NUMERIC(18, 2), -- Bill Transfer Total Central GST
    bt_tot_sgst NUMERIC(18, 2), -- Bill Transfer Total State GST
    bt_tot_igst NUMERIC(18, 2), -- Bill Transfer Total Integrated GST
    bt_taxable_amt NUMERIC(18, 2), -- Bill Transfer Taxable Amount
    bt_amount NUMERIC(18, 2), -- Bill Transfer Amount
    bt_percentage NUMERIC(5, 2), -- Bill Transfer Percentage
    bt_roundup NUMERIC(18, 2), -- Bill Transfer Rounding Off Amount
    bt_complete BOOLEAN DEFAULT FALSE, -- Bill Transfer completion status (TRUE if complete)
    -- Document Paths
    inv_path TEXT, -- Path to the stored invoice document file
    signed_inv_path TEXT, -- Path to the signed invoice document file
    -- Communication Status
    email_sent_to_cust BOOLEAN DEFAULT FALSE, -- Status of email sent to customer (TRUE if sent)
    FOREIGN KEY (cust_id) REFERENCES customers (id),
    FOREIGN KEY (wo_id) REFERENCES work_order_master (id),
    FOREIGN KEY (bill_cust_id) REFERENCES customers (id),
    FOREIGN KEY (added_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id),
    FOREIGN KEY (signed_by) REFERENCES users (id),
    FOREIGN KEY (deleted_by) REFERENCES users (id)
  );

-- Transaction
CREATE TABLE
  IF NOT EXISTS "invoice_tran" (
    id SERIAL PRIMARY KEY,
    inv_id INTEGER NOT NULL, -- Foreign key: invoice_master(id)
    inv_sr_no INTEGER NOT NULL,
    asset_id INTEGER NOT NULL,
    invoice_for TEXT NOT NULL,
    work_type_id INTEGER NOT NULL, -- Foreign key: common_master(id) or similar, from "Step 2: dropdown from work type based on asset_type = component_for and invoice_for"
    start_date TIMESTAMP NOT NULL, -- From "Step 3: Enter start_date and end_date also for multi"
    end_date TIMESTAMP NOT NULL, -- From "Step 3: Enter start_date and end_date also for multi"
    quantity DECIMAL(10, 3) NOT NULL, -- From "Step 5: quantity"
    unit VARCHAR(50), -- Foreign key: common_master(id) for units, from "Step 5: unit"
    rate DECIMAL(10, 3) NOT NULL, -- From "Step 5: rate" (this can be daily, monthly, or hourly rate based on Step 4 and 2)
    taxable_amount DECIMAL(18, 2) NOT NULL, -- From "Step 5: taxable_amount"
    cgst_percentage DECIMAL(5, 2), -- From "Step 5: cgst %" (based on Step 3)
    cgst_amount DECIMAL(18, 2), -- From "Step 5: cgst A" (based on Step 3)
    sgst_percentage DECIMAL(5, 2), -- From "Step 5: sgst %" (based on Step 3)
    sgst_amount DECIMAL(18, 2), -- From "Step 5: sgst A" (based on Step 3)
    igst_percentage DECIMAL(5, 2), -- From "Step 5: igst %" (based on Step 3)
    igst_amount DECIMAL(18, 2), -- From "Step 5: igst A" (based on Step 3)
    amount DECIMAL(18, 2) NOT NULL, -- From "Step 5: amount = taxable_amount + (cgst A + sgst A + igst A)"
    remarks TEXT, -- From "step 6: Remarks if any"
    added_by INTEGER NOT NULL,
    add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INTEGER,
    update_date TIMESTAMP,
    -- Foreign Keys
    FOREIGN KEY (inv_id) REFERENCES invoice_master (id),
    FOREIGN KEY (asset_id) REFERENCES assets (id),
    FOREIGN KEY (work_type_id) REFERENCES common_master (id), -- Assuming common_master holds work types
    FOREIGN KEY (unit) REFERENCES common_master (id), -- Assuming common_master holds unit types
    FOREIGN KEY (added_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
  );


-- Invoice history
CREATE TABLE
  IF NOT EXISTS "invoice_master_history" (
    id SERIAL PRIMARY KEY,
    inv_id INTEGER NOT NULL, -- Foreign key: invoice_master(id)
    doc_no VARCHAR(18) UNIQUE NOT NULL,
    inv_date DATE NOT NULL, -- Date when the invoice was generated
    cust_id INTEGER NOT NULL, -- Customer ID associated with the invoice
    site_id INTEGER NOT NULL, -- Site ID related to the invoice
    wo_id INTEGER NOT NULL, -- Work Order ID (or Sales Order ID)
    invoice_for TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL, -- Start date of the invoice period
    end_date TIMESTAMP NOT NULL, -- End date of the invoice period
    cr_period INTEGER DEFAULT 0, -- Credit Period in days
    due_date DATE NOT NULL, -- Invoice Due Date, auto generated (inv_date + cr_period)
    encl TEXT, -- Details of enclosures with the invoice
    -- Financial Amounts
    taxable_amt NUMERIC(18, 2), -- Taxable amount of the invoice
    tot_cgst NUMERIC(18, 2), -- Total Central GST amount
    tot_sgst NUMERIC(18, 2), -- Total State GST amount
    tot_igst NUMERIC(18, 2), -- Total Integrated GST amount
    tot_cess NUMERIC(18, 2), -- Total CESS amount
    tot_kkc NUMERIC(18, 2), -- Total Krishi Kalyan CESS amount
    amount NUMERIC(18, 2), -- Total amount of the invoice
    inv_roundup NUMERIC(18, 2), -- Invoice Rounding Off Amount
    inv_approval_status VARCHAR(20), -- Approved, Rejected, Waiting for approval, Under edit
    inv_approval_remark VARCHAR(255), -- Reason
    invoice_edit_count INTEGER DEFAULT 0, -- Number of times the invoice has been edited
    -- Audit and Status Information
    added_by INTEGER NOT NULL, -- User ID who added the invoice
    add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Invoice creation timestamp
    updated_by INTEGER, -- User ID who last updated the invoice
    update_date TIMESTAMP WITH TIME ZONE, -- Last update timestamp
    inv_rem TEXT, -- Invoice remarks
    inv_print BOOLEAN DEFAULT FALSE, -- Invoice print status (TRUE if printed, FALSE otherwise)
    irn_gen_status VARCHAR(50), -- IRN (Invoice Reference Number) Generation Status (e.g., 'Pending', 'Generated', 'Failed')
    qrcode TEXT, -- QR Code data or path for verification
    irn_no VARCHAR(100), -- IRN Number
    digisign_status BOOLEAN DEFAULT FALSE, -- Digital Signature Status (TRUE if signed, FALSE otherwise)
    signed_by INTEGER, -- User ID who digitally signed the invoice
    ack_date TIMESTAMP WITH TIME ZONE, -- Acknowledgment Date
    inv_complete BOOLEAN DEFAULT FALSE, -- Invoice completion status (TRUE if complete)
    -- Deletion Status
    deleted_yn BOOLEAN DEFAULT FALSE, -- Deletion status (TRUE if deleted, FALSE otherwise)
    deleted_by INTEGER, -- User ID who deleted the invoice
    deleted_date TIMESTAMP WITH TIME ZONE, -- Invoice deletion timestamp
    -- Bill Transfer (BT) Related Fields (even if the module doesn't actively cover BT, these fields are present in the data)
    bt_docno VARCHAR(50), -- Bill Transfer Document Number
    bt_date DATE, -- Bill Transfer Date
    bill_cust_id INTEGER, -- Billed Customer ID for BT
    bill_ship_to_id INTEGER, -- Billed Ship-To ID for BT
    asset_depot_id INTEGER, -- Asset Depot ID for BT
    bt_tot_cst NUMERIC(18, 2), -- Bill Transfer Total Central GST
    bt_tot_sgst NUMERIC(18, 2), -- Bill Transfer Total State GST
    bt_tot_igst NUMERIC(18, 2), -- Bill Transfer Total Integrated GST
    bt_taxable_amt NUMERIC(18, 2), -- Bill Transfer Taxable Amount
    bt_amount NUMERIC(18, 2), -- Bill Transfer Amount
    bt_percentage NUMERIC(5, 2), -- Bill Transfer Percentage
    bt_roundup NUMERIC(18, 2), -- Bill Transfer Rounding Off Amount
    bt_complete BOOLEAN DEFAULT FALSE, -- Bill Transfer completion status (TRUE if complete)
    -- Document Paths
    inv_path TEXT, -- Path to the stored invoice document file
    signed_inv_path TEXT, -- Path to the signed invoice document file
    -- Communication Status
    email_sent_to_cust BOOLEAN DEFAULT FALSE, -- Status of email sent to customer (TRUE if sent)
    FOREIGN KEY (inv_id) REFERENCES invoice_master (id),
    FOREIGN KEY (cust_id) REFERENCES customers (id),
    FOREIGN KEY (wo_id) REFERENCES work_order_master (id),
    FOREIGN KEY (bill_cust_id) REFERENCES customers (id),
    FOREIGN KEY (added_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
    FOREIGN KEY (signed_by) REFERENCES users (id),
    FOREIGN KEY (deleted_by) REFERENCES users (id)
  );

-- Transaction history
CREATE TABLE
  IF NOT EXISTS "invoice_tran_history" (
    id SERIAL PRIMARY KEY,
    inv_tran_id INTEGER NOT NULL, -- Foreign key: invoice_tran(id)
    inv_id INTEGER NOT NULL, -- Foreign key: invoice_master(id)
    inv_sr_no INTEGER NOT NULL,
    asset_id INTEGER NOT NULL,
    work_type_id INTEGER NOT NULL, -- Foreign key: common_master(id) or similar, from "Step 2: dropdown from work type based on asset_type = component_for and invoice_for"
    start_date TIMESTAMP NOT NULL, -- From "Step 3: Enter start_date and end_date also for multi"
    end_date TIMESTAMP NOT NULL, -- From "Step 3: Enter start_date and end_date also for multi"
    quantity DECIMAL(10, 2) NOT NULL, -- From "Step 5: quantity"
    unit INTEGER NOT NULL, -- Foreign key: common_master(id) for units, from "Step 5: unit"
    rate DECIMAL(10, 2) NOT NULL, -- From "Step 5: rate" (this can be daily, monthly, or hourly rate based on Step 4 and 2)
    taxable_amount DECIMAL(18, 2) NOT NULL, -- From "Step 5: taxable_amount"
    cgst_percentage DECIMAL(5, 2), -- From "Step 5: cgst %" (based on Step 3)
    cgst_amount DECIMAL(18, 2), -- From "Step 5: cgst A" (based on Step 3)
    sgst_percentage DECIMAL(5, 2), -- From "Step 5: sgst %" (based on Step 3)
    sgst_amount DECIMAL(18, 2), -- From "Step 5: sgst A" (based on Step 3)
    igst_percentage DECIMAL(5, 2), -- From "Step 5: igst %" (based on Step 3)
    igst_amount DECIMAL(18, 2), -- From "Step 5: igst A" (based on Step 3)
    amount DECIMAL(18, 2) NOT NULL, -- From "Step 5: amount = taxable_amount + (cgst A + sgst A + igst A)"
    remarks TEXT, -- From "step 6: Remarks if any"
    added_by INTEGER NOT NULL,
    add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INTEGER,
    update_date TIMESTAMP,
    -- Foreign Keys
    FOREIGN KEY (inv_tran_id) REFERENCES invoice_tran (id)
    FOREIGN KEY (inv_id) REFERENCES invoice_master (id),
    FOREIGN KEY (asset_id) REFERENCES assets (id),
    FOREIGN KEY (work_type_id) REFERENCES common_master (id), -- Assuming common_master holds work types
    FOREIGN KEY (unit) REFERENCES common_master (id), -- Assuming common_master holds unit types
    FOREIGN KEY (added_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
  );