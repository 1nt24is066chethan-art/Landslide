import pandas as pd
import re

INPUT = "data/processed/ner_landslides.csv"
OUTPUT = "data/processed/ner_landslides_exact_dates.csv"

df = pd.read_csv(INPUT)

# Only the 8 NER states
ner_states = [
    "Arunachal Pradesh", "Assam", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Sikkim", "Tripura"
]

df = df[df["State"].isin(ner_states)].copy()

# Match a single calendar date anywhere in History.
pattern = re.compile(
    r'(?<!\d)(\d{1,2})\s+'
    r'(January|February|March|April|May|June|July|August|September|October|November|December)'
    r'\s+(\d{4})(?!\d)',
    re.IGNORECASE
)

def extract_date(value):
    if pd.isna(value):
        return None

    text = str(value)

    matches = pattern.findall(text)

    # Only accept records containing EXACTLY ONE full date.
    if len(matches) != 1:
        return None

    day, month, year = matches[0]

    try:
        return pd.to_datetime(
            f"{day} {month} {year}",
            format="%d %B %Y"
        ).strftime("%Y-%m-%d")
    except:
        return None

df["event_date"] = df["History"].apply(extract_date)

exact = df[df["event_date"].notna()].copy()

exact.to_csv(OUTPUT, index=False)

print("Clean NER records:", len(df))
print("Exact-date records:", len(exact))
print("Saved:", OUTPUT)
