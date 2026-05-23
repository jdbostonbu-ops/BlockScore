def score_to_grade(score: int) -> str:
    if score >= 97:
        return "A+"
    if score >= 93:
        return "A"
    if score >= 90:
        return "A-"
    if score >= 87:
        return "B+"
    if score >= 83:
        return "B"
    if score >= 80:
        return "B-"
    if score >= 77:
        return "C+"
    if score >= 73:
        return "C"
    if score >= 70:
        return "C-"
    if score >= 67:
        return "D+"
    if score >= 63:
        return "D"
    if score >= 60:
        return "D-"
    return "F"

def clamp_score(value: float) -> int:
    return max(0, min(100, round(value)))

def score_from_count(count: int, worst_count: int) -> int:
    if worst_count <= 0:
        return 100
    penalty = (count / worst_count) * 55
    return clamp_score(100 - penalty)
