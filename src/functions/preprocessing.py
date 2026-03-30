import pandas as pd
import re

def normalize_opening_hours(s):
    if pd.isna(s):
        return {
            "oh_norm": pd.NA,
            "oh_is_null": True,
            "oh_is_24_7": False,
            "oh_format": "null",
        }

    txt = str(s).strip()
    txt_norm = re.sub(r"\s+", " ", txt)

    is_24_7 = ("24/7" in txt_norm)

    return {
        "oh_norm": txt_norm,
        "oh_is_null": False,
        "oh_is_24_7": is_24_7,
        "oh_format": "basic"
    }

# Feature simple para evitar recomendar POIs marcados como "off"
def is_likely_open(s):
    if pd.isna(s):
        return False
    
    t = str(s).lower()
    
    if "24/7" in t:
        return True
    
    # Si tiene horarios tipo 09:00-20:00 → asumimos usable
    if ":" in t:
        return True
    
    return False