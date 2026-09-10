# A4.4 Rainfall Acquisition Report

## Earth Engine Access Status

**Attempt:** Google Earth Engine Python API access to NASA GPM IMERG V07  
**Collection:** NASA/GPM_IMERG_V07 (and UCSB-CHG/CHIRPS/DAILY as backup)  

**Result: BLOCKED**

**Error:** `EEException: Caller does not have required permission to use project 517222506229. Grant the caller the roles/serviceusage.serviceUsageConsumer role, or a custom role with the serviceusage.services.use permission.`

**Authentication Status:**  
- `earthengine authenticate` succeeded — OAuth token saved successfully  
- `ee.Initialize()` failed — insufficient permissions on Google Cloud project 517222506229  
- This requires Google Cloud IAM role assignment, which would take hours to resolve  

**Time spent on attempted resolution:** ~15 minutes  
**Blocker type:** Google Cloud project permission issue (not authentication/network/environment)  

---

## Alternative Method: Direct NASA GES DISC Download

**Method:** `requests.Session()` with auto-.netrc authentication  
**Status: WORKING** — successfully downloads valid IMERG V07 NetCDF files  

**Test Results (one-date verification):**
- **Date tested:** 2016-06-01
- **URL:** `https://data.gesdisc.earthdata.nasa.gov/data/GPM_L3/GPM_3IMERGDF.07/2016/06/3B-DAY.MS.MRG.3IMERG.20160601-S000000-E235959.V07B.nc4`
- **HTTP Status:** 200
- **Content-Type:** `application/x-troff-ms` (binary NetCDF/HDF5 content)
- **File size:** 32,307,187 bytes
- **xarray validation:** ✅ Successfully opened
- **Dataset dimensions:** (time: 1, lon: 3600, lat: 1800, nv: 2)
- **Precipitation variable:** ✅ Present, units = mm/day
- **Lat range:** -89.95 to 89.95 (0.1° resolution)
- **Lon range:** -179.95 to 179.95 (0.1° resolution)
- **Temporal info:** BeginDate: 2016-06-01, EndDate: 2016-06-01
- ** DOI:** 10.5067/GPM/IMERGDF/DAY/07

**Download method details:**
- `session = requests.Session()` (auto-reads `~/.netrc`)
- `.netrc` contains: `machine data.gesdisc.earthdata.nasa.gov login davivek password g@Z#Mk3TNSk9hX2`
- `session.get(url, timeout=120, allow_redirects=True)`
- Some URLs return `application/x-troff-ms` Content-Type but contain valid binary NetCDF/HDF5 content
- Validation: open with `xr.open_dataset(file, engine='netcdf4')` or `Dataset(file, 'r')`

**Spatial coverage:** Global (lon: -180 to 180, lat: -90 to 90, 0.1° × 0.1° resolution)  
**Temporal coverage:** IMERG V07: 2016-06-01 to 2025-09-30  
**Variable:** precipitation (mm/day)  

---

## 319-Date Acquisition Target

**Source:** GSI landslide inventory EXACT_DAY records  
**Unique exact event dates within V07:** 319  
**Date range:** 2016-06-01 to 2025-09-30  

**Manifest status:** The existing `rainfall_daily_manifest.csv` has 322 rows (all marked validation_failed due to NetCDF validation errors — these were resolved by using xarray for validation instead). The correct target is 319 unique exact dates.

---

## Download Progress (as of this report)

| Metric | Value |
|---|---|
| **Total dates to download:** | 319 |
| **Successfully downloaded:** | 95 |
| **Failed/validation_failed:** | 227 (from old manifest) |
| **Remaining:** | 224 |
| **Disk space occupied:** | 2.84 GB (.nc4 files only) |
| **Download pipeline:** | `requests.Session()` + .netrc auto-auth |
| **Validation method:** | `xr.open_dataset(file, engine='netcdf4')` |

**One-date test result:** ✅ SUCCESS — 2016-06-01 downloaded and validated with xarray, precipitation variable present, units mm/day, lat/lon coordinates correct.

---

## Blocker Report (Earth Engine)

**1. What was attempted:**  
   - `earthengine authenticate` — succeeded, OAuth token saved  
   - `ee.Initialize()` — failed with project permission error  
   - Attempted `ee.Initialize(project='earthengine-legacy')` — same permission error  
   - Tried accessing `NASA/GPM_IMERG_V07` and `UCSB-CHG/CHIRPS/DAILY` collections — all failed without initialization  

**2. Exact method/command:**  
   ```
   earthengine authenticate  # succeeded
   python3 -c "import ee; ee.Initialize()"  # Failed: EEException, no project found
   python3 -c "import ee; ee.Initialize(project='earthengine-legacy')"  # Failed: permission denied
   ```

**3. Exact error:**  
   `EEException: Caller does not have required permission to use project 517222506229. Grant the caller the roles/serviceusage.serviceUsageConsumer role, or a custom role with the serviceusage.services.use permission.`

**4. Likely cause:**  
   - The Earth Engine credentials are associated with Google Cloud project 517222506229  
   - The user/account lacks the `serviceusage.services.use` permission or `serviceusage.serviceUsageConsumer` role  
   - This requires Google Cloud Console IAM configuration  

**5. Whether problem is authentication/network/data/environment:**  
   - Authentication: ✅ Works (token saved successfully)  
   - Network: ✅ Not an issue  
   - Data access: ❌ Blocked at project initialization level  
   - Environment: ❌ Python package works, permission is the blocker  

**6. Whether manual browser download could bypass it:**  
   - Direct HTTP download via `requests.Session()` with .netrc authentication WORKS (verified)  
   - Earth Engine JavaScript API through Colab — would also likely require project setup  

**7. Recommended fastest path forward:**  
   - Proceed with `requests.Session()` + .netrc download method (already verified)  
   - Download 319 daily IMERG V07 granules using the CMR-derived URL pattern  
   - Validate each file with `xarray.open_dataset()` or `netCDF4.Dataset()`  
   - This is the same method that successfully downloaded test files in the A4.3 phase  

---

## Recommendation

**Given the Earth Engine blocker (project permission issue requiring Google Cloud IAM setup), the fastest reliable path is to proceed with the direct NASA GES DISC download method using `requests.Session()` with .netrc authentication.**

This method has been validated:
- ✅ One-date download and xarray validation successful
- ✅ Same pattern used in A4.3 (95 files already downloaded successfully)
- ✅ No OAuth/OAuth-redirect issues
- ✅ .netrc credentials already configured
- ✅ Can complete 319 downloads within 3-day deadline (~2 hours at current rate)

**Next step:** Continue downloading the remaining 224 dates using the working download method. The 95 files already downloaded provide a valid foundation for processing.

**STATUS: IN_PROGRESS — 95/319 dates downloaded, pipeline working**

**FILES CREATED/MODIFIED:**
- `data/processed/rainfall_earth_engine_A4.4.md` (this report)
- `data/processed/rainfall_daily_manifest.csv` (updated: 95 success, 227 failed)
- `data/raw/rainfall/daily/95 valid IMERG V07 NetCDF files`
- `data/processed/rainfall_date_granularity_A4.3.md`
- `data/processed/rainfall_date_audit_A4.3.md`
- `data/processed/rainfall_acquisition_A4.3.md`

**NEXT RECOMMENDED STEP:** Continue downloading remaining 224 dates using `requests.Session()` + .netrc method. Can likely complete within remaining 3-day deadline.