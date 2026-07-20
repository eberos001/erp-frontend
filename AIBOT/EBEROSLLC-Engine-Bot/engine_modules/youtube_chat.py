import json
import time
from pathlib import Path
from datetime import datetime

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]

out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
PROJECT_ROOT = Path(__file__).resolve().parents[1]
QUEUE_DIR = PROJECT_ROOT / "queue"
QUEUE_DIR.mkdir(parents=True, exist_ok=True)

TOKEN_PATH = PROJECT_ROOT / "token.json"
CREDS_PATH = PROJECT_ROOT / "credentials.json"

def _now_stamp():
    return datetime.utcnow().strftime("%Y%m%dT%H%M%S"), f"{time.time_ns()}"

def _enqueue_message(user: str, message: str):
    stamp, nano = _now_stamp()
    payload = {
        "thread_id": f"yt-{stamp}_{nano}",
        "user": user,
        "message": message,
    }
    out = QUEUE_DIR / f"yt_{stamp}_{nano}.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return out

def get_youtube_service():
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDS_PATH.exists():
                raise FileNotFoundError(
                    f"Missing credentials.json at: {CREDS_PATH}\n"
                    "Download OAuth Client credentials from Google Cloud and place it here."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")

    return build("youtube", "v3", credentials=creds)

def get_live_chat_id(youtube, video_id: str) -> str:
    resp = youtube.videos().list(part="liveStreamingDetails", id=video_id).execute()
    items = resp.get("items", [])
    if not items:
        raise ValueError(f"No video found for video_id={video_id}")
    details = items[0].get("liveStreamingDetails", {})
    chat_id = details.get("activeLiveChatId")
    if not chat_id:
        raise ValueError("This video does not have an activeLiveChatId (is it live right now?).")
    return chat_id

def poll_live_chat(youtube, live_chat_id: str, page_token: str | None = None):
    resp = youtube.liveChatMessages().list(
        liveChatId=live_chat_id,
        part="snippet,authorDetails",
        maxResults=200,
        pageToken=page_token or None
    ).execute()

    next_token = resp.get("nextPageToken")
    interval_ms = resp.get("pollingIntervalMillis", 2000)
    items = resp.get("items", [])

    messages = []
    for it in items:
        author = (it.get("authorDetails", {}) or {}).get("displayName", "Viewer")
        text = (it.get("snippet", {}) or {}).get("displayMessage", "")
        if text:
            messages.append((author, text))

    return messages, next_token, interval_ms
