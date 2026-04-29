// Data Structures & Algorithms in Java — course definition.
// Pattern-first DSA prep for engineers returning to interview prep.

import type { Module } from "./ai";

export const COURSE_META = {
  id: "dsa" as const,
  slug: "dsa",
  name: "DSA in Java",
  shortName: "DSA Course",
  tagline: "Pattern-driven LeetCode prep, in Java",
  description:
    "A pattern-first course on data structures and algorithms — Big-O, arrays, hashing, trees, graphs, DP, and the named patterns LeetCode interviewers expect you to recognize on sight. Built for engineers who studied this once, years ago, and want intuition before rote memorization.",
  icon: "🧩",
  color: "from-emerald-500 to-teal-500",
  accent: "emerald",
  status: "available" as const,
};

export const PHASES = [
  { number: 0, name: "Orientation", color: "from-slate-500 to-slate-400" },
  { number: 1, name: "Complexity & the Mental Model", color: "from-rose-500 to-orange-500" },
  { number: 2, name: "Linear Data Structures", color: "from-amber-500 to-yellow-500" },
  { number: 3, name: "Hashing & Trees", color: "from-emerald-500 to-green-500" },
  { number: 4, name: "Graphs", color: "from-sky-500 to-blue-500" },
  { number: 5, name: "Java Collections in Depth", color: "from-cyan-500 to-sky-500" },
  { number: 6, name: "Algorithmic Techniques", color: "from-indigo-500 to-purple-500" },
  { number: 7, name: "Dynamic Programming", color: "from-fuchsia-500 to-pink-500" },
  { number: 8, name: "Advanced & Interview Prep", color: "from-pink-500 to-rose-500" },
];

