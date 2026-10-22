# VoiceDesk: Single-Paragraph Demo Video Script 🎬🎙️

> **Target Duration:** ~2 minutes 45 seconds (Strict Devpost limit: under 3:00).  
> **Presentation Style:** Continuous, unbroken presenter narration from starting to end in a single flowing paragraph (*"Let's see this...", "Look right over here...", "Notice how..."*).  
> **Pre-Recording Prep:** Open `http://localhost:5173`. Click the user avatar in the top-right (`AC`) and select **"Reset Demo Data"** to start with clean reference numbers (8 Open Tasks, 12 Notes, 3 Due Today, 24 Tool Calls).

---

## 🎙️ The Master Script (Single Continuous Paragraph From Start to End)

*Read this continuously from beginning to end in one single take while performing the actions on screen:*

> "Welcome to VoiceDesk, an ambient, voice-first productivity dashboard and official Alexa+ MCP server built with Amazon Bedrock that turns fleeting commitments into structured, verifiable actions in real time! Let's see this in action right here in the center hero by clicking our glowing violet microphone and saying: **'Add call the bank tomorrow'** — notice the violet pulsing rings and animated audio waveform, and look right over here at our dark Live Activity panel on the right where in just eighty-seven milliseconds, the official `add_task` tool was executed over Streamable HTTP, returning our spoken confirmation, rendering the raw JSON payload with a single click of 'Inspect MCP Payload', and slotting 'Call the bank' straight into our open commitments down below. Now, glancing across the layout, our left dark navy sidebar anchors the entire experience with brand navigation, live counter badges for our open tasks and captured notes, and our Alexa+ and Amazon Bedrock integration badge, while in the center, our real-time statistics row displays our open tasks, notes, deadlines due today, and total tool calls with live sparkline trends. Let's see how VoiceDesk handles listing and speech ambiguity: clicking the hero microphone again, I'll ask **'What's on my list today?'**, which fires `list_tasks` in just three milliseconds, and when I click the mic and say **'Mark call the bank done'**, that commitment instantly strikes through with a green checkmark, drops our open tasks counter, and logs `complete_task` in the trace — but when an utterance isn't specific, like saying **'Mark buy done'**, VoiceDesk intelligently pauses and asks for clarification between 'Buy groceries' and 'Buy supplies' instead of guessing. Moving over to the left sidebar and clicking on the Tasks tab, our workspace smoothly transitions into a dedicated task management view where we can instantly filter commitments by 'Due Today' or 'High Priority' with bi-directional syncing, and jumping to the Notes tab, watch as I click the mic and say **'Note: use SQLite with WAL mode for the demo'** — VoiceDesk auto-generates tags, saves to SQLite with sub-millisecond latency, and when we click 'Ask Bedrock Recall' and submit **'What did I note about SQLite?'**, Amazon Bedrock's Nova Micro synthesizes a grounded answer citing Note number one directly with zero hallucinations. Finally, clicking over to the Activity tab in the sidebar, developers can inspect our live telemetry, average latency, and JSON-RPC payloads, and switching to VS Code, we can verify our official 2025-11-25 MCP server running over Streamable HTTP with all eight contract tests passing green in the terminal, before switching back to the dashboard, clicking the top navigation theme toggle to reveal this gorgeous glowing dark mode, wrapping up an open-source, transparent, and voice-first experience built for Alexa+ and available on GitHub under the MIT license — thank you so much!"

---

## 🎬 Master Script with Inline Navigation & Cursor Cues

*Same continuous single paragraph, with exact cursor navigation and click cues highlighted in brackets so you know exactly where to steer your mouse without stopping:*

