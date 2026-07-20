import time
from typing import Optional, Dict, Any

from engine_modules.local_inbox import fetch_next_thread


class AutomationEngine:
    def __init__(
        self,
        system_prompt: str = "",
        logic_map: str = "",
        interaction_protocol: str = "",
        api_spec: str = "",
        chatbot_spec: str = "",
        poll_interval_sec: float = 2.0,
    ):
        self.system_prompt = system_prompt
        self.logic_map = logic_map
        self.interaction_protocol = interaction_protocol
        self.api_spec = api_spec
        self.chatbot_spec = chatbot_spec

        self.poll_interval_sec = poll_interval_sec
        self.active_thread: Optional[Dict[str, Any]] = None
        self.idle_cycles = 0

    def run(self):
        print("\n🚀 Starting Autonomous YouTube Engine...\n")
        print("Press CTRL+C at any time to stop.\n")

        while True:
            self.run_cycle()
            time.sleep(self.poll_interval_sec)

    def run_cycle(self):
        print("🔄 Running engine polling cycle (structured)...")

        if not self.active_thread:
            thread = fetch_next_thread()
            if thread:
                print(f"📥 Local inbox thread received: {thread.get('thread_id','(no id)')}")
                print(f"👤 {thread.get('user','Viewer')}: {thread.get('message','')}")
                self.active_thread = thread

        if self.active_thread:
            self.process_active_thread()
            self.idle_cycles = 0
        else:
            print("ℹ️ No active thread to process this cycle.")
            self.idle_cycles += 1

        if self.idle_cycles > 0 and self.idle_cycles % 8 == 0:
            print("💤 Idle detected. (Later: post idle prompt to chat.)")

    def process_active_thread(self):
        msg = (self.active_thread or {}).get("message", "")
        print("\n🧠 EBEROSLLC Response:\n")
        print(self.generate_structured_response(msg))
        print("\n✅ Thread processed.\n")
        self.active_thread = None

    def generate_structured_response(self, msg: str) -> str:
        msg = msg.strip() if isinstance(msg, str) else ""
        return (
            "Problem Snapshot:\n"
            f"- {msg if msg else 'No message provided.'}\n\n"
            "Key Constraints:\n"
            "- Clarity, time, energy, and runway\n\n"
            "Pattern / Root Issue:\n"
            "- Feeling stuck usually = unclear target + fear of tradeoffs\n\n"
            "Options:\n"
            "1) Improve current role (scope/pay/environment)\n"
            "2) Switch roles/companies for better fit\n"
            "3) Skill pivot (targeted reskilling + portfolio)\n\n"
            "Recommended Path:\n"
            "- Choose ONE 30-day experiment and measure it.\n\n"
            "First 3 Actions:\n"
            "1) Define the role you want in 5 bullets\n"
            "2) Identify your top blocker (skill, clarity, confidence)\n"
            "3) Take one measurable step today (apply, outreach, build)\n\n"
            "Reflection Question:\n"
            "- What gets more expensive if you wait 6 months?"
        )
