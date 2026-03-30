def build_tags(row):
    tags = set()

    sub = str(row["subcategory"]).lower()

    # Cultura
    if sub in ["museum", "gallery", "library", "theatre", "arts_centre", "conservatory"]:
        tags.add("culture")
        tags.add("indoor")

    # Histórico
    if sub in ["monument", "ruins", "castle", "memorial", "archaeological_site"]:
        tags.add("historic")
        tags.add("touristic")

    # Religioso
    if sub in ["church", "chapel", "cathedral", "monastery", "synagogue"]:
        tags.add("religious")
        tags.add("historic")

    # Urbano exterior
    if sub in ["square", "fountain", "bridge"]:
        tags.add("outdoor")
        tags.add("urban")

    # Institucional
    if sub in ["embassy", "townhall", "government", "courthouse"]:
        tags.add("institutional")

    # Arte puntual
    if sub == "artwork":
        tags.add("art")
        tags.add("quick_visit")

    # Duración
    dur = row.get("visit_duration", 45)
    if dur <= 20:
        tags.add("quick_visit")
    elif dur >= 90:
        tags.add("long_visit")

    # Horarios
    if row.get("is_24_7", False):
        tags.add("always_open")

    if row.get("has_opening_hours", False):
        tags.add("has_schedule")

    return sorted(tags)