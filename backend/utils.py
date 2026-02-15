from typing import List, Dict, Any

def to_float(value):
    try:
        return float(value)
    except Exception:
        return None

def split_list_field(value: Any) -> List[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if v]
    # common separators
    s = str(value)
    for sep in ['|', ',', ';', '\n']:
        if sep in s:
            return [p.strip() for p in s.split(sep) if p.strip()]
    return [s.strip()]

def normalize_flavor_attrs(attrs: Dict[str, Any]) -> Dict[str, float]:
    # Convert flavor attributes to floats and normalize keys
    out = {}
    for k, v in (attrs or {}).items():
        key = str(k).lower().strip()
        try:
            out[key] = float(v)
        except Exception:
            # try to extract number
            try:
                out[key] = float(''.join(ch for ch in str(v) if (ch.isdigit() or ch=='.')))
            except Exception:
                out[key] = 0.0
    return out
