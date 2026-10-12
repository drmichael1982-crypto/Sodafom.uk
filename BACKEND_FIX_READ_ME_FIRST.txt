SODAFOM BACKEND / PHONE TEST - 4 SEPTEMBER 2026

1. Put your current OPENAI_API_KEY into the root .env file once.
   Do not put the key in Android code and do not send the .env file to anyone.
2. Double-click START_SODAFOM_PHONE_TEST.bat.
3. The script finds the laptop's current Wi-Fi IPv4 address automatically.
4. It updates VITE_API_BASE_URL, rebuilds Sodafom, refreshes the Android assets,
   starts the backend on 0.0.0.0:5000, and checks /api/chat-ping.
5. Leave the backend PowerShell window open.
6. In Android Studio open the android folder, select HONOR FCP-N49, and press Run.

FIXES IN THIS PACKAGE
- Removes dependence on the old fixed 192.168.0.208 address.
- Keeps the OpenAI key server-side only.
- Local phone backend automatically follows the laptop's current Wi-Fi address.
- Unknown legacy routes return to the home screen instead of showing a 404 page.
- Ask Archie floating control is lifted above the phone bottom navigation area.
- Archie TTS now prioritises youthful/male English voices when installed and uses a younger pitch.

IMPORTANT
A real OpenAI secret key cannot safely be embedded in this ZIP. If .env contains the placeholder,
the launcher opens .env so you can paste your current key. That is the only secret-dependent step.
