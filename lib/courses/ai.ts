// AI Engineering Foundations — course definition.
// Modules, phases, and per-course metadata for the AI track.

export type Module = {
  slug: string;
  number: number;
  phase: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  duration: string;
  project: string;
  status: "available" | "coming-soon";
  // --- Optional enriched metadata (added mechanically; see
  // scripts/add-module-metadata.mjs). All optional so existing callers and any
  // future hand-authored module compile without them. ---
  // Relative depth within the course: orientation/early = "intro", mid = "core",
  // late phases = "advanced". Derived from phaseNumber.
  difficulty?: "intro" | "core" | "advanced";
  // Short topic tags derived from the phase name + title keywords. Used for
  // filtering/labelling on cards and the achievements page.
  tags?: string[];
  // Rough time-to-complete in minutes, parsed from the freeform `duration`
  // string (ranges → midpoint). Lets us sum totals without re-parsing prose.
  estimatedMinutes?: number;
};

export const COURSE_META = {
  id: "ai" as const,
  slug: "ai",
  name: "AI Engineering Foundations",
  shortName: "AI Foundations",
  tagline: "From zero ML to production AI features",
  description:
    "Hands-on training in modern AI: tokens and embeddings, vector search, retrieval-augmented generation, tool use, agents, evals, and fine-tuning. Each module ships a working Java/Spring feature you can drop into a real product.",
  icon: "🧠",
  // Tailwind gradient (used in headers / picker cards)
  color: "from-indigo-500 to-purple-500",
  accent: "indigo",
  status: "available" as const,
  language: "Java / Spring",
};

export const PHASES = [
  { number: 0, name: "Orientation", color: "from-slate-500 to-slate-400" },
  { number: 1, name: "ML & AI Foundations", color: "from-rose-500 to-orange-500" },
  { number: 2, name: "API & Backend Integration", color: "from-amber-500 to-yellow-500" },
  { number: 3, name: "Vector Search & RAG", color: "from-emerald-500 to-green-500" },
  { number: 4, name: "Frontend AI Integration", color: "from-sky-500 to-blue-500" },
  { number: 5, name: "Agents & Advanced Patterns", color: "from-indigo-500 to-purple-500" },
  { number: 6, name: "Production & Capstone", color: "from-pink-500 to-rose-500" },
];

export const MODULES: Module[] = [
  // Phase 0
  { slug: "welcome", number: 0, phase: "Orientation", phaseNumber: 0, title: "Welcome — what this course is (and isn't)", subtitle: "How the course works, who it's for, and how to get the most out of it", duration: "~5 min", project: "No project — just read", difficulty: "intro", estimatedMinutes: 5, tags: ["orientation"], status: "available" },

  // Phase 1
  { slug: "tokenization", number: 1, phase: "ML & AI Foundations", phaseNumber: 1, title: "Tokenization", subtitle: "Why the AI charges you by the tokwhat?", duration: "15 min intro", project: "Tokenizer playground (built into this module)", difficulty: "intro", estimatedMinutes: 15, tags: ["foundations", "project"], status: "available" },
  { slug: "ml-basics", number: 2, phase: "ML & AI Foundations", phaseNumber: 1, title: "Supervised learning foundations", subtitle: "Problem types, features, labels, loss — deep, with worked examples", duration: "~1.5–2.5h", project: "Linear regression from scratch in Java (part 1: model + MSE)", difficulty: "intro", estimatedMinutes: 120, tags: ["foundations", "project"], status: "available" },
  { slug: "ml-training", number: 3, phase: "ML & AI Foundations", phaseNumber: 1, title: "How models actually learn", subtitle: "Gradient descent, LR tuning, overfitting, evaluation metrics", duration: "~2.5–3h", project: "Linear regression from scratch in Java (part 2: training loop + eval)", difficulty: "intro", estimatedMinutes: 165, tags: ["foundations", "project"], status: "available" },
  { slug: "neural-networks", number: 4, phase: "ML & AI Foundations", phaseNumber: 1, title: "Neural networks", subtitle: "Layers, activations, backprop — from intuition up", duration: "~3–4h", project: "Tiny MLP digit classifier from scratch in Java", difficulty: "intro", estimatedMinutes: 210, tags: ["foundations", "project"], status: "available" },
  { slug: "transformers", number: 5, phase: "ML & AI Foundations", phaseNumber: 1, title: "Attention & transformers", subtitle: "The one idea that ate the ML world — built from scratch", duration: "~3–4h", project: "Scaled dot-product attention from scratch in Java", difficulty: "intro", estimatedMinutes: 210, tags: ["foundations", "project"], status: "available" },
  { slug: "embeddings-intro", number: 6, phase: "ML & AI Foundations", phaseNumber: 1, title: "Embeddings: numbers become geometry", subtitle: "Vector space, cosine similarity, why semantic search works", duration: "~2–3h", project: "Nearest-neighbor search in Java + 2D visualizer", difficulty: "intro", estimatedMinutes: 150, tags: ["foundations", "project"], status: "available" },
  { slug: "prompt-engineering", number: 7, phase: "ML & AI Foundations", phaseNumber: 1, title: "Prompt engineering", subtitle: "System prompts, few-shot, chain-of-thought, structured output", duration: "~2h", project: "Local prompt pattern playground — no API key needed", difficulty: "intro", estimatedMinutes: 120, tags: ["foundations", "project"], status: "available" },
  { slug: "recap", number: 8, phase: "ML & AI Foundations", phaseNumber: 1, title: "Phase 1 revision notes", subtitle: "Trace a real LLM request through every concept from Modules 1–7 — the foundations on one card", duration: "~1–1.5h", project: "Annotated end-to-end request walkthrough", difficulty: "intro", estimatedMinutes: 75, tags: ["foundations", "revision", "project"], status: "available" },

  // Phase 2
  { slug: "api-fundamentals", number: 9, phase: "API & Backend Integration", phaseNumber: 2, title: "Claude API fundamentals", subtitle: "Auth, models, parameters — from zero to first request", duration: "~1.5h", project: "AI code reviewer CLI", difficulty: "intro", estimatedMinutes: 90, tags: ["api", "backend", "integration", "project"], status: "available" },
  { slug: "spring-ai", number: 10, phase: "API & Backend Integration", phaseNumber: 2, title: "Spring AI integration", subtitle: "The Spring-native way to call LLMs", duration: "~2h", project: "Personal journal assistant", difficulty: "intro", estimatedMinutes: 120, tags: ["api", "backend", "integration", "project"], status: "available" },
  { slug: "tool-use", number: 11, phase: "API & Backend Integration", phaseNumber: 2, title: "Tool use & function calling", subtitle: "Let the LLM call your GraphQL resolvers", duration: "~2h", project: "GraphQL-aware assistant", difficulty: "intro", estimatedMinutes: 120, tags: ["api", "backend", "integration", "project"], status: "available" },
  { slug: "streaming", number: 12, phase: "API & Backend Integration", phaseNumber: 2, title: "Streaming with SSE", subtitle: "Token-by-token from Spring Boot to React", duration: "~1.5h", project: "Live story generator", difficulty: "intro", estimatedMinutes: 90, tags: ["api", "backend", "integration", "project"], status: "available" },
  { slug: "prompt-caching", number: 13, phase: "API & Backend Integration", phaseNumber: 2, title: "Prompt caching & cost", subtitle: "Running LLMs at production scale", duration: "~1.5h", project: "Cost dashboard", difficulty: "intro", estimatedMinutes: 90, tags: ["api", "backend", "integration", "project"], status: "available" },
  { slug: "phase-2-revision", number: 14, phase: "API & Backend Integration", phaseNumber: 2, title: "Phase 2 revision notes", subtitle: "Claude API, Spring AI, tool use, streaming, prompt caching — the backend AI toolkit on one card", duration: "~15–20 min", project: "No project — pure revision", difficulty: "intro", estimatedMinutes: 18, tags: ["api", "backend", "integration", "revision"], status: "available" },

  // Phase 3
  { slug: "embeddings-deep", number: 15, phase: "Vector Search & RAG", phaseNumber: 3, title: "Embeddings deep dive", subtitle: "Production embeddings: models, dimensions, cost, the curse", duration: "~2h", project: "Semantic bookmark search", difficulty: "core", estimatedMinutes: 120, tags: ["vector", "search", "rag", "project"], status: "available" },
  { slug: "pgvector", number: 16, phase: "Vector Search & RAG", phaseNumber: 3, title: "Vector DBs & pgvector", subtitle: "HNSW vs IVFFlat, indexing, Postgres integration", duration: "~2h", project: "Duplicate issue detector", difficulty: "core", estimatedMinutes: 120, tags: ["vector", "search", "rag", "project"], status: "available" },
  { slug: "rag-architecture", number: 17, phase: "Vector Search & RAG", phaseNumber: 3, title: "RAG architecture", subtitle: "Chunking, retrieval, context assembly", duration: "~2h", project: "Doc chunking lab", difficulty: "core", estimatedMinutes: 120, tags: ["vector", "search", "rag", "project"], status: "available" },
  { slug: "rag-spring", number: 18, phase: "Vector Search & RAG", phaseNumber: 3, title: "RAG in Spring Boot end-to-end", subtitle: "Spring AI + pgvector, full pipeline", duration: "~2h", project: "Chat with your docs", difficulty: "core", estimatedMinutes: 120, tags: ["vector", "search", "rag", "project"], status: "available" },
  { slug: "phase-3-revision", number: 19, phase: "Vector Search & RAG", phaseNumber: 3, title: "Phase 3 revision notes", subtitle: "Embeddings, pgvector, RAG architecture, Spring AI pipeline — the retrieval stack on one card", duration: "~15–20 min", project: "No project — pure revision", difficulty: "intro", estimatedMinutes: 18, tags: ["vector", "search", "rag", "revision"], status: "available" },

  // Phase 4
  { slug: "react-streaming", number: 20, phase: "Frontend AI Integration", phaseNumber: 4, title: "React streaming patterns", subtitle: "SSE consumption, optimistic updates, tool results", duration: "~1.5h", project: "Chat UI component library", difficulty: "core", estimatedMinutes: 90, tags: ["frontend", "integration", "project"], status: "available" },
  { slug: "chat-interface", number: 21, phase: "Frontend AI Integration", phaseNumber: 4, title: "Full chat interface", subtitle: "React + GraphQL + Spring Boot end-to-end", duration: "~2h", project: "Team standup bot", difficulty: "core", estimatedMinutes: 120, tags: ["frontend", "integration", "project"], status: "available" },
  { slug: "multimodal", number: 22, phase: "Frontend AI Integration", phaseNumber: 4, title: "Multimodal inputs", subtitle: "Images, files, vision models", duration: "~1.5h", project: "Receipt parser", difficulty: "core", estimatedMinutes: 90, tags: ["frontend", "integration", "project"], status: "available" },
  { slug: "phase-4-revision", number: 23, phase: "Frontend AI Integration", phaseNumber: 4, title: "Phase 4 revision notes", subtitle: "SSE consumption, chat UI patterns, multimodal — the frontend AI playbook on one card", duration: "~15 min", project: "No project — pure revision", difficulty: "intro", estimatedMinutes: 15, tags: ["frontend", "integration", "revision"], status: "available" },

  // Phase 5
  { slug: "agents-intro", number: 24, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Agent fundamentals", subtitle: "ReAct loop, memory, when NOT to use agents", duration: "~2h", project: "Research agent", difficulty: "advanced", estimatedMinutes: 120, tags: ["agents", "advanced", "patterns", "project"], status: "available" },
  { slug: "agent-spring", number: 25, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Agents in Spring Boot", subtitle: "Tool loop, state, stopping conditions", duration: "~2h", project: "Code migration agent", difficulty: "advanced", estimatedMinutes: 120, tags: ["agents", "advanced", "patterns", "project"], status: "available" },
  { slug: "multi-agent", number: 26, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Multi-agent patterns", subtitle: "Orchestrator/subagent, parallelization", duration: "~1.5h", project: "PR review panel", difficulty: "advanced", estimatedMinutes: 90, tags: ["agents", "advanced", "patterns", "project"], status: "available" },
  { slug: "phase-5-revision", number: 27, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Phase 5 revision notes", subtitle: "ReAct, agent loops in Spring, multi-agent orchestration — the agent reference card", duration: "~15 min", project: "No project — pure revision", difficulty: "intro", estimatedMinutes: 15, tags: ["agents", "advanced", "patterns", "revision"], status: "available" },

  // Phase 6
  { slug: "evals", number: 28, phase: "Production & Capstone", phaseNumber: 6, title: "Evals", subtitle: "LLM-as-judge, golden sets, regression testing", duration: "~1.5h", project: "Eval harness", difficulty: "advanced", estimatedMinutes: 90, tags: ["production", "capstone", "project"], status: "available" },
  { slug: "security", number: 29, phase: "Production & Capstone", phaseNumber: 6, title: "Security & guardrails", subtitle: "Prompt injection, PII, output filtering", duration: "~1.5h", project: "Injection test suite", difficulty: "advanced", estimatedMinutes: 90, tags: ["production", "capstone", "project"], status: "available" },
  { slug: "fine-tuning", number: 30, phase: "Production & Capstone", phaseNumber: 6, title: "Fine-tuning & RLHF (when to bother)", subtitle: "How model training actually works — and why RAG usually wins", duration: "~1.5h", project: "Decision framework: fine-tune vs prompt vs RAG", difficulty: "advanced", estimatedMinutes: 90, tags: ["production", "capstone", "project"], status: "available" },
  { slug: "phase-6-revision", number: 31, phase: "Production & Capstone", phaseNumber: 6, title: "Phase 6 revision notes", subtitle: "Evals, security, fine-tune vs RAG vs prompt — the production-AI cheat sheet before the capstone", duration: "~15–20 min", project: "No project — pure revision", difficulty: "intro", estimatedMinutes: 18, tags: ["production", "capstone", "revision"], status: "available" },
  { slug: "capstone", number: 32, phase: "Production & Capstone", phaseNumber: 6, title: "Capstone project", subtitle: "End-to-end AI engineering assistant", duration: "~1 week", project: "Portfolio centerpiece", difficulty: "advanced", estimatedMinutes: 300, tags: ["production", "capstone", "project"], status: "available" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
