import csv
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen


RTI_URL = "https://rtionline.gov.in/request/allpa.php"
CPGRAMS_NODAL_URL = "https://pgportal.gov.in/Home/NodalPgOfficers"
CPGRAMS_APPEAL_URL = "https://pgportal.gov.in/Home/NodalAuthorityForAppeal"

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def fetch(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 civic-route-prototype data fetcher",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urlopen(request, timeout=45) as response:
        return response.read().decode("utf-8", errors="replace")


class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        text = " ".join(data.replace("\xa0", " ").split())
        if text:
            self.parts.append(text)


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.current_table = None
        self.current_row = None
        self.current_cell = None
        self.in_table = False
        self.in_row = False
        self.in_cell = False

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.in_table = True
            self.current_table = []
        elif self.in_table and tag == "tr":
            self.in_row = True
            self.current_row = []
        elif self.in_table and self.in_row and tag in {"th", "td"}:
            self.in_cell = True
            self.current_cell = []

    def handle_endtag(self, tag):
        if tag in {"th", "td"} and self.in_cell:
            text = " ".join(" ".join(self.current_cell).replace("\xa0", " ").split())
            self.current_row.append(text)
            self.current_cell = None
            self.in_cell = False
        elif tag == "tr" and self.in_row:
            if self.current_row:
                self.current_table.append(self.current_row)
            self.current_row = None
            self.in_row = False
        elif tag == "table" and self.in_table:
            if self.current_table:
                self.tables.append(self.current_table)
            self.current_table = None
            self.in_table = False

    def handle_data(self, data):
        if self.in_cell and self.current_cell is not None:
            self.current_cell.append(data)


class RtiTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current_row = None
        self.current_text = None
        self.in_td = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "tr" and "data-id" in attrs:
            self.current_row = {
                "level": attrs.get("data-level", ""),
                "source_id": attrs.get("data-id", ""),
                "parent_source_id": attrs.get("data-parent", ""),
                "name": "",
            }
        elif tag == "td" and self.current_row is not None:
            self.in_td = True
            self.current_text = []

    def handle_endtag(self, tag):
        if tag == "td" and self.in_td and self.current_row is not None:
            text = " ".join(" ".join(self.current_text).replace("\xa0", " ").split())
            self.current_row["name"] = text
            self.current_text = None
            self.in_td = False
        elif tag == "tr" and self.current_row is not None:
            if self.current_row["name"]:
                self.rows.append(self.current_row)
            self.current_row = None

    def handle_data(self, data):
        if self.in_td and self.current_text is not None:
            self.current_text.append(data)


def parse_rti_public_authorities(html: str):
    total = None
    match = re.search(r"Total\s*-\s*(\d+)", html)
    if match:
        total = int(match.group(1))

    parser = RtiTableParser()
    parser.feed(html)
    child_parent_ids = {row["parent_source_id"] for row in parser.rows if row["parent_source_id"]}
    rows = []
    for index, row in enumerate(parser.rows, start=1):
        has_children = row["source_id"] in child_parent_ids
        rows.append(
            {
                "serial_no": index,
                "name": row["name"],
                "level": row["level"],
                "source_id": row["source_id"],
                "parent_source_id": row["parent_source_id"],
                "has_children": "yes" if has_children else "no",
                "is_leaf_authority": "no" if has_children else "yes",
            }
        )

    return total, rows


def parse_cpgrams_table(html: str):
    parser = TableParser()
    parser.feed(html)
    if not parser.tables:
        return []

    table = max(parser.tables, key=len)
    rows = []
    for row in table:
        if len(row) < 2:
            continue
        if row[0].lower().startswith("s.no"):
            continue
        if not row[0].strip().isdigit():
            continue
        padded = row + [""] * (5 - len(row))
        rows.append(
            {
                "serial_no": padded[0],
                "ministry_department_organisation": padded[1],
                "officer_name_designation": padded[2],
                "address": padded[3],
                "phone_fax_email": padded[4],
            }
        )
    return rows


def write_csv(path: Path, fieldnames, rows):
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def normalise_org_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()


def main():
    DATA.mkdir(exist_ok=True)
    fetched_at = datetime.now(timezone.utc).isoformat()

    rti_html = fetch(RTI_URL)
    rti_total, rti_parsed_rows = parse_rti_public_authorities(rti_html)
    rti_rows = []
    for row in rti_parsed_rows:
        rti_rows.append(
            {
                "portal": "RTI Online",
                **row,
                "source_url": RTI_URL,
                "fetched_at_utc": fetched_at,
            }
        )
    write_csv(
        DATA / "rti_public_authorities.csv",
        [
            "portal",
            "serial_no",
            "name",
            "level",
            "source_id",
            "parent_source_id",
            "has_children",
            "is_leaf_authority",
            "source_url",
            "fetched_at_utc",
        ],
        rti_rows,
    )

    rti_top_level_rows = [row for row in rti_rows if row["level"] == "0"]
    write_csv(
        DATA / "rti_top_level_authorities.csv",
        [
            "portal",
            "serial_no",
            "name",
            "level",
            "source_id",
            "parent_source_id",
            "has_children",
            "is_leaf_authority",
            "source_url",
            "fetched_at_utc",
        ],
        rti_top_level_rows,
    )

    cpgrams_html = fetch(CPGRAMS_NODAL_URL)
    cpgrams_rows = parse_cpgrams_table(cpgrams_html)
    for row in cpgrams_rows:
        row["portal"] = "CPGRAMS"
        row["source_url"] = CPGRAMS_NODAL_URL
        row["fetched_at_utc"] = fetched_at
    write_csv(
        DATA / "cpgrams_nodal_pg_officers.csv",
        [
            "portal",
            "serial_no",
            "ministry_department_organisation",
            "officer_name_designation",
            "address",
            "phone_fax_email",
            "source_url",
            "fetched_at_utc",
        ],
        cpgrams_rows,
    )

    appeal_html = fetch(CPGRAMS_APPEAL_URL)
    appeal_rows = parse_cpgrams_table(appeal_html)
    for row in appeal_rows:
        row["portal"] = "CPGRAMS Appeal"
        row["source_url"] = CPGRAMS_APPEAL_URL
        row["fetched_at_utc"] = fetched_at
    write_csv(
        DATA / "cpgrams_appeal_authorities.csv",
        [
            "portal",
            "serial_no",
            "ministry_department_organisation",
            "officer_name_designation",
            "address",
            "phone_fax_email",
            "source_url",
            "fetched_at_utc",
        ],
        appeal_rows,
    )

    cpgrams_org_index = {}
    for row in cpgrams_rows:
        name = row["ministry_department_organisation"]
        key = normalise_org_name(name)
        cpgrams_org_index.setdefault(
            key,
            {
                "name": name,
                "in_cpgrams_nodal_pg": "no",
                "in_cpgrams_appeal": "no",
                "nodal_source_url": CPGRAMS_NODAL_URL,
                "appeal_source_url": CPGRAMS_APPEAL_URL,
                "fetched_at_utc": fetched_at,
            },
        )
        cpgrams_org_index[key]["in_cpgrams_nodal_pg"] = "yes"

    for row in appeal_rows:
        name = row["ministry_department_organisation"]
        key = normalise_org_name(name)
        cpgrams_org_index.setdefault(
            key,
            {
                "name": name,
                "in_cpgrams_nodal_pg": "no",
                "in_cpgrams_appeal": "no",
                "nodal_source_url": CPGRAMS_NODAL_URL,
                "appeal_source_url": CPGRAMS_APPEAL_URL,
                "fetched_at_utc": fetched_at,
            },
        )
        cpgrams_org_index[key]["in_cpgrams_appeal"] = "yes"

    cpgrams_org_rows = sorted(cpgrams_org_index.values(), key=lambda row: row["name"].lower())
    write_csv(
        DATA / "cpgrams_organisations.csv",
        [
            "name",
            "in_cpgrams_nodal_pg",
            "in_cpgrams_appeal",
            "nodal_source_url",
            "appeal_source_url",
            "fetched_at_utc",
        ],
        cpgrams_org_rows,
    )

    summary = DATA / "government_portal_registry_summary.md"
    summary.write_text(
        "\n".join(
            [
                "# Government Portal Registry Data",
                "",
                f"Fetched at UTC: `{fetched_at}`",
                "",
                "## Sources",
                "",
                f"- RTI Online public authorities: {RTI_URL}",
                f"- CPGRAMS nodal public grievance officers: {CPGRAMS_NODAL_URL}",
                f"- CPGRAMS nodal authority for appeal: {CPGRAMS_APPEAL_URL}",
                "",
                "## Counts",
                "",
                f"- RTI Online hierarchy rows parsed: **{len(rti_rows)}**",
                f"- RTI Online source-reported total: **{rti_total or 'not found'}**",
                f"- RTI Online top-level authority rows parsed: **{len(rti_top_level_rows)}**",
                f"- CPGRAMS nodal PG organisations parsed: **{len(cpgrams_rows)}**",
                f"- CPGRAMS appeal organisations parsed: **{len(appeal_rows)}**",
                f"- CPGRAMS unique organisations parsed: **{len(cpgrams_org_rows)}**",
                "",
                "## Output Files",
                "",
                "- `data/rti_public_authorities.csv`",
                "- `data/rti_top_level_authorities.csv`",
                "- `data/cpgrams_nodal_pg_officers.csv`",
                "- `data/cpgrams_appeal_authorities.csv`",
                "- `data/cpgrams_organisations.csv`",
                "",
                "Note: RTI Online lists public authorities, which include ministries, departments, attached offices, PSUs, institutions, and field offices. CPGRAMS lists ministry/department/organisation-level grievance nodal officers and appeal authorities.",
                "",
            ]
        ),
        encoding="utf-8",
    )

    print(f"RTI rows: {len(rti_rows)}; source total: {rti_total}")
    print(f"CPGRAMS nodal rows: {len(cpgrams_rows)}")
    print(f"CPGRAMS appeal rows: {len(appeal_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
