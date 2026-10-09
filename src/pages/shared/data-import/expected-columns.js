// Columns of the existing Procare export for each CSV file type, taken from the
// header row of the reference files the backend ships in storage/app/procare-csv.
// Keep in sync with the backend.
export const EXPECTED_COLUMNS = {
  procare: [
    "Account ID", "Account Key", "Is Hidden", "Account Comment", "Account Alert", "Person ID", "Person Type",
    "Person Sort ID", "Primary Classroom", "Classroom ID", "Classroom Sort ID", "Full Name", "Last Name",
    "First Name", "Middle Initial", "Identification Number", "Date of Birth", "Gender", "Email", "Text Email",
    "Photo", "Person Comment", "KES Code", "Address Type", "Add 1, Line 1", "Add 1, Line 2", "Add 1, City",
    "Add 1, Region", "Add 1, Postal Code", "Add 1, Comment", "Add 1, Is Mailing", "Add 1, Is Physical",
    "Add 2, Line 1", "Add 2, Line 2", "Add 2, City", "Add 2, Region", "Add 2, Postal Code", "Add 2, Comment",
    "Add 2, Is Mailing", "Add 2, Is Physical", "Phone 1", "Phone 2", "Phone 3", "Phone 4", "Phone 5",
  ],
  students: [
    "Child ID", "Person ID", "Person Type", "Full Name", "Last Name", "First Name", "Middle Initial",
    "Identification Number", "Date of Birth", "Month of Birth", "Year of Birth", "Age", "Gender", "Email",
    "Text Email", "Comment", "Photo", "KES Code", "Primary Classroom", "Classroom ID", "Classroom Sort ID",
    "Enrollment Status", "Status Start Date", "Status End Date", "Days Enrolled", "Add 1, Line 1", "Add 1, Line 2",
    "Add 1, City", "Add 1, Region", "Add 1, Postal Code", "Add 1, Comment", "Add 1, Is Mailing",
    "Add 1, Is Physical", "Add 2, Line 1", "Add 2, Line 2", "Add 2, City", "Add 2, Region", "Add 2, Postal Code",
    "Add 2, Comment", "Add 2, Is Mailing", "Add 2, Is Physical", "Phone 1", "Phone 2", "Relationship 1 Id",
    "Relationship 1 Type", "Relationship 1 First Name", "Relationship 1 Last Name", "Relationship 2 Id",
    "Relationship 2 Type", "Relationship 2 First Name", "Relationship 2 Last Name", "Relationship 3 Id",
    "Relationship 3 Type", "Relationship 3 First Name", "Relationship 3 Last Name", "Row ID",
  ],
  employees: [
    "Employee ID", "Is Hidden", "Full Name", "Last Name", "First Name", "Middle Initial", "ID Number", "Visible SSN",
    "Person ID", "Date of Birth", "Month of Birth", "Year of Birth", "Age", "Age-Year", "Primary Work Area",
    "Work Area ID", "Work Area Sort ID", "Employment Status", "Status Date", "Category Description",
    "Catogory Sort ID", "Item Description", "Item Sort ID",
  ],
  ledger: [
    "Account ID", "Account Key", "Is Hidden", "Person ID", "Full Name", "Last Name", "First Name",
    "Identification Number", "Middle Initial", "Ledger Card", "Ledger Card ID", "Ledger Card Sort ID", "Identifier",
    "Post Date", "Description", "Description ID", "Description Sort ID", "GL Account", "Comment", "Amount",
    "Void ID", "Creation Date",
  ],
  billing: [
    "School Code", "School Name", "School ID", "School Sort ID", "Account ID", "Account Key", "Primary Payer Name",
    "Child ID", "Child Name", "Primary Classroom", "Date of Birth", "Ledger", "Cycle", "Charge/Credit Description",
    "Amount", "Comment",
  ],
  billing_box: [
    "School Code", "School Name", "School ID", "School Sort ID", "Account ID", "Account Key", "Primary Payer Name",
    "Child ID", "Child Name", "Primary Classroom", "Date of Birth", "Ledger", "Cycle", "Charge/Credit Description",
    "Amount", "Comment", "Status Date", "Enrollment Status",
  ],
  enrollment: [
    "Full Name", "Enrollment Status", "Status Date", "Category Description", "Item Description",
  ],
  timeclock: [
    "Classroom", "Classroom ID", "Classroom Sort ID", "Full Name", "Last Name", "First Name", "Middle Initial",
    "Child ID", "Child Person ID", "Date of Birth", "Month of Birth", "Year of Birth", "Checked In By",
    "Checked In By Initials", "Checked In By Person ID", "Punch In Date/Time", "Punch In Date", "Punch In Time",
    "Punch In Date/Time Rounded", "Punch In Date Rounded", "Punch In Time Rounded",
  ],
  timecard: [
    "Full Name", "Last Name", "First Name", "Middle Initial", "Identification Number", "Child ID", "Person ID",
    "Date of Birth", "Month of Birth", "Year of Birth", "Classroom", "Classroom ID", "Classroom Sort ID",
    "Checked In By", "Checked In By Initials", "Punch In Date/Time", "Punch In Date", "Punch In Time",
    "Punch In Date/Time Rounded", "Punch In Date Rounded", "Punch In Time Rounded", "Checked Out By",
    "Checked Out By Initials", "Punch Out Date/Time", "Punch Out Date", "Punch Out Time",
    "Punch Out Date/Time Rounded", "Punch Out Date Rounded", "Punch Out Time Rounded", "Department ID",
    "Department Name",
  ],
  logsheet: [
    "Child ID", "Person ID", "Full Name", "Last Name", "First Name", "Middle Initial", "Date of Birth",
    "Month of Birth", "Year of Birth", "Classroom", "Classroom ID", "Classroom Sort ID", "Author", "Original Entry",
    "Last Modified", "Comment Type", "Restricted", "Comment",
  ],
  accountinfo: [
    "Account Key", "Is Hidden", "Comment", "Alert", "Person ID", "Full Name", "Last Name", "First Name",
    "Middle Initial", "Identification Number", "Account ID", "My Procare Account Re Reg Date",
  ],
  scholarship: [
    "FirstName", "LastName", "Status", "DatePaid", "BusinessInvoiceNumber", "LineItemNumber", "PurchaseAmount",
    "PurchaseDate", "CategoryDetailName", "CategoryNumber", "GeneralLedgerAccount", "ServiceType",
    "IndividualProviderName", "ServicePeriodStartDate", "ServicePeriodEndDate", "StudentSequenceNumber",
    "TipaltiPaymentNumber", "InvoiceDate", "ProgramName",
  ],
};

// Columns a row cannot be imported without (ProcareSingleCsvImportService skips
// rows where these are empty).
export const MANDATORY_COLUMNS = {
  procare: ["Person ID"],
  students: ["Child ID", "Person ID"],
  employees: ["Employee ID", "Person ID"],
  ledger: ["Account ID"],
  billing: ["Account ID"],
  billing_box: ["Account ID"],
  enrollment: ["Full Name"],
  timeclock: ["Child ID"],
  timecard: ["Child ID"],
  logsheet: ["Child ID"],
  accountinfo: ["Account ID"],
  scholarship: ["FirstName", "LastName"],
};

const normalize = (name) => String(name || "").trim().toLowerCase().replace(/\s+/g, " ");

// Pairs each existing column with the import sheet column of the same name.
// Returns { [existingColumn]: importHeaderIndex | -1 }.
export const autoMapColumns = (existingColumns, importHeaders) => {
  const used = new Set();
  const mapping = {};
  existingColumns.forEach((column) => {
    const idx = importHeaders.findIndex((h, i) => !used.has(i) && normalize(h) === normalize(column));
    if (idx !== -1) used.add(idx);
    mapping[column] = idx;
  });
  return mapping;
};
