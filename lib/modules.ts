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
  { slug: "welcome", number: 0, phase: "Orientation", phaseNumber: 0, title: "Welcome — what this course is (and isn't)", subtitle: "How the course works, who it's for, and how to get the most out of it", duration: "~5 min", project: "No project — just read", status: "available" },

  // Phase 1
  { slug: "tokenization", number: 1, phase: "ML & AI Foundations", phaseNumber: 1, title: "Tokenization", subtitle: "Why the AI charges you by the tokwhat?", duration: "15 min intro", project: "Tokenizer playground (built into this module)", status: "available" },
  { slug: "ml-basics", number: 2, phase: "ML & AI Foundations", phaseNumber: 1, title: "Supervised learning foundations", subtitle: "Problem types, features, labels, loss — deep, with worked examples", duration: "~1.5–2.5h", project: "Linear regression from scratch in Java (part 1: model + MSE)", status: "available" },
  { slug: "ml-training", number: 3, phase: "ML & AI Foundations", phaseNumber: 1, title: "How models actually learn", subtitle: "Gradient descent, LR tuning, overfitting, evaluation metrics", duration: "~2.5–3h", project: "Linear regression from scratch in Java (part 2: training loop + eval)", status: "available" },
  { slug: "neural-networks", number: 4, phase: "ML & AI Foundations", phaseNumber: 1, title: "Neural networks", subtitle: "Layers, activations, backprop — from intuition up", duration: "~3–4h", project: "Tiny MLP digit classifier from scratch in Java", status: "available" },
  { slug: "transformers", number: 5, phase: "ML & AI Foundations", phaseNumber: 1, title: "Attention & transformers", subtitle: "The one idea that ate the ML world — built from scratch", duration: "~3–4h", project: "Scaled dot-product attention from scratch in Java", status: "available" },
  { slug: "embeddings-intro", number: 6, phase: "ML & AI Foundations", phaseNumber: 1, title: "Embeddings: numbers become geometry", subtitle: "Vector space, cosine similarity, why semantic search works", duration: "~2–3h", project: "Nearest-neighbor search in Java + 2D visualizer", status: "available" },
  { slug: "prompt-engineering", number: 7, phase: "ML & AI Foundations", phaseNumber: 1, title: "Prompt engineering", subtitle: "System prompts, few-shot, chain-of-thought, structured output", duration: "~2h", project: "Local prompt pattern playground — no API key needed", status: "available" },
  { slug: "recap", number: 8, phase: "ML & AI Foundations", phaseNumber: 1, title: "Putting it all together", subtitle: "Trace a real LLM request through every concept from Modules 1–7", duration: "~1–1.5h", project: "Annotated end-to-end request walkthrough", status: "available" },

  // Phase 2
  { slug: "api-fundamentals", number: 9, phase: "API & Backend Integration", phaseNumber: 2, title: "Claude API fundamentals", subtitle: "Auth, models, parameters — from zero to first request", duration: "~1.5h", project: "AI code reviewer CLI", status: "available" },
  { slug: "spring-ai", number: 10, phase: "API & Backend Integration", phaseNumber: 2, title: "Spring AI integration", subtitle: "The Spring-native way to call LLMs", duration: "~2h", project: "Personal journal assistant", status: "available" },
  { slug: "tool-use", number: 11, phase: "API & Backend Integration", phaseNumber: 2, title: "Tool use & function calling", subtitle: "Let the LLM call your GraphQL resolvers", duration: "~2h", project: "GraphQL-aware assistant", status: "available" },
  { slug: "streaming", number: 12, phase: "API & Backend Integration", phaseNumber: 2, title: "Streaming with SSE", subtitle: "Token-by-token from Spring Boot to React", duration: "~1.5h", project: "Live story generator", status: "available" },
  { slug: "prompt-caching", number: 13, phase: "API & Backend Integration", phaseNumber: 2, title: "Prompt caching & cost", subtitle: "Running LLMs at production scale", duration: "~1.5h", project: "Cost dashboard", status: "available" },

  // Phase 3
  { slug: "embeddings-deep", number: 14, phase: "Vector Search & RAG", phaseNumber: 3, title: "Embeddings deep dive", subtitle: "Production embeddings: models, dimensions, cost, the curse", duration: "~2h", project: "Semantic bookmark search", status: "available" },
  { slug: "pgvector", number: 15, phase: "Vector Search & RAG", phaseNumber: 3, title: "Vector DBs & pgvector", subtitle: "HNSW vs IVFFlat, indexing, Postgres integration", duration: "~2h", project: "Duplicate issue detector", status: "available" },
  { slug: "rag-architecture", number: 16, phase: "Vector Search & RAG", phaseNumber: 3, title: "RAG architecture", subtitle: "Chunking, retrieval, context assembly", duration: "~2h", project: "Doc chunking lab", status: "available" },
  { slug: "rag-spring", number: 17, phase: "Vector Search & RAG", phaseNumber: 3, title: "RAG in Spring Boot end-to-end", subtitle: "Spring AI + pgvector, full pipeline", duration: "~2h", project: "Chat with your docs", status: "available" },

  // Phase 4
  { slug: "react-streaming", number: 18, phase: "Frontend AI Integration", phaseNumber: 4, title: "React streaming patterns", subtitle: "SSE consumption, optimistic updates, tool results", duration: "~1.5h", project: "Chat UI component library", status: "available" },
  { slug: "chat-interface", number: 19, phase: "Frontend AI Integration", phaseNumber: 4, title: "Full chat interface", subtitle: "React + GraphQL + Spring Boot end-to-end", duration: "~2h", project: "Team standup bot", status: "available" },
  { slug: "multimodal", number: 20, phase: "Frontend AI Integration", phaseNumber: 4, title: "Multimodal inputs", subtitle: "Images, files, vision models", duration: "~1.5h", project: "Receipt parser", status: "available" },

  // Phase 5
  { slug: "agents-intro", number: 21, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Agent fundamentals", subtitle: "ReAct loop, memory, when NOT to use agents", duration: "~2h", project: "Research agent", status: "coming-soon" },
  { slug: "agent-spring", number: 22, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Agents in Spring Boot", subtitle: "Tool loop, state, stopping conditions", duration: "~2h", project: "Code migration agent", status: "coming-soon" },
  { slug: "multi-agent", number: 23, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Multi-agent patterns", subtitle: "Orchestrator/subagent, parallelization", duration: "~1.5h", project: "PR review panel", status: "coming-soon" },

  // Phase 6
  { slug: "evals", number: 24, phase: "Production & Capstone", phaseNumber: 6, title: "Evals", subtitle: "LLM-as-judge, golden sets, regression testing", duration: "~1.5h", project: "Eval harness", status: "coming-soon" },
  { slug: "security", number: 25, phase: "Production & Capstone", phaseNumber: 6, title: "Security & guardrails", subtitle: "Prompt injection, PII, output filtering", duration: "~1.5h", project: "Injection test suite", status: "coming-soon" },
  { slug: "fine-tuning", number: 26, phase: "Production & Capstone", phaseNumber: 6, title: "Fine-tuning & RLHF (when to bother)", subtitle: "How model training actually works — and why RAG usually wins", duration: "~1.5h", project: "Decision framework: fine-tune vs prompt vs RAG", status: "coming-soon" },
  { slug: "capstone", number: 27, phase: "Production & Capstone", phaseNumber: 6, title: "Capstone project", subtitle: "End-to-end AI engineering assistant", duration: "~3h", project: "Portfolio centerpiece", status: "coming-soon" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
