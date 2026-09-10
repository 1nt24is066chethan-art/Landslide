import pandas as pd
import os

# Paths
raw_csv_path = "data/raw/gsi_landslides_full.csv"
output_dir = "data/processed"
output_csv_path = os.path.join(output_dir, "ner_landslides.csv")

# NER states (exact match)
ner_states = [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura"
]

# 1. Read the raw CSV with pandas (read-only)
df = pd.read_csv(raw_csv_path)

# --- Validation & Reporting ---

# Original row count
original_rows = len(df)
print(f"Original CSV row count: {original_rows}")

# Check which states exist in the raw dataset (beyond the 8 NER states)
all_states = df["State"].value_counts().index.tolist()
non_ner_states = [s for s in all_states if s not in ner_states and str(s).strip() != ""]

# Records per NER state (before filtering)
state_counts_before = df["State"].value_counts()
ner_counts_before = {s: state_counts_before.get(s, 0) for s in ner_states}

print(f"\nRecord count per NER state (in full dataset):")
for state in ner_states:
    count = ner_counts_before[state]
    print(f"  {state}: {count} records")

if non_ner_states:
    print(f"\nStates in raw dataset that are NOT part of NER:")
    for state in non_ner_states:
        print(f"  {state}: {state_counts_before.get(state, 0)} records")
else:
    print("\nNo non-NER states found in raw dataset (all states are NER states).")

# 2. Filter only the eight NER states
# Use .isin() to keep rows where State is exactly one of the NER states
df_ner = df[df["State"].isin(ner_states)].copy()

# Filtered row count
filtered_rows = len(df_ner)
print(f"\nFiltered NER row count: {filtered_rows}")
print(f"Reduction: {original_rows - filtered_rows} records removed (non-NER states)")

# 3. Validate that no non-NER state appears in the output
output_states = df_ner["State"].unique().tolist()
non_ner_in_output = [s for s in output_states if s not in ner_states]

if non_ner_in_output:
    print(f"\nERROR: Non-NER states found in output: {non_ner_in_output}")
    exit(1)
else:
    print("Validation passed: No non-NER states in output.")

# 4. Record count for each NER state in the filtered output
ner_counts_after = df_ner["State"].value_counts()
print(f"\nRecord count per NER state (in output):")
for state in ner_states:
    count = ner_counts_after.get(state, 0)
    print(f"  {state}: {count} records")

# 5. Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# 6. Write the filtered CSV (preserving all 11 columns, no modifications)
df_ner.to_csv(output_csv_path, index=False, encoding="utf-8")

print(f"\nOutput written to: {output_csv_path}")
print(f"Output directory created: {os.path.exists(output_dir)}")

print("\n" + "=" * 50)
print("FILTER COMPLETE - NER-only CSV created successfully")
print("=" * 50)
print("- Original CSV (data/raw/gsi_landslides_full.csv): UNMODIFIED")
print("- NER output (data/processed/ner_landslides.csv): CREATED")
print("- Duplicates PRESERVED (not removed)")
print("- Coordinates PRESERVED (not modified)")
print("- Missing values PRESERVED (not filled/inferred)")