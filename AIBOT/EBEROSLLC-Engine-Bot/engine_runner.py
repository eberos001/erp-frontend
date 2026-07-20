import time
import traceback
from engine_modules.automation_layer import AutomationEngine

def load_text_file(path):
    """Helper function to load text from your system documents."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def initialize_engine():
    print("\n🔧 Initializing EBEROSLLC Autonomous YouTube Engine...\n")

    system_prompt = load_text_file("engine_modules/system_prompt.txt")
    logic_map = load_text_file("engine_modules/logic_map.txt")
    api_spec = load_text_file("engine_modules/api_spec.txt")
    interaction_protocol = load_text_file("engine_modules/interaction_protocol.txt")
    chatbot_spec = load_text_file("engine_modules/chatbot_spec.txt")

    engine = AutomationEngine(
        system_prompt=system_prompt,
        logic_map=logic_map,
        api_spec=api_spec,
        interaction_protocol=interaction_protocol,
        chatbot_spec=chatbot_spec,
    )

    print("✅ Engine Initialized.\n")
    return engine

def main():
    engine = initialize_engine()

    print("🚀 Starting Autonomous YouTube Engine...\n")
    print("Press CTRL+C at any time to stop.\n")

    try:
        while True:
            engine.run_cycle()  # one polling cycle
            time.sleep(3)       # pause between cycles

    except KeyboardInterrupt:
        print("\n🛑 Manual shutdown requested.")
    except Exception:
        print("\n🔥 ERROR in engine loop:")
        traceback.print_exc()
    finally:
        print("\n🔻 Engine shutting down gracefully.\n")

if __name__ == "__main__":
    main()
