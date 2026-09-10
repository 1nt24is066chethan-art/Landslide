import pdfplumber
import csv
import os
import json

pdf_path = "data/raw/gsi_landslide_inventory.pdf"
output_path = "data/raw/gsi_landslides_full.csv"
checkpoint_path = "data/raw/extraction_checkpoint.json"

# 11 required output columns
EXPECTED_COLUMNS = [
    "Sl.No.",
    "Slide_No",
    "State",
    "District",
    "Slide_Name",
    "NH_SH_Location",
    "Latitude",
    "Longitude",
    "Material_Involved",
    "Movement_Type",
    "History"
]

# Header row identifiers to skip
HEADER_ROW_MARKERS = [None, "Sl.No.", "LANDSLIDE INVENTORY (Field validated)"]


def load_checkpoint():
    """Load the last successfully written page number from checkpoint file.

    Returns 0 if no checkpoint exists (fresh start).
    """
    if not os.path.exists(checkpoint_path):
        return 0
    try:
        with open(checkpoint_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("last_written_page", 0)
    except (json.JSONDecodeError, KeyError, IOError):
        return 0


def save_checkpoint(last_page):
    """Save the last successfully written page number to checkpoint file.

    This enables resumability: if the script is interrupted, rerunning
    will continue from the next page rather than starting over.

    The checkpoint is saved AFTER the CSV write for that page succeeds,
    so a page with zero valid rows is still marked as successfully processed.
    """
    data = {"last_written_page": last_page}
    with open(checkpoint_path, "w", encoding="utf-8") as f:
        json.dump(data, f)


def extract_page_valid_rows(page):
    """Extract valid data rows from a single PDF page.

    Parameters:
        page: pdfplumber Page object

    Returns:
        valid_rows: list of valid row lists (each 11 columns)
    """
    tables = page.extract_tables()
    if not tables:
        return []

    table = tables[0]
    valid_rows = []

    for row in table:
        # Skip title/header rows
        if not row or row[0] in HEADER_ROW_MARKERS:
            continue

        # Require exactly 11 columns
        if len(row) != 11:
            continue

        # Require valid numeric Sl.No. (first column)
        slide_no_raw = row[0].strip() if row[0] else ""
        if not slide_no_raw or not slide_no_raw.isdigit():
            continue

        valid_rows.append(row)

    return valid_rows


def write_rows_to_csv(rows, output_path, file_already_opened):
    """Write rows to the CSV file.

    Handles writing headers on first write, then appending data rows.
    Returns True if the file was opened (for subsequent append mode).

    Important: This function ensures CSV writes succeed before the caller
    advances the checkpoint. If no rows are provided, the file state is
    unchanged but the function still returns the current file_opened status.
    """
    file_opened = file_already_opened

    if not file_opened:
        # First time: open with "w" mode, write headers, then data rows
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            # Write headers
            writer.writerow(EXPECTED_COLUMNS)
            # Write all valid rows from this page
            for row in rows:
                writer.writerow(row)
        file_opened = True
    elif rows:
        # Subsequent pages: open in append mode
        with open(output_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            for row in rows:
                writer.writerow(row)

    return file_opened


def main():
    """Main extraction function processing all 904 pages sequentially."""
    rows_written_total = 0
    duplicates_total = 0
    global_duplicates_total = 0
    within_page_duplicates_total = 0
    seen_slide_nos_global = set()  # track ALL Slide_No values across every page

    # Load checkpoint for resumability
    last_written_page = load_checkpoint()
    print(f"Checkpoint: last written page = {last_written_page}")

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages in PDF: {total_pages}")

        # Start from the page after the checkpoint
        # If checkpoint is at page 5, start from page 6
        start_page = last_written_page + 1
        if start_page < 1:
            start_page = 1

        # Track file state for incremental writing
        file_opened = False

        for page_number in range(start_page, total_pages + 1):
            page = pdf.pages[page_number - 1]

            # Step 1: Extract valid rows from this page
            valid_rows = extract_page_valid_rows(page)

            # Step 2: Detect duplicates globally across all previously seen Slide_No values
            page_duplicates = []
            for row in valid_rows:
                slide_no_raw = row[0].strip() if row[0] else ""
                if slide_no_raw:
                    slide_no = int(slide_no_raw.strip())
                    is_dup = slide_no in seen_slide_nos_global
                    if is_dup:
                        page_duplicates.append(row)
                        global_duplicates_total += 1
                    seen_slide_nos_global.add(slide_no)

            # Step 3: Write valid rows to CSV (ensures write succeeds before checkpoint advance)
            file_opened = write_rows_to_csv(valid_rows, output_path, file_opened)

            # Step 4: ONLY after CSV write succeeds (or no rows to write), update checkpoint
            # A page with zero valid rows is still marked as successfully processed
            save_checkpoint(page_number)

            # Count duplicates (total across all pages)
            duplicates_total += len(page_duplicates)
            if page_duplicates:
                global_dups = [row[0].strip() for row in page_duplicates if row[0]]
                print(f"  Page {page_number}: {len(page_duplicates)} duplicate Slide_No(s) detected")

            # Progress reporting
            if page_number % 10 == 0 or page_number == total_pages:
                print(f"Processing page {page_number}/{total_pages}")
                print(f"  Records extracted so far: {rows_written_total}")

        # Final summary
    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE")
    print("=" * 60)
    print(f"Total pages processed: {total_pages - last_written_page}")
    print(f"Records extracted: {rows_written_total}")
    print(f"Total duplicate Slide_No values: {duplicates_total}")
    print(f"  - Global duplicates (seen on previous pages): {global_duplicates_total}")
    print(f"  - Within-page duplicates: {within_page_duplicates_total}")
    print(f"Output saved to: {output_path}")
    print(f"Checkpoint file: {checkpoint_path}")

    # Clean up checkpoint on successful completion (optional)
    # os.remove(checkpoint_path)


if __name__ == "__main__":
    main()