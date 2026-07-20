import sys
import time

from engine_modules.api_spec import get_youtube_service, _enqueue_message
from engine_modules.youtube_chat import get_live_chat_id, poll_live_chat



def main():
    if len(sys.argv) < 2:
        print("Usage: python3 youtube_poll.py <LIVE_VIDEO_ID>")
        sys.exit(1)

    video_id = sys.argv[1]
    youtube = get_youtube_service()
    live_chat_id = get_live_chat_id(youtube, video_id)

    print(f"✅ Connected. liveChatId={live_chat_id}")
    print("📡 Polling live chat... (CTRL+C to stop)")

    page_token = None
    seen = set()

    while True:
        msgs, page_token, interval_ms = poll_live_chat(
            youtube, live_chat_id, page_token=page_token
        )

        for user, text in msgs:
            # basic de-dupe
            key = f"{user}:{text}"
            if key in seen:
                continue
            seen.add(key)

            out = _enqueue_message(user, text)
            print(f"📥 Queued from YouTube: {user}: {text} -> {out.name}")

        time.sleep(max(interval_ms / 1000.0, 1.0))


if __name__ == "__main__":
    main()