export const MODULES: Module[] = [
  // Phase 0 · Orientation
  { slug: "welcome", number: 0, phase: "Orientation", phaseNumber: 0, title: "Welcome — how this course works", subtitle: "Pattern-first prep, LeetCode as a gym, and how checkpoints gate progress", duration: "~5 min", project: "No project — just read", status: "available" },

  // Phase 1 · Complexity & the Mental Model
  { slug: "big-o", number: 1, phase: "Complexity & the Mental Model", phaseNumber: 1, title: "Big-O from zero", subtitle: "Growth rates, why we ignore constants, and the 7 curves you'll meet", duration: "~1.5–2h", project: "Java micro-benchmark: plot operation counts vs n for each curve", status: "available" },
  { slug: "space-complexity", number: 2, phase: "Complexity & the Mental Model", phaseNumber: 1, title: "Space complexity & the call stack", subtitle: "Auxiliary vs total space, why recursion costs memory, JVM stack vs heap", duration: "~1–1.5h", project: "Trace memory for iterative vs recursive factorial; call-stack visualizer", status: "available" },
  { slug: "amortized-analysis", number: 3, phase: "Complexity & the Mental Model", phaseNumber: 1, title: "Best, average, worst & amortized analysis", subtitle: "Why ArrayList.add is O(1) on average, and when worst-case actually matters", duration: "~1–1.5h", project: "Amortized-cost simulator for a dynamic array", status: "available" },

  // Phase 2 · Linear Data Structures
  { slug: "arrays", number: 4, phase: "Linear Data Structures", phaseNumber: 2, title: "Arrays & dynamic arrays", subtitle: "Fixed vs dynamic, the doubling trick, ArrayList internals, prefix sums", duration: "~2–2.5h", project: "Build your own ArrayList in Java + LeetCode: Running Sum, Best Time to Buy/Sell Stock I", status: "available" },
  { slug: "strings", number: 5, phase: "Linear Data Structures", phaseNumber: 2, title: "Strings & string building", subtitle: "Immutability, why + in a loop is a trap, StringBuilder, char[] tricks", duration: "~1.5–2h", project: "Anagram + palindrome lab + LeetCode: Valid Anagram, Valid Palindrome, Reverse String", status: "available" },
  { slug: "linked-lists", number: 6, phase: "Linear Data Structures", phaseNumber: 2, title: "Linked lists (singly, doubly, circular)", subtitle: "Node-and-pointer model, dummy-head trick, fast/slow pointers", duration: "~2–2.5h", project: "Implement singly + doubly linked list + LeetCode: Reverse Linked List, Middle, Cycle", status: "available" },
  { slug: "stacks", number: 7, phase: "Linear Data Structures", phaseNumber: 2, title: "Stacks", subtitle: "LIFO, the call stack analogy, monotonic stacks (preview)", duration: "~1.5–2h", project: "Bracket-matcher + RPN calculator + LeetCode: Valid Parentheses, Min Stack, Daily Temperatures", status: "available" },
  { slug: "queues", number: 8, phase: "Linear Data Structures", phaseNumber: 2, title: "Queues & deques", subtitle: "FIFO, circular buffers, ArrayDeque (the one you should actually use)", duration: "~1.5–2h", project: "Ring-buffer implementation + LeetCode: Implement Queue using Stacks, Number of Recent Calls", status: "available" },

  // Phase 3 · Hashing & Trees
  { slug: "hashmaps", number: 9, phase: "Hashing & Trees", phaseNumber: 3, title: "Hash tables & HashMap", subtitle: "Hash functions, collisions, Java's HashMap internals, why equals/hashCode matter", duration: "~2.5–3h", project: "Build a tiny HashMap from scratch + LeetCode: Two Sum, Contains Duplicate, Group Anagrams", status: "available" },
  { slug: "sets", number: 10, phase: "Hashing & Trees", phaseNumber: 3, title: "Sets & frequency counting patterns", subtitle: "HashSet vs TreeSet, the count-then-check pattern that solves a surprising number of problems", duration: "~1.5h", project: "Sliding-window character counter + LeetCode: Intersection of Two Arrays, Longest Substring Without Repeating", status: "available" },
  { slug: "trees", number: 11, phase: "Hashing & Trees", phaseNumber: 3, title: "Trees & binary trees", subtitle: "Terminology, recursive structure, preorder/inorder/postorder by hand", duration: "~2–2.5h", project: "Tree builder + traversal visualizer + LeetCode: Max Depth, Same Tree, Invert Binary Tree", status: "available" },
  { slug: "bst", number: 12, phase: "Hashing & Trees", phaseNumber: 3, title: "Binary search trees & balanced trees", subtitle: "BST invariants, why unbalanced degrades to O(n), AVL/Red-Black intuition, TreeMap", duration: "~2–2.5h", project: "BST insert/search/delete from scratch + LeetCode: Validate BST, LCA of BST", status: "available" },
  { slug: "heaps", number: 13, phase: "Hashing & Trees", phaseNumber: 3, title: "Heaps & priority queues", subtitle: "Array-backed heap mechanics, sift-up/down, the top-K pattern", duration: "~1.5–2h", project: "Build a min-heap from scratch + LeetCode: Kth Largest, Last Stone Weight, Top K Frequent", status: "available" },

  // Phase 4 · Graphs
  { slug: "graphs-intro", number: 14, phase: "Graphs", phaseNumber: 4, title: "Graph fundamentals & representations", subtitle: "Directed/undirected, weighted/unweighted, adjacency list vs matrix", duration: "~1.5–2h", project: "Graph builder + neighbor-iterator API + LeetCode: Find if Path Exists in Graph", status: "coming-soon" },
  { slug: "bfs-dfs", number: 15, phase: "Graphs", phaseNumber: 4, title: "BFS & DFS", subtitle: "The two traversals, recursive vs iterative DFS, when BFS gives shortest path", duration: "~2.5–3h", project: "Maze solver (BFS + DFS visualized) + LeetCode: Number of Islands, Clone Graph, Rotting Oranges", status: "coming-soon" },
  { slug: "shortest-path", number: 16, phase: "Graphs", phaseNumber: 4, title: "Shortest path & topological sort", subtitle: "Dijkstra, BFS as unweighted shortest path, Kahn's algorithm, cycle detection", duration: "~2–2.5h", project: "Dijkstra on a small road-graph + LeetCode: Course Schedule I & II, Network Delay Time", status: "coming-soon" },

  // Phase 5 · Java Collections in Depth
  { slug: "java-collections", number: 17, phase: "Java Collections in Depth", phaseNumber: 5, title: "Java Collections Framework deep dive", subtitle: "The hierarchy, Big-O cheat sheet for every standard impl, Comparator vs Comparable", duration: "~1.5–2h", project: "Pick-the-right-collection decision worksheet + benchmark", status: "coming-soon" },

  // Phase 6 · Algorithmic Techniques
  { slug: "two-pointers", number: 18, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Two pointers", subtitle: "Opposite-end vs same-direction, the sorted-array tell", duration: "~1.5–2h", project: "LeetCode: Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water (intro)", status: "coming-soon" },
  { slug: "sliding-window", number: 19, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Sliding window (fixed & variable)", subtitle: "When to expand vs contract, the invariant, the frequency-map combo", duration: "~2–2.5h", project: "LeetCode: Maximum Average Subarray, Longest Substring Without Repeating, Minimum Window Substring", status: "coming-soon" },
  { slug: "binary-search", number: 20, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Binary search & answer-search pattern", subtitle: "Off-by-one minefield, lower/upper bound, binary-searching the answer", duration: "~2–2.5h", project: "LeetCode: Binary Search, Search in Rotated Sorted Array, Koko Eating Bananas, Find Peak Element", status: "coming-soon" },
  { slug: "sorting", number: 21, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Sorting algorithms", subtitle: "Bubble/selection/insertion for intuition, merge + quick for real, Arrays.sort internals", duration: "~2.5–3h", project: "Implement merge + quick from scratch + LeetCode: Sort Colors, Merge Intervals, Quickselect", status: "coming-soon" },
  { slug: "recursion", number: 22, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Recursion & divide-and-conquer", subtitle: "The recursion contract, base-case discipline, recurrence-relation shortcut for Big-O", duration: "~2–2.5h", project: "LeetCode: Pow(x, n), Merge K Sorted Lists, Sort an Array", status: "coming-soon" },
  { slug: "backtracking", number: 23, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Backtracking", subtitle: "Choose / explore / unchoose template, pruning, when backtracking is just stateful DFS", duration: "~2.5–3h", project: "LeetCode: Subsets, Permutations, Combinations, N-Queens, Word Search", status: "coming-soon" },
  { slug: "greedy", number: 24, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Greedy algorithms", subtitle: "When greedy works (and why it fails when it doesn't), exchange-argument intuition", duration: "~1.5–2h", project: "LeetCode: Jump Game, Gas Station, Task Scheduler, Non-overlapping Intervals", status: "coming-soon" },
  { slug: "bit-manipulation", number: 25, phase: "Algorithmic Techniques", phaseNumber: 6, title: "Bit manipulation", subtitle: "The operators you forgot existed, XOR's superpowers, bitmask DP teaser", duration: "~1.5–2h", project: "LeetCode: Single Number, Number of 1 Bits, Counting Bits, Sum of Two Integers", status: "coming-soon" },

  // Phase 7 · Dynamic Programming
  { slug: "dp-intro", number: 26, phase: "Dynamic Programming", phaseNumber: 7, title: "DP intuition: memoization & overlapping subproblems", subtitle: "The 'I keep recomputing the same thing' tell, top-down before bottom-up", duration: "~2.5–3h", project: "LeetCode: Climbing Stairs, House Robber, Fibonacci (the canonical example)", status: "coming-soon" },
  { slug: "dp-1d", number: 27, phase: "Dynamic Programming", phaseNumber: 7, title: "1D DP patterns", subtitle: "Linear-state DP, the 'decision at index i' template", duration: "~2–2.5h", project: "LeetCode: Coin Change, Word Break, Longest Increasing Subsequence, Decode Ways", status: "coming-soon" },
  { slug: "dp-2d", number: 28, phase: "Dynamic Programming", phaseNumber: 7, title: "2D DP & grid DP", subtitle: "Two-pointer state, edit-distance family, grid path-counting", duration: "~2.5–3h", project: "LeetCode: Unique Paths, Longest Common Subsequence, Edit Distance, 0/1 Knapsack", status: "coming-soon" },
  { slug: "dp-advanced", number: 29, phase: "Dynamic Programming", phaseNumber: 7, title: "Advanced DP: intervals, trees, bitmask", subtitle: "When state isn't just an index — DP on trees, bitmask DP for subsets", duration: "~2–2.5h", project: "LeetCode: Burst Balloons, House Robber III, Partition Equal Subset Sum", status: "coming-soon" },

  // Phase 8 · Advanced & Interview Prep
  { slug: "tries", number: 30, phase: "Advanced & Interview Prep", phaseNumber: 8, title: "Tries", subtitle: "The prefix-tree structure, when a trie beats a hashmap, autocomplete intuition", duration: "~1.5–2h", project: "Build a trie + LeetCode: Implement Trie, Word Search II, Replace Words", status: "coming-soon" },
  { slug: "union-find", number: 31, phase: "Advanced & Interview Prep", phaseNumber: 8, title: "Union-Find (Disjoint Set Union)", subtitle: "Path compression, union by rank, Kruskal's MST application", duration: "~1.5–2h", project: "Build DSU from scratch + LeetCode: Connected Components, Redundant Connection, Accounts Merge", status: "coming-soon" },
  { slug: "advanced-graph", number: 32, phase: "Advanced & Interview Prep", phaseNumber: 8, title: "Advanced graph: MST, Bellman-Ford, Floyd-Warshall", subtitle: "When Dijkstra isn't enough, negative weights, all-pairs shortest paths", duration: "~2–2.5h", project: "LeetCode: Min Cost to Connect All Points, Cheapest Flights Within K Stops", status: "coming-soon" },
  { slug: "interview-framework", number: 33, phase: "Advanced & Interview Prep", phaseNumber: 8, title: "Interview problem-solving framework", subtitle: "UMPIRE, pattern recognition from problem statements, communicating while you code", duration: "~1.5–2h", project: "3 mock-interview problems with full talk-aloud transcripts", status: "coming-soon" },
  { slug: "capstone", number: 34, phase: "Advanced & Interview Prep", phaseNumber: 8, title: "Capstone: 20-problem mixed set", subtitle: "Curated mixed-pattern problem set — pick the pattern, justify, then solve", duration: "~4–5h", project: "Portfolio-ready solutions repo with writeups", status: "coming-soon" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
