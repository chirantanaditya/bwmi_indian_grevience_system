# Government Portal Registry Data

Fetched at UTC: `2026-08-23T06:45:58.414113+00:00`

## Sources

- RTI Online public authorities: https://rtionline.gov.in/request/allpa.php
- CPGRAMS nodal public grievance officers: https://pgportal.gov.in/Home/NodalPgOfficers
- CPGRAMS nodal authority for appeal: https://pgportal.gov.in/Home/NodalAuthorityForAppeal

## Counts

- RTI Online hierarchy rows parsed: **3114**
- RTI Online source-reported total: **2916**
- RTI Online top-level authority rows parsed: **94**
- CPGRAMS nodal PG organisations parsed: **92**
- CPGRAMS appeal organisations parsed: **88**
- CPGRAMS unique organisations parsed: **174**

## Output Files

- `data/rti_public_authorities.csv`
- `data/rti_top_level_authorities.csv`
- `data/cpgrams_nodal_pg_officers.csv`
- `data/cpgrams_appeal_authorities.csv`
- `data/cpgrams_organisations.csv`

Note: RTI Online lists public authorities, which include ministries, departments, attached offices, PSUs, institutions, and field offices. CPGRAMS lists ministry/department/organisation-level grievance nodal officers and appeal authorities.
