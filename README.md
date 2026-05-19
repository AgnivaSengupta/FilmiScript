# 🎬 FilmiScript

> **AI-powered Bollywood script generator.** Give it a situation and a mood — it writes you a full dramatic screenplay complete with characters, scenes, and over-the-top Bollywood dialogues.

![Preview](Preview.png)
---

## Features

| Feature | Description |
|---|---|
| **Multi-agent pipeline** | 4 sequential AI agents — Story → Character → Scene → Dialogue |
| **Bollywood flair** | Hindi/Urdu phrases, dramatic pauses, stage directions baked in |
| **Persistent history** | Every generated script is saved to MongoDB and survives page reloads |
| **Regenerate scenes** | Re-generate dialogues for a specific scene without touching the rest |
| **Shareable drama card** | Every script gets a public `/drama/[id]` URL with Open Graph metadata |
| **Delete scripts** | Remove scripts from history with one click |
| **Rate limit safe** | Exponential backoff + per-scene sleep buffers for Groq's free tier |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| Agent orchestration | [LangGraph.js](https://github.com/langchain-ai/langgraphjs) |
| LLM provider | [Groq API](https://console.groq.com/) — free tier |
| Database | [MongoDB](https://www.mongodb.com/atlas) via [Mongoose](https://mongoosejs.com/) |
| Client state | [Zustand](https://zustand.docs.pmnd.rs/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Styling | Tailwind CSS v4 |
| JSON repair | [jsonrepair](https://github.com/josdejong/jsonrepair) — handles LLM non-determinism |

---

## Architecture

### The 4-Agent Pipeline

```
User Input (situation + mood)
        │
        ▼
┌──────────────────┐
│  1. Story Agent  │  Generates: title, tagline, plot synopsis
└────────┬─────────┘
         │
         ▼
┌────────────────────────┐
│  2. Character Agent    │  Generates: name, role, personality, description, avatar
└────────┬───────────────┘
         │
         ▼
┌──────────────────┐
│  3. Scene Agent  │  Generates: scene list with character subsets
└────────┬─────────┘
         │ (per-scene loop with 2s sleep — rate limit buffer)
         ▼
┌──────────────────────────────┐
│  4. Dialogue Agent           │  Generates: Bollywood dialogues with Character Bible
└──────────────────────────────┘
         │
         ▼
  Saved to MongoDB → Returned to client
```

### Consistency Guarantees

- Every agent receives the **full accumulated state** from all previous agents
- A **Character Bible** (name + role + personality) is injected into every dialogue prompt
- Post-generation validation filters out hallucinated character names
- `withRetry()` wraps every LLM call with exponential backoff (4s → 8s → 16s → 30s)
- `parseJsonSafely()` runs `jsonrepair` before `JSON.parse` to handle malformed LLM output

---

## Folder Structure

```
deepshorts/
├── app/
│   ├── page.tsx                          # Main dashboard (client)
│   ├── drama/
│   │   └── [id]/page.tsx                 # Shareable script view (SSR, OG tags)
│   └── api/
│       ├── generate/route.ts             # POST — runs the 4-agent pipeline
│       ├── health/route.ts               # GET  — health check
│       └── scripts/
│           ├── route.ts                  # GET  — history list (lightweight)
│           └── [id]/
│               ├── route.ts              # GET / DELETE — single script
│               └── regenerate-scene/
│                   └── route.ts          # POST — re-generate one scene's dialogues
│
├── components/
│   ├── Sidebar.tsx                       # Collapsible sidebar with history tabs
│   ├── SceneCard.tsx                     # Scene + dialogue display with regen button
│   ├── InputBox.tsx                      # Situation + mood input
│   ├── RightSidebar.tsx                  # Character sketch panel
│   └── CharacterSketch.tsx               # Individual character display
│
├── lib/
│   ├── agents/
│   │   ├── state.ts                      # LangGraph state annotations
│   │   ├── llm.ts                        # ChatGroq setup, withRetry, parseJsonSafely
│   │   ├── storyAgent.ts                 # Agent 1
│   │   ├── charAgent.ts                  # Agent 2
│   │   ├── sceneAgent.ts                 # Agent 3
│   │   ├── dialogueAgent.ts              # Agent 4 + standalone regen helper
│   │   └── graph.ts                      # LangGraph StateGraph assembly
│   └── db/
│       ├── mongodb.ts                    # Singleton Mongoose connection
│       └── models/Script.ts             # Mongoose schema + toScriptData / toHistoryItem
│
└── store/
    └── useScriptStore.ts                 # Zustand store (generateScript, fetchHistory, etc.)
```

---

## Setup

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster **or** a local MongoDB instance

### 1. Clone and install

```bash
git clone https://github.com/your-username/filmi-script.git
cd filmi-script
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Get your free key from https://console.groq.com/keys
GROQ_API_KEY=gsk_...

# MongoDB Atlas connection string (free M0 tier)
# or local: mongodb://localhost:27017/deepshorts
DATABASE_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/deepshorts
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate` | Run the full 4-agent pipeline |
| `GET` | `/api/scripts` | Fetch lightweight history list |
| `GET` | `/api/scripts/[id]` | Fetch full script by MongoDB ID |
| `DELETE` | `/api/scripts/[id]` | Delete a script permanently |
| `POST` | `/api/scripts/[id]/regenerate-scene` | Re-generate one scene's dialogues |
| `GET` | `/api/health` | Health check |

---

## Rate Limit Strategy (Groq Free Tier)

| Problem | Solution |
|---|---|
| Tokens-per-minute limit | One LLM call per scene + `sleep(2000)` between calls |
| 429 errors | `withRetry()` with 4s → 8s → 16s → 30s exponential backoff |
| Malformed JSON from LLM | `jsonrepair()` runs before `JSON.parse` on every response |
| Hallucinated characters | Post-generation filter validates all speaker names against `charactersPresent` |

---

## Shareable Links

Every generated script gets a public URL:

```
https://your-app.com/drama/682a1b2c3d4e5f6a7b8c9d0e
```

- **Server-rendered** (SSR) — content is in the HTML, works for SEO
- **Open Graph tags** — title + tagline appear in WhatsApp/Twitter/Slack previews
- **No auth required** — anyone with the link can view

---


*Built with ❤️ and 🍵 by [Agniva Sengupta](https://github.com/Agniva-Sengupta)*
