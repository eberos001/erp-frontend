import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parents[1]
QUEUE_DIR = PROJECT_ROOT / "queue"
PROCESSED_DIR = PROJECT_ROOT / "processed"
LEGACY_INBOX = PROJECT_ROOT / "inbox.json"

def _read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None

def fetch_next_thread():
    """
    Priority:
      1) queue/*.json (oldest first)
      2) legacy inbox.json (fallback)
    Moves consumed message into processed/.
    """
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    # 1) Queue mode: oldest file first
    queue_files = sorted(QUEUE_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime)
    if queue_files:
        path = queue_files[0]
        data = _read_json(path)
        if isinstance(data, dict) and "message" in data:
            stamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            out_path = PROCESSED_DIR / f"queue_{stamp}.json"
            try:
                out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
                path.unlink(missing_ok=True)
            except Exception:
                pass
            return data
        else:
            # bad file; move aside
            path.unlink(missing_ok=True)
            return None

    # 2) Legacy inbox.json fallback
    if LEGACY_INBOX.exists():
        data = _read_json(LEGACY_INBOX)
        if isinstance(data, dict) and "message" in data:
            stamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            out_path = PROCESSED_DIR / f"inbox_{stamp}.json"
            try:
                out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
                LEGACY_INBOX.unlink(missing_ok=True)
            except Exception:
                pass
            return data

    return None
