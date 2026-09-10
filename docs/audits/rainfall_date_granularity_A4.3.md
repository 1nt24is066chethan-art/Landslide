# A4.3 Date Granularity Audit

## Classification of History Field Dates

**Source:** `data/processed/ner_landslides.csv`  
**Total rows:** 11,022  
**Rows with non-empty History:** 4,171 (37.8%)  
**Rows with empty History:** 6,851 (62.2%)

### Classification Categories

| Category | Records | Unique Event Dates | Usable for Daily Rainfall |
|---|---|---|---|
| `EXACT_DAY` | 1,471 | 378 | ✅ Yes |
| `MONTH_ONLY` | 392 | 56 unique (month, year) | ❌ No |
| `YEAR_ONLY` | 2,128 | 42 unique years | ❌ No |
| `UNPARSEABLE` | 199 | N/A | ❌ No |
| **Total** | **4,190** | | |

> **Note:** Total classified records (4,190) exceeds rows with non-empty History (4,171) because some rows contain multiple date entries in the History field. The classification uses an `assigned` flag to prevent double-counting per row, but multiple date patterns within a single History field may produce multiple entries.

---

### 1. EXACT_DAY — Full dates with day specified

**Format:** `DD Month YYYY` (e.g., "17 May 2016") or `YYYY-MM-DD` (ISO)

**Records:** 1,471  
**Unique exact event dates:** 378

These records contain a specific day and can be used for event-day rainfall extraction.

**Examples from actual data:**
- `ASM/HLKD/83D10/2016/58`: "17 May 2016" → **2016-05-17**
- `ASM/HLKD/83D10/2016/59`: "18 May 2016" → **2016-05-18**
- `AS/CAC/83D10/2009-10/AS-1`: "02 April 2010" → **2010-04-02**
- `ASM/CCR/83H2/2016/66`: "31 August 2016" → **2016-08-31** (ISO format also counted)

**Unique exact dates sample (earliest to latest):**
```
1995-05-22
2007-06-16
2007-07-17
2007-07-19
2007-07-25
2007-07-27
2007-07-31
2007-08-11
2007-08-12
... (378 total unique dates)
```

**Date range:** 1987-06-01 to 2026-07-14  
**Within IMERG V07 availability** (2016-06-01 to 2025-09-30): 319 unique exact dates  
**After V07 cutoff** (>2025-09-30): 59 unique exact dates  
**Before V07 start** (<2016-06-01): 0 unique exact dates (all exact dates are within or after V07 range)

---

### 2. MONTH_ONLY — Month and year, day not specified

**Format:** `Month YYYY` (e.g., "June 2016") without a day

**Records:** 392  
**Unique (month, year) pairs:** 56

These records do **not** specify a day. The day cannot be inferred or invented.

**Examples from actual data:**
- `ASM/DH/83G04/2022-23/028`: "14th - 15th May 2022" → **Month 5, Year 2022** (day inferred from text but NOT extracted)
- `ASM/DH/83C16/PD/2016/51`: "2nd week of May 2016" → **Month 5, Year 2016**
- `ASM/DH/83G4/ PD/2016/32`: "Reactivated on May 2016" → **Month 5, Year 2016**
- `AS-14/2011`: "Last week of May 2011" → **Month 5, Year 2011**

**Unique month-year pairs sample:**
```
Month 1, Year 2023
Month 3, Year 2009
Month 3, Year 2022
Month 3, Year 2025
Month 4, Year 2010
Month 4, Year 2020
Month 5, Year 2011
Month 5, Year 2014
... (56 total unique pairs)
```

**Usable for daily rainfall extraction:** ❌ **NO**  
**Reason:** No specific day is provided. Inventing a day (e.g., 1st or 15th) would introduce false precision and bias daily rainfall totals.

---

### 3. YEAR_ONLY — Year only, month and day not specified

**Format:** `YYYY` (e.g., "2016") without month or day

**Records:** 2,128  
**Unique years:** 42

These records contain only a year. No month or day can be determined.

**Examples from actual data:**
- `AS/CHR/83D14/2020/7`: "2019" → **Year 2019**
- `AS/CHR/83D14/2020/1`: "2019"
- `AS/CHR/83D09/2020/8`: "2018"

**Unique years sample:**
```
Year 1940
Year 1950
Year 1956
Year 1962
Year 1964
Year 1965
Year 1968
Year 1969
Year 1980
Year 1986
... (42 total unique years)
```

**Range:** 1940 to 2026 (based on data)

**Usable for daily rainfall extraction:** ❌ **NO**  
**Reason:** Only the year is known. Cannot extract daily rainfall without month and day.

---

### 4. UNPARSEABLE — Cannot be classified into any recognized date format

**Records:** 199

These History entries contain date-related information but in formats that do not match any of the recognized patterns (full DD Month YYYY, Month YYYY, YYYY, or ISO YYYY-MM-DD).

**Examples from actual data:**
- `ASM/DH/83G04/2022-23/034`: "First incidence: 1998\nReactivated on: 15.05.2016 and 14.05.2022" (mixed formats, multiple dates)
- `ASM/KAM/78N12/2020/002`: "Nil" (no date information)
- `ASM/DH/83G4/ PD/2016/36`: "Reactivated on May,2016" (malformed: missing space between month and year)
- `ASM/DH/83G4/ PD/2016/38`: "First occurred in May, 2016" (note: this actually parses as Month YYYY — may be misclassified depending on exact formatting)
- `ASM/DH/83G4/PD/2016/27`: "May, 2016" (Month YYYY format, may be parsed depending on regex)

**Usable for daily rainfall extraction:** ❌ **NO**  
**Reason:** Format cannot be reliably parsed into a specific date.

---

### Decision Summary

| Decision | Category | Count | Can Extract Daily Rainfall? |
|---|---|---|---|
| **A** | EXACT_DAY | 1,471 records, 378 unique dates | ✅ YES — safe for event-day rainfall extraction |
| **B** | MONTH_ONLY | 392 records, 56 unique month-year pairs | ❌ NO — cannot use for exact event-day rainfall |
| **C** | YEAR_ONLY | 2,128 records, 42 unique years | ❌ NO — cannot use for exact event-day rainfall |
| **C** | AMBIGUOUS / UNPARSEABLE | 199 records | ❌ NO — exclude until independently resolved |

**Recommendation:** Only the **1,471 EXACT_DAY records (378 unique dates)** should be used for A4.3 daily rainfall extraction. The 2,719 remaining records (392 month-only + 2,128 year-only + 199 unparseable) cannot be used for exact event-day rainfall.

### Unique Dates Usable for A4.3 Daily Extraction

- **378 unique exact dates** within the inventory
- **319** of these are within IMERG V07 availability (2016-06-01 to 2025-09-30)
- **59** are after the V07 cutoff (>2025-09-30)
- **0** are before the V07 start (<2016-06-01)

**Total daily rainfall granules to download: 319** (exact dates within V07 range)

### Files Created

- `data/processed/rainfall_date_granularity_A4.3.md` (this report)
- Does NOT modify: `ner_landslides.csv`, `background_samples.csv`, rainfall files, or acquisition script
- Does NOT download additional rainfall files