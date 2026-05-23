from database import fetch_all, fetch_one
from scoring import score_from_count, score_to_grade

NOISE_TYPES = ["Noise - Vehicle", "Noise - Residential", "Noise - Street/Sidewalk", "Noise - Commercial"]
CLEAN_TYPES = ["Dirty Conditions", "Missed Collection", "Rodent"]
UTILITY_TYPES = ["ELECTRIC", "HEAT/HOT WATER", "PLUMBING"]
INFRA_TYPES = ["Derelict Vehicle", "Street Condition", "Sidewalk Condition", "Blocked Driveway"]

def placeholders(items):
    return ",".join(["?"] * len(items))

def top_complaints(limit=10):
    return fetch_all(
        """
        SELECT complaint_type, COUNT(*) AS total
        FROM service_requests
        GROUP BY complaint_type
        ORDER BY total DESC
        LIMIT ?
        """,
        (limit,)
    )

def electric_breakdown():
    return fetch_all(
        """
        SELECT descriptor, COUNT(*) AS total
        FROM service_requests
        WHERE complaint_type = 'ELECTRIC'
        GROUP BY descriptor
        ORDER BY total DESC
        """
    )

def search_zip(zip_code: str):
    return fetch_one(
        """
        SELECT incident_zip, borough, COUNT(*) AS total_complaints
        FROM service_requests
        WHERE incident_zip = ?
        GROUP BY incident_zip, borough
        """,
        (zip_code,)
    )

def peak_noise_hours(zip_code: str):
    return fetch_all(
        """
        SELECT created_hour, COUNT(*) AS total
        FROM service_requests
        WHERE incident_zip = ?
          AND complaint_type LIKE '%Noise%'
          AND created_hour IS NOT NULL
        GROUP BY created_hour
        ORDER BY total DESC
        LIMIT 5
        """,
        (zip_code,)
    )

def report_card(zip_code: str):
    rows = fetch_all(
        """
        SELECT
            incident_zip,
            borough,
            SUM(CASE WHEN complaint_type LIKE '%Noise%' THEN 1 ELSE 0 END) AS noise_total,
            SUM(CASE WHEN complaint_type IN ('Dirty Conditions','Missed Collection','Rodent') THEN 1 ELSE 0 END) AS cleanliness_total,
            SUM(CASE WHEN complaint_type IN ('ELECTRIC','HEAT/HOT WATER','PLUMBING') THEN 1 ELSE 0 END) AS utilities_total,
            SUM(CASE WHEN complaint_type IN ('Derelict Vehicle','Street Condition','Sidewalk Condition','Blocked Driveway') THEN 1 ELSE 0 END) AS infrastructure_total,
            COUNT(*) AS total_complaints
        FROM service_requests
        WHERE incident_zip = ?
        GROUP BY incident_zip, borough
        """,
        (zip_code,)
    )
    if not rows:
        return None

    row = rows[0]

    # Find worst ZIP totals for normalization.
    worst = fetch_one(
        """
        SELECT
            MAX(noise_total) AS max_noise,
            MAX(cleanliness_total) AS max_cleanliness,
            MAX(utilities_total) AS max_utilities,
            MAX(infrastructure_total) AS max_infrastructure
        FROM (
            SELECT
                incident_zip,
                SUM(CASE WHEN complaint_type LIKE '%Noise%' THEN 1 ELSE 0 END) AS noise_total,
                SUM(CASE WHEN complaint_type IN ('Dirty Conditions','Missed Collection','Rodent') THEN 1 ELSE 0 END) AS cleanliness_total,
                SUM(CASE WHEN complaint_type IN ('ELECTRIC','HEAT/HOT WATER','PLUMBING') THEN 1 ELSE 0 END) AS utilities_total,
                SUM(CASE WHEN complaint_type IN ('Derelict Vehicle','Street Condition','Sidewalk Condition','Blocked Driveway') THEN 1 ELSE 0 END) AS infrastructure_total
            FROM service_requests
            WHERE incident_zip IS NOT NULL
            GROUP BY incident_zip
        )
        """
    )

    noise_score = score_from_count(row["noise_total"] or 0, worst["max_noise"] or 1)
    cleanliness_score = score_from_count(row["cleanliness_total"] or 0, worst["max_cleanliness"] or 1)
    utilities_score = score_from_count(row["utilities_total"] or 0, worst["max_utilities"] or 1)
    infrastructure_score = score_from_count(row["infrastructure_total"] or 0, worst["max_infrastructure"] or 1)

    overall_score = round((noise_score + cleanliness_score + utilities_score + infrastructure_score) / 4)

    return {
        "zip_code": row["incident_zip"],
        "borough": row["borough"],
        "total_complaints": row["total_complaints"],
        "overall_score": overall_score,
        "overall_grade": score_to_grade(overall_score),
        "categories": {
            "noise": {"score": noise_score, "grade": score_to_grade(noise_score), "complaints": row["noise_total"]},
            "cleanliness": {"score": cleanliness_score, "grade": score_to_grade(cleanliness_score), "complaints": row["cleanliness_total"]},
            "utilities": {"score": utilities_score, "grade": score_to_grade(utilities_score), "complaints": row["utilities_total"]},
            "infrastructure": {"score": infrastructure_score, "grade": score_to_grade(infrastructure_score), "complaints": row["infrastructure_total"]},
        },
        "peak_noise_hours": peak_noise_hours(zip_code)
    }

def quietest_rankings(limit=10):
    return fetch_all(
        """
        SELECT incident_zip, borough, COUNT(*) AS noise_total
        FROM service_requests
        WHERE incident_zip IS NOT NULL
          AND complaint_type LIKE '%Noise%'
        GROUP BY incident_zip, borough
        ORDER BY noise_total ASC
        LIMIT ?
        """,
        (limit,)
    )

def cleanest_rankings(limit=10):
    return fetch_all(
        """
        SELECT incident_zip, borough, COUNT(*) AS cleanliness_total
        FROM service_requests
        WHERE incident_zip IS NOT NULL
          AND complaint_type IN ('Dirty Conditions','Missed Collection','Rodent')
        GROUP BY incident_zip, borough
        ORDER BY cleanliness_total ASC
        LIMIT ?
        """,
        (limit,)
    )

def map_pins(category: str = "noise", limit: int = 500):
    where = "complaint_type LIKE '%Noise%'"
    params = []
    if category == "cleanliness":
        where = "complaint_type IN ('Dirty Conditions','Missed Collection','Rodent')"
    elif category == "utilities":
        where = "complaint_type IN ('ELECTRIC','HEAT/HOT WATER','PLUMBING')"
    elif category == "infrastructure":
        where = "complaint_type IN ('Derelict Vehicle','Street Condition','Sidewalk Condition','Blocked Driveway')"

    params.append(limit)
    return fetch_all(
        f"""
        SELECT unique_key, complaint_type, descriptor, borough, incident_zip, latitude, longitude
        FROM service_requests
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND {where}
        LIMIT ?
        """,
        tuple(params)
    )