> "Welcome to VoiceDesk, an ambient, voice-first productivity dashboard and official Alexa+ MCP server built with Amazon Bedrock that turns fleeting commitments into structured, verifiable actions in real time! Let's see this in action right here in the center hero by **[🖱️ Hover & Click Center Glowing Microphone]** and saying: **'Add call the bank tomorrow'** — notice the violet pulsing rings and animated audio waveform, and look right over here at our dark Live Activity panel on the right **[👉 Move Cursor to Right Trace Panel]** where in just eighty-seven milliseconds, the official `add_task` tool was executed over Streamable HTTP, returning our spoken confirmation, rendering the raw JSON payload with a single click of **[🖱️ Click 'Inspect MCP Payload' to expand JSON]**, and slotting 'Call the bank' straight into our open commitments down below **[👉 Point to Tasks row below]**. Now, glancing across the layout, our left dark navy sidebar **[👉 Sweep Cursor across Left Sidebar]** anchors the entire experience with brand navigation, live counter badges for our open tasks and captured notes, and our Alexa+ and Amazon Bedrock integration badge, while in the center **[👉 Move Cursor to Center Stats Row]**, our real-time statistics row displays our open tasks, notes, deadlines due today, and total tool calls with live sparkline trends. Let's see how VoiceDesk handles listing and speech ambiguity: **[🖱️ Click Hero Microphone]** again, I'll ask **'What's on my list today?'**, which fires `list_tasks` in just three milliseconds **[👉 Point to new Trace Card]**, and when I **[🖱️ Click Mic]** and say **'Mark call the bank done'**, that commitment instantly strikes through with a green checkmark, drops our open tasks counter **[👉 Point to Tasks badge 8 -> 7]**, and logs `complete_task` in the trace — but when an utterance isn't specific, like saying **[🖱️ Click Mic]** **'Mark buy done'**, VoiceDesk intelligently pauses and asks for clarification between 'Buy groceries' and 'Buy supplies' instead of guessing **[👉 Point to Clarification Bubble in Hero]**. Moving over to the left sidebar and clicking on the **[🖱️ Click 'Tasks' in Left Sidebar]**, our workspace smoothly transitions into a dedicated task management view where we can instantly filter commitments by 'Due Today' or 'High Priority' with bi-directional syncing **[🖱️ Click 'Due Today' then 'High Priority' filter chips]**, and jumping to the **[🖱️ Click 'Notes' in Left Sidebar]**, watch as I click the mic **[🖱️ Click Mic]** and say **'Note: use SQLite with WAL mode for the demo'** — VoiceDesk auto-generates tags, saves to SQLite with sub-millisecond latency, and when we click 'Ask Bedrock Recall' **[🖱️ Click purple 'Ask Bedrock Recall' button]** and submit **'What did I note about SQLite?'** **[🖱️ Click suggestion & hit Ask]**, Amazon Bedrock's Nova Micro synthesizes a grounded answer citing Note number one directly with zero hallucinations **[👉 Point to [Note #1] citation badge]**. Finally, clicking over to the Activity tab in the sidebar **[🖱️ Click 'Activity' in Left Sidebar]**, developers can inspect our live telemetry, average latency, and JSON-RPC payloads, and switching to VS Code **[💻 Alt-Tab to VS Code]**, we can verify our official 2025-11-25 MCP server running over Streamable HTTP with all eight contract tests passing green in the terminal **[💻 Run pytest in terminal]**, before switching back to the dashboard **[💻 Alt-Tab back to Browser & Click 'Home' in Sidebar]**, clicking the top navigation theme toggle **[🖱️ Click Moon/Sun Theme Toggle in Top Nav]** to reveal this gorgeous glowing dark mode, wrapping up an open-source, transparent, and voice-first experience built for Alexa+ and available on GitHub under the MIT license — thank you so much!"

---

## 🗺️ Visual Navigation Map (Dashboard Zones)

```text
+---------------------------------------------------------------------------------------------------------+
| [TopNav]  Search Bar ("Search tasks, notes...") | MCP Status | Theme Toggle [☀️/🌙] | User [AC - Reset] |
+-----------------+---------------------------------------------------------------------+-----------------+
| [Sidebar ~260px]| [Main Workspace Area]                                               | [Right Trace]   |
| * Home          |  1. Hero Section (Mic, Waveform, Suggestion Pills, Bubbles)         | Live Activity   |
| * Tasks (8)     |  2. Statistics Row (Open: 8, Notes: 12, Due: 3, Calls: 24)          | Timeline:       |
| * Notes (12)    |  3. Tasks Panel (Left)  |  Notes Panel (Right)                      | * Timestamp     |
| * Activity      |                                                                     | * Tool Name     |
| * Insights      | (Clicking Sidebar switches Workspace to dedicated full-width views: | * Latency ms    |
| * Settings      |  TasksView, NotesView, ActivityView, InsightsView, SettingsView)    | * Expand JSON   |
| [Promo Card]    |                                                                     |                 |
+-----------------+---------------------------------------------------------------------+-----------------+
```

---

## ⏱️ Quick Synchronization Timeline (0:00 – 2:45)

| Timestamp | Screen Zone | Action & Voice Command | UI Reaction |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:10** | Center Hero | Click Mic $\rightarrow$ *"Add call the bank tomorrow"* | Pulsing violet rings & live audio waveform animate |
| **0:10 – 0:25** | Right Trace Panel | Point to top card $\rightarrow$ Click *"Inspect MCP Payload"* | Shows `add_task` in 87ms + raw JSON; task appears below |
| **0:25 – 0:40** | Left Sidebar & Stats | Sweep across Logo, Badges (8/12), Promo, 4 Stat Cards | Highlight 8 Open, 12 Notes, 3 Due, 25 Calls + sparklines |
| **0:40 – 0:55** | Center Hero | Click Mic $\rightarrow$ *"What's on my list today?"* | Fires `list_tasks` in 3ms; confirms 3 items |
| **0:55 – 1:10** | Tasks Panel | Click Mic $\rightarrow$ *"Mark call the bank done"* | Task strikes through; badge drops from 8 to 7 |
| **1:10 – 1:25** | Center Hero | Click Mic $\rightarrow$ *"Mark buy done"* | Clarification bubble: *"Buy groceries or Buy supplies?"* |
| **1:25 – 1:45** | Sidebar: Tasks | Click **Tasks** tab $\rightarrow$ Click *"Due Today"*, *"High Priority"* | Full task manager view filters instantly |
| **1:45 – 2:05** | Sidebar: Notes | Click **Notes** tab $\rightarrow$ *"Note: use SQLite with WAL mode"* | Card saves with `#architecture`, `#database` tags |
| **2:05 – 2:20** | Notes Modal | Click **Ask Bedrock** $\rightarrow$ *"What did I note about SQLite?"* | Nova Micro generates answer with clickable `[Note #1]` |
| **2:20 – 2:32** | Sidebar: Activity | Click **Activity** tab $\rightarrow$ Show telemetry metrics | 100% success rate, latency breakdown, source filters |
| **2:32 – 2:40** | VS Code / Terminal | Show `server.py` & run `pytest` | 8/8 contract tests pass green |
| **2:40 – 2:45** | Top Nav | Click **Home** $\rightarrow$ Click **Theme Toggle** (Dark Mode) | Smooth dark mode transition $\rightarrow$ closing thank you |
