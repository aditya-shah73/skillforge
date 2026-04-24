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
  { number: 1, name: "ML & AI Foundations", color: "from-rose-500 to-orange-500" },
  { number: 2, name: "API & Backend Integration", color: "from-amber-500 to-yellow-500" },
  { number: 3, name: "Vector Search & RAG", color: "from-emerald-500 to-green-500" },
  { number: 4, name: "Frontend AI Integration", color: "from-sky-500 to-blue-500" },
  { number: 5, name: "Agents & Advanced Patterns", color: "from-indigo-500 to-purple-500" },
  { number: 6, name: "Production & Capstone", color: "from-pink-500 to-rose-500" },
];

export const MODULES: Module[] = [
  // Phase 1
  { slug: "tokenization", number: 1, phase: "ML & AI Foundations", phaseNumber: 1, title: "Tokenization", subtitle: "Why the AI charges you by the tokwhat?", duration: "15 min intro", project: "Tokenizer playground (built into this module)", status: "available" },
  { slug: "ml-basics", number: 2, phase: "ML & AI Foundations", phaseNumber: 1, title: "Supervised learning foundations", subtitle: "Problem types, features, labels, loss — deep, with worked examples", duration: "~3h", project: "Linear regression from scratch in Java (part 1: model + MSE)", status: "available" },
  { slug: "ml-training", number: 3, phase: "ML & AI Foundations", phaseNumber: 1, title: "How models actually learn", subtitle: "Gradient descent, LR tuning, overfitting, evaluation metrics", duration: "~3h", project: "Linear regression from scratch in Java (part 2: training loop + eval)", status: "available" },
  { slug: "neural-networks", number: 4, phase: "ML & AI Foundations", phaseNumber: 1, title: "Neural networks", subtitle: "Layers, activations, backprop — from intuition up", duration: "~2h", project: "Tiny digit classifier in Java", status: "coming-soon" },
  { slug: "transformers", number: 5, phase: "ML & AI Foundations", phaseNumber: 1, title: "Transformers & attention", subtitle: "The architecture that ate the ML world", duration: "~2h", project: "Attention visualizer in React", status: "coming-soon" },
  { slug: "embeddings-intro", number: 6, phase: "ML & AI Foundations", phaseNumber: 1, title: "Embeddings: numbers become geometry", subtitle: "Tokens, training, fine-tuning, RLHF", duration: "~1.5h", project: "Tokenizer cost dashboard", status: "coming-soon" },
  { slug: "prompt-engineering", number: 7, phase: "ML & AI Foundations", phaseNumber: 1, title: "Prompt engineering", subtitle: "System prompts, few-shot, chain-of-thought, structured output", duration: "~1.5h", project: "Prompt pattern library (Spring Boot)", status: "coming-soon" },

  // Phase 2
  { slug: "api-fundamentals", number: 8, phase: "API & Backend Integration", phaseNumber: 2, title: "Claude API fundamentals", subtitle: "Auth, models, parameters — from zero to first request", duration: "~1.5h", project: "AI code reviewer CLI", status: "coming-soon" },
  { slug: "spring-ai", number: 9, phase: "API & Backend Integration", phaseNumber: 2, title: "Spring AI integration", subtitle: "The Spring-native way to call LLMs", duration: "~2h", project: "Personal journal assistant", status: "coming-soon" },
  { slug: "tool-use", number: 10, phase: "API & Backend Integration", phaseNumber: 2, title: "Tool use & function calling", subtitle: "Let the LLM call your GraphQL resolvers", duration: "~2h", project: "GraphQL-aware assistant", status: "coming-soon" },
  { slug: "streaming", number: 11, phase: "API & Backend Integration", phaseNumber: 2, title: "Streaming with SSE", subtitle: "Token-by-token from Spring Boot to React", duration: "~1.5h", project: "Live story generator", status: "coming-soon" },
  { slug: "prompt-caching", number: 12, phase: "API & Backend Integration", phaseNumber: 2, title: "Prompt caching & cost", subtitle: "Running LLMs at production scale", duration: "~1.5h", project: "Cost dashboard", status: "coming-soon" },

  // Phase 3
  { slug: "embeddings-deep", number: 13, phase: "Vector Search & RAG", phaseNumber: 3, title: "Embeddings deep dive", subtitle: "Geometry, cosine similarity, models", duration: "~2h", project: "Semantic bookmark search", status: "coming-soon" },
  { slug: "pgvector", number: 14, phase: "Vector Search & RAG", phaseNumber: 3, title: "Vector DBs & pgvector", subtitle: "HNSW vs IVFFlat, indexing, Postgres integration", duration: "~2h", project: "Duplicate issue detector", status: "coming-soon" },
  { slug: "rag-architecture", number: 15, phase: "Vector Search & RAG", phaseNumber: 3, title: "RAG architecture", subtitle: "Chunking, retrieval, context assembly", duration: "~2h", project: "Doc chunking lab", status: "coming-soon" },
  { slug: "rag-spring", number: 16, phase: "Vector Search & RAG", phaseNumber: 3, title: "RAG in Spring Boot end-to-end", subtitle: "Spring AI + pgvector, full pipeline", duration: "~2h", project: "Chat with your docs", status: "coming-soon" },

  // Phase 4
  { slug: "react-streaming", number: 17, phase: "Frontend AI Integration", phaseNumber: 4, title: "React streaming patterns", subtitle: "SSE consumption, optimistic updates, tool results", duration: "~1.5h", project: "Chat UI component library", status: "coming-soon" },
  { slug: "chat-interface", number: 18, phase: "Frontend AI Integration", phaseNumber: 4, title: "Full chat interface", subtitle: "React + GraphQL + Spring Boot end-to-end", duration: "~2h", project: "Team standup bot", status: "coming-soon" },
  { slug: "multimodal", number: 19, phase: "Frontend AI Integration", phaseNumber: 4, title: "Multimodal inputs", subtitle: "Images, files, vision models", duration: "~1.5h", project: "Receipt parser", status: "coming-soon" },

  // Phase 5
  { slug: "agents-intro", number: 20, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Agent fundamentals", subtitle: "ReAct loop, memory, when NOT to use agents", duration: "~2h", project: "Research agent", status: "coming-soon" },
  { slug: "agent-spring", number: 21, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Agents in Spring Boot", subtitle: "Tool loop, state, stopping conditions", duration: "~2h", project: "Code migration agent", status: "coming-soon" },
  { slug: "multi-agent", number: 22, phase: "Agents & Advanced Patterns", phaseNumber: 5, title: "Multi-agent patterns", subtitle: "Orchestrator/subagent, parallelization", duration: "~1.5h", project: "PR review panel", status: "coming-soon" },

  // Phase 6
  { slug: "evals", number: 23, phase: "Production & Capstone", phaseNumber: 6, title: "Evals", subtitle: "LLM-as-judge, golden sets, regression testing", duration: "~1.5h", project: "Eval harness", status: "coming-soon" },
  { slug: "security", number: 24, phase: "Production & Capstone", phaseNumber: 6, title: "Security & guardrails", subtitle: "Prompt injection, PII, output filtering", duration: "~1.5h", project: "Injection test suite", status: "coming-soon" },
  { slug: "capstone", number: 25, phase: "Production & Capstone", phaseNumber: 6, title: "Capstone project", subtitle: "End-to-end AI engineering assistant", duration: "~3h", project: "Portfolio centerpiece", status: "coming-soon" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
