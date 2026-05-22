import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "motivation", title: "The motivating problem: prefix queries" },
  { id: "structure", title: "The trie data structure" },
  { id: "ops", title: "Insert, search, startsWith" },
  { id: "memory", title: "Array vs HashMap children — the tradeoff" },
  { id: "wordsearch", title: "Word Search II — DFS + trie" },
  { id: "replace", title: "Replace Words and when to reach for a trie" },
];

export default function TriesModule() {
  const mod = getModuleBySlug("tries")!;

  // The trie after inserting cat, car, card.
  const trieShape = `
flowchart TB
    R(("·<br/>root")) --> C(("c"))
    C --> A(("a"))
    A --> T(("t<br/>★"))
    A --> RR(("r<br/>★"))
    RR --> D(("d<br/>★"))
    style R fill:#1e293b,color:#fff,stroke:#475569
    style C fill:#fbcfe8,color:#000,stroke:#db2777
    style A fill:#fbcfe8,color:#000,stroke:#db2777
    style T fill:#10b981,color:#fff,stroke:#047857
    style RR fill:#10b981,color:#fff,stroke:#047857
    style D fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Shared "ca" prefix highlighted vs three independent strings.
  const sharing = `
flowchart LR
    subgraph FLAT["HashSet<String>: 3 separate copies of 'ca'"]
        direction TB
        S1["c · a · t"]
        S2["c · a · r"]
        S3["c · a · r · d"]
    end
    subgraph TREE["Trie: 'ca' stored once"]
        direction TB
        T1(("c"))
        T1 --> T2(("a"))
        T2 --> T3(("t<br/>★"))
        T2 --> T4(("r<br/>★"))
        T4 --> T5(("d<br/>★"))
    end
    FLAT --> TREE
    style FLAT fill:#fef3c7,color:#000,stroke:#d97706
    style TREE fill:#dcfce7,color:#000,stroke:#15803d
    style T1 fill:#fbcfe8,color:#000,stroke:#db2777
    style T2 fill:#fbcfe8,color:#000,stroke:#db2777
    style T3 fill:#10b981,color:#fff,stroke:#047857
    style T4 fill:#10b981,color:#fff,stroke:#047857
    style T5 fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // DFS + trie traversal on a small grid.
  const wordSearchII = `
flowchart TB
    subgraph G["Board"]
        direction TB
        G1["o · a · a · n"]
        G2["e · t · a · e"]
        G3["i · h · k · r"]
        G4["i · f · l · v"]
    end
    subgraph T["Trie of words: oath, pea, eat, rain"]
        direction TB
        TR(("root"))
        TR --> TO(("o"))
        TR --> TP(("p"))
        TR --> TE(("e"))
        TR --> TRn(("r"))
        TO --> TOA(("a"))
        TOA --> TOAT(("t"))
        TOAT --> TOATH(("h ★"))
    end
    G -->|"DFS walks board<br/>and trie together"| T
    T -->|"prune when char not<br/>in current node's children"| OUT["Found: oath, eat<br/>(skip pea, rain)"]
    style G fill:#1e293b,color:#fff,stroke:#475569
    style T fill:#fef3c7,color:#000,stroke:#d97706
    style OUT fill:#dcfce7,color:#000,stroke:#15803d
    style TOATH fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="tries" />
      <ModuleProgress moduleSlug="tries" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-3 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold tracking-wide uppercase">
          Module {mod.number} · {mod.phase}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · Phase 8 · Advanced &amp; Interview Prep</p>
      </div>

      {/* ───────────────── Part 1 · Motivation ───────────────── */}
      <Checkpoint moduleSlug="tries" id="motivation" title="I understand why a hashmap isn't enough for prefix queries" xp={15}>
      <section>
        <h2 id="motivation">The problem a hashmap can&apos;t solve well</h2>

        <p>
          Picture the autocomplete bar in your browser. You type <code>str</code> and the dropdown instantly fills with{" "}
          <em>strawberry</em>, <em>street</em>, <em>strange</em>, <em>strict</em>. Now imagine the dictionary behind it
          has 500,000 words. The query has to feel instant — sub-millisecond — and the answer changes with every keystroke.
        </p>

        <p>The interface is simple. Pick the right structure for it:</p>

        <CodeBlock lang="java">{`interface PrefixIndex {
    void insert(String word);
    List<String> wordsWithPrefix(String prefix);
    boolean contains(String word);
    boolean hasPrefix(String prefix);
}`}</CodeBlock>

        <h3>Attempt 1 — HashSet&lt;String&gt;</h3>

        <p>
          The first thing a Phase 3 graduate reaches for is a hashmap. <code>contains(word)</code> is O(1) average — perfect.
          But <code>wordsWithPrefix(prefix)</code> has no shortcut: the hashmap doesn&apos;t know about prefixes.
          You have to walk every word and check.
        </p>

        <CodeBlock lang="java">{`Set<String> dict = new HashSet<>();
// ... insert N words ...

List<String> wordsWithPrefix(String prefix) {
    List<String> out = new ArrayList<>();
    for (String w : dict) {                     // O(N)
        if (w.startsWith(prefix)) out.add(w);   // O(L) per check
    }
    return out;
}`}</CodeBlock>

        <p>
          That&apos;s <strong>O(N · L)</strong>, where N is the dictionary size and L is the average word length. For
          N = 500,000 and L = 8, that&apos;s 4 million character comparisons <em>per keystroke</em>. The hash function
          gave us O(1) lookup but threw away every structural relationship between keys.
        </p>

        <h3>Attempt 2 — sorted array + binary search</h3>

        <p>
          Sort the dictionary up front. Now binary-search for the lower bound of <code>prefix</code> — that&apos;s the
          first word starting with it. Walk forward until you hit a word that no longer starts with the prefix.
        </p>

        <CodeBlock lang="java">{`String[] dict = ...;                  // sorted
Arrays.sort(dict);

List<String> wordsWithPrefix(String prefix) {
    int lo = lowerBound(dict, prefix);       // O(L log N)
    List<String> out = new ArrayList<>();
    for (int i = lo; i < dict.length; i++) {
        if (!dict[i].startsWith(prefix)) break;
        out.add(dict[i]);
    }
    return out;
}`}</CodeBlock>

        <p>
          Better: <strong>O(L log N)</strong>{" "}to find the first match, then O(K · L) to enumerate K matches. But the
          <em>find</em>{" "}phase is still proportional to log N — every keystroke pays a log factor in N. And if the
          dictionary mutates (autocomplete adds new entries as the user types), keeping the array sorted costs O(N) per
          insert.
        </p>

        <h3>What we actually want</h3>

        <Callout variant="insight" title="The dream complexity">
          <p>
            <code>wordsWithPrefix(prefix)</code> in <strong>O(L)</strong>{" "}to <em>find</em>{" "}the matches — independent of N
            — plus O(K · L) to enumerate K matches. Insert in O(L). Mutate freely. The structure should grow with the
            shape of the data, not its size.
          </p>
          <p>
            The trick: stop treating each word as an opaque blob. Treat words as <em>paths</em>. Build a tree where each
            edge is one character; following a path spells a word. Now finding all words with prefix <code>str</code> is
            literally &quot;walk down the s-t-r path, then enumerate the subtree.&quot;
          </p>
        </Callout>

        <p>
          That&apos;s a <strong>trie</strong> (rhymes with &quot;try&quot;, from re<strong>trie</strong>val). It&apos;s
          one of those structures where, once you see it, you can&apos;t unsee it — because every prefix problem on the
          interview circuit reduces to it.
        </p>

        <Quiz
          kind="Quick check"
          question="A dictionary of 1,000,000 words. You need to answer 'how many words start with this 5-letter prefix?' for 10,000 different prefixes. Roughly how does HashSet<String> compare to a trie?"
          options={[
            { label: "HashSet wins — O(1) lookup is the fastest possible.", explanation: "O(1) is for exact lookup, not prefix lookup. HashSet has no notion of prefixes; you'd have to scan every entry." },
            { label: "About the same — both walk all 1M entries.", explanation: "The trie does NOT walk all entries. It walks the 5-character prefix path and then enumerates the subtree." },
            { label: "Trie wins by a huge margin: ~5 char-walks per query vs scanning a million entries each time.", correct: true, explanation: "Right. Trie is O(L) per query where L = prefix length, totally independent of N. HashSet is O(N · L) per query because it has no shortcut for 'does any key start with this prefix?'. With 10,000 queries that's 10,000 · 5 ≈ 50K work for the trie vs 10,000 · 8M ≈ 80B work for the HashSet. Different universe." },
            { label: "HashSet, but only for short prefixes.", explanation: "Prefix length doesn't help HashSet — it has to scan every entry regardless." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="What does the sorted-array-plus-binary-search approach lose to a trie?"
          options={[
            { label: "It's slower asymptotically — O(L log N) vs O(L) per find.", correct: true, explanation: "Right. Binary search adds a log N factor that the trie doesn't pay. Plus, mutation is expensive (O(N) per insert to keep the array sorted), while the trie inserts in O(L). The trie wins on both axes when the dictionary changes." },
            { label: "Nothing — they're equivalent for prefix queries.", explanation: "They have different complexity classes. And the trie handles mutation gracefully; the sorted array doesn't." },
            { label: "Memory — sorted array uses much more.", explanation: "Sorted array is actually more memory-efficient than a trie for storage. The trie wins on time, not space." },
            { label: "It can't enumerate matches in sorted order.", explanation: "Both can enumerate in sorted order — sorted array trivially, trie via DFS visiting children in alphabetic order." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Structure ───────────────── */}
      <Checkpoint moduleSlug="tries" id="structure" title="I can draw a trie and explain structural sharing" xp={20}>
      <section>
        <h2 id="structure">The trie data structure</h2>

        <p>
          A trie is a tree where each <em>edge</em>{" "}is labeled with one character. A path from the root to a node
          spells out a string. Some nodes are marked as &quot;end of word&quot; — meaning &quot;the path that ends here
          is a real word in the dictionary&quot;. Nodes that aren&apos;t marked are still useful: they hold the
          structural backbone for words that pass through them.
        </p>

        <h3>Inserting <code>cat</code>, <code>car</code>, <code>card</code></h3>

        <Mermaid chart={trieShape} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Stars (★) mark <code>isEnd</code> nodes. The path root → c → a → t spells &quot;cat&quot;. The path
          root → c → a → r spells &quot;car&quot; — and the same r-node continues to d to spell &quot;card&quot;.
        </p>

        <p>
          Notice what just happened. The three words share the prefix <code>ca</code>, and that prefix appears
          <strong> exactly once</strong>{" "}in the structure. <code>car</code> and <code>card</code> share even more —
          <code>card</code> is just <code>car</code> with one more character beneath it. This is the structural-sharing
          win that drives every trie advantage:
        </p>

        <Mermaid chart={sharing} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          A HashSet stores three independent strings. A trie stores their <em>shared structure</em>{" "}once.
        </p>

        <Callout variant="insight" title="Why the structure is the answer">
          <p>
            Every prefix in the dictionary corresponds to a single path from the root. To find &quot;all words with
            prefix P&quot;, walk down the path P (O(|P|) work), then enumerate the subtree rooted there.
            To check &quot;does any word in the dictionary start with P?&quot;, walk down the path P and check
            whether you got there at all — no enumeration needed, just O(|P|).
          </p>
          <p>
            Both queries depend on the prefix length, not the dictionary size. The dictionary size shows up only
            when you actually need to <em>enumerate</em>{" "}matches — and even then it&apos;s output-sensitive: you pay
            O(K · L) to list K matches, not O(N).
          </p>
        </Callout>

        <h3>The Java node</h3>

        <p>The skeleton everyone writes:</p>

        <CodeBlock lang="java">{`class TrieNode {
    TrieNode[] children = new TrieNode[26];   // one slot per lowercase letter
    boolean isEnd;                             // true if a word ends here
}`}</CodeBlock>

        <p>
          A few things to notice. There&apos;s no character stored on the node itself — the character is implicit in
          which slot of the parent&apos;s <code>children</code> array points to it. The root node represents the empty
          prefix and is just a <code>TrieNode</code> like any other (its <code>isEnd</code> would only be true if you
          inserted the empty string, which you usually don&apos;t).
        </p>

        <Callout variant="info" title="Array vs HashMap children — both are valid">
          <p>
            Some implementations use <code>TrieNode[26]</code> (or <code>[256]</code> for ASCII), others use
            <code> HashMap&lt;Character, TrieNode&gt;</code>. Each has tradeoffs we&apos;ll get into in Part 4. For now,
            assume <code>TrieNode[26]</code> for the &quot;lowercase letters only&quot; problems that dominate
            interviews.
          </p>
        </Callout>

        <h3>Two fundamental cases of nodes</h3>

        <p>
          A trie node is either:
        </p>

        <ul>
          <li>
            <strong>Terminal for a word</strong> (<code>isEnd == true</code>). The path from root to this node spells a
            real dictionary word. It may or may not have children.
          </li>
          <li>
            <strong>Internal-only</strong> (<code>isEnd == false</code>). The path is a prefix of some real word, but
            isn&apos;t itself a word. It must have at least one child or it would never have been created.
          </li>
        </ul>

        <p>
          So <code>isEnd</code> and &quot;has children&quot; are independent. <code>card</code> can be a word
          (<code>isEnd</code>) and have a child (if you also insert <code>cards</code>). <code>car</code> can be a word
          (<code>isEnd</code>) and have a child (the &quot;d&quot; that branches into <code>card</code>).
          <code>ca</code> is just an internal node — not a word in this dictionary, but a needed waypoint.
        </p>

        <Quiz
          kind="Structure check"
          question="You insert 'car' and then 'cars' into an empty trie. After both inserts, what's true of the node at the end of the 'r' path?"
          options={[
            { label: "It has isEnd = false because 'cars' is longer.", explanation: "Inserting 'cars' doesn't unset the isEnd of 'car'. Both words remain in the trie." },
            { label: "It has isEnd = true and one child (the 's').", correct: true, explanation: "Right. 'car' set isEnd on the r-node when it was inserted. 'cars' then attached an 's' child but didn't touch the r-node's isEnd. So the r-node is BOTH a terminal (for 'car') AND an internal node (on the way to 'cars'). isEnd and 'has children' are independent." },
            { label: "It's been replaced by the 's' node.", explanation: "Tries don't replace nodes; they extend paths." },
            { label: "It has isEnd = true and no children.", explanation: "It MUST have a child for 'cars' to be in the trie at all." },
          ]}
        />

        <Quiz
          kind="Structure check"
          question="A trie holds 'apple', 'app', and 'apt'. How many trie nodes total (excluding the implicit root)?"
          options={[
            { label: "11 — one per character per word, no sharing.", explanation: "There IS sharing. 'a' is one node, not three." },
            { label: "6: a, p, p, l, e, t — one shared prefix 'ap', then 'p-l-e' for 'apple' and 't' for 'apt'.", correct: true, explanation: "Right. Shared 'a' (1) → shared 'p' (2). Then 'p' splits: 'apple' continues with another 'p' (3) → 'l' (4) → 'e' (5) which has isEnd. The 'p' at node 3 also has isEnd for 'app'. The 'apt' branch from node 2 adds a 't' (6). Total: 6 nodes. Notice 'app' doesn't add a new node — it just turns isEnd on at node 3, which was already created on the path to 'apple'." },
            { label: "5 — same as the longest word.", explanation: "Words that branch off (like 'apt' from 'ap') need new nodes for the diverging characters." },
            { label: "3 — one per word.", explanation: "Tries are character-level, not word-level." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Operations ───────────────── */}
      <Checkpoint moduleSlug="tries" id="ops" title="I can implement insert, search, and startsWith" xp={20}>
      <section>
        <h2 id="ops">Insert, search, startsWith</h2>

        <p>
          All three operations have the same skeleton: walk down the trie one character at a time, indexing into
          <code> children</code>. They differ only in what they do at each step and at the end.
        </p>

        <h3>Insert</h3>

        <p>
          Walk down the path corresponding to the word. Whenever the next child you need doesn&apos;t exist, create it.
          When you reach the end of the word, mark <code>isEnd = true</code>.
        </p>

        <CodeBlock lang="java">{`public class Trie {
    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (node.children[c] == null) {
                node.children[c] = new TrieNode();
            }
            node = node.children[c];
        }
        node.isEnd = true;
    }
}`}</CodeBlock>

        <p>
          Cost: O(L) where L is the word length. We touch one node per character, do O(1) work at each (an array
          index, a null-check, a possible allocation). Total allocations per insert: at most L new nodes, often fewer
          if the prefix already exists.
        </p>

        <h3>Search — does the dictionary contain this exact word?</h3>

        <p>
          Walk down the same way, but if you ever hit a missing child, the word isn&apos;t in the trie. At the end,
          confirm <code>isEnd</code> — because reaching a node only proves the word is a <em>prefix</em>{" "}of something in
          the dictionary, not necessarily a stored word itself.
        </p>

        <CodeBlock lang="java">{`public boolean search(String word) {
    TrieNode node = walkDown(word);
    return node != null && node.isEnd;
}

private TrieNode walkDown(String s) {
    TrieNode node = root;
    for (int i = 0; i < s.length(); i++) {
        int c = s.charAt(i) - 'a';
        if (node.children[c] == null) return null;
        node = node.children[c];
    }
    return node;
}`}</CodeBlock>

        <Callout variant="warn" title="The classic trie search bug">
          <p>
            Forgetting the <code>isEnd</code> check at the end. <code>walkDown(&quot;ca&quot;)</code> on a trie holding
            only &quot;cat&quot; returns a non-null node — the &quot;a&quot; in the path — even though &quot;ca&quot;
            isn&apos;t a stored word. If your <code>search</code> returns true based purely on &quot;walk succeeded&quot;,
            you&apos;ll claim every prefix of every word is a word. Always check <code>isEnd</code>.
          </p>
        </Callout>

        <h3>StartsWith — does any word begin with this prefix?</h3>

        <p>
          Same walk, but no <code>isEnd</code> check. Reaching the prefix node at all means at least one word in the
          trie passes through it.
        </p>

        <CodeBlock lang="java">{`public boolean startsWith(String prefix) {
    return walkDown(prefix) != null;
}`}</CodeBlock>

        <p>
          That tiny one-line difference — checking <code>isEnd</code> or not — is the entire reason tries beat hashmaps
          on autocomplete-style problems. <code>HashMap&lt;String, V&gt;.containsKey</code> can answer
          <em> &quot;is this exactly a key?&quot;</em>{" "}but not <em>&quot;is this a prefix of any key?&quot;</em>. The
          trie answers both with the same machinery.
        </p>

        <h3>Putting it together — LeetCode 208</h3>

        <p>
          LC 208 (&quot;Implement Trie&quot;) is a Medium that asks for exactly these three operations. Hand it in as:
        </p>

        <CodeBlock lang="java">{`class Trie {
    private static class Node {
        Node[] children = new Node[26];
        boolean isEnd;
    }

    private final Node root = new Node();

    public void insert(String word) {
        Node n = root;
        for (char ch : word.toCharArray()) {
            int c = ch - 'a';
            if (n.children[c] == null) n.children[c] = new Node();
            n = n.children[c];
        }
        n.isEnd = true;
    }

    public boolean search(String word) {
        Node n = walk(word);
        return n != null && n.isEnd;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        Node n = root;
        for (char ch : s.toCharArray()) {
            int c = ch - 'a';
            if (n.children[c] == null) return null;
            n = n.children[c];
        }
        return n;
    }
}`}</CodeBlock>

        <Callout variant="info" title="Walking traces the same path three times">
          <p>
            Notice all three operations share the same <code>walk</code> helper. That&apos;s not just code reuse —
            it&apos;s a design hint. Any operation you add later (delete, count-words-with-prefix, longest-common-prefix)
            will start with the same walk. The trie&apos;s structure <em>is</em>{" "}its API.
          </p>
        </Callout>

        <h3>Complexity recap</h3>

        <ul>
          <li><code>insert(word)</code>: <strong>O(L)</strong>{" "}time, up to L new nodes allocated.</li>
          <li><code>search(word)</code>: <strong>O(L)</strong>{" "}time, no allocations.</li>
          <li><code>startsWith(prefix)</code>: <strong>O(|prefix|)</strong>{" "}time, no allocations.</li>
          <li><code>wordsWithPrefix(prefix)</code> (enumeration): O(|prefix|) to find, then O(K · L) to walk the subtree and emit K results.</li>
        </ul>

        <p>
          All four are <strong>independent of N</strong>, the number of words stored. That&apos;s the headline.
        </p>

        <Quiz
          kind="Code check"
          question="In the search method, what's the bug if you write `return walk(word) != null;` instead of also checking isEnd?"
          options={[
            { label: "It returns false too often.", explanation: "It returns true too often, not too few." },
            { label: "It claims every prefix of a stored word is itself a stored word.", correct: true, explanation: "Right. Reaching a node just means the input is a prefix of something in the trie, not that the input was inserted as a complete word. Without the isEnd check, search('ca') returns true even when only 'cat' was inserted. The isEnd flag is exactly what distinguishes 'real word' from 'just a prefix on the way to one'." },
            { label: "It always returns true.", explanation: "It returns true only when the walk succeeds. Words not in the trie that aren't even prefixes of anything still return false correctly." },
            { label: "It's slower.", explanation: "It's the same speed; the bug is correctness, not performance." },
          ]}
        />

        <Quiz
          kind="Code check"
          question="You call `insert('cat')` then `insert('cats')` then `search('cat')`. What does search return, and why?"
          options={[
            { label: "false — 'cat' got overwritten when 'cats' was inserted.", explanation: "Inserting 'cats' doesn't overwrite 'cat'. It extends the path beyond 'cat'." },
            { label: "true — the t-node still has isEnd=true (set by the first insert), even though it now also has an 's' child.", correct: true, explanation: "Right. Inserting 'cats' walks through c → a → t, finds them all there (great, no allocation), then creates an 's' child of t and marks IT as isEnd. The t-node's own isEnd from the original 'cat' insert remains untouched. So both 'cat' (ends at t-node) and 'cats' (ends at s-node) are in the trie simultaneously. This is the case where a node is both a word terminal and an internal node — totally normal." },
            { label: "false — the t-node became an internal node when 's' was added.", explanation: "Adding a child doesn't change the parent's isEnd flag. They're independent." },
            { label: "Compile error.", explanation: "No, this is valid Java. Both inserts succeed and search returns true." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Memory tradeoff ───────────────── */}
      <Checkpoint moduleSlug="tries" id="memory" title="I can reason about array vs HashMap children" xp={15}>
      <section>
        <h2 id="memory">Array vs HashMap children — the tradeoff</h2>

        <p>
          The first design decision when building a trie is how each node stores its children. There are two common
          choices and each is right in different circumstances. Internalize both — interviewers love asking which one
          you&apos;d pick and why.
        </p>

        <h3>Option A — fixed-size array</h3>

        <CodeBlock lang="java">{`class TrieNode {
    TrieNode[] children = new TrieNode[26];   // every node carries 26 slots
    boolean isEnd;
}`}</CodeBlock>

        <ul>
          <li><strong>Lookup &quot;does this character go here?&quot;:</strong>{" "}O(1), one array index. No hashing, no comparison.</li>
          <li>
            <strong>Memory per node:</strong> 26 reference slots × 8 bytes (on a 64-bit JVM) = 208 bytes — even if the
            node only actually uses one or two slots. Plus header + isEnd. ~220 bytes total.
          </li>
          <li><strong>Best for:</strong>{" "}dense alphabets where most slots are used (English-words tries near the root, especially), and when you want the absolute fastest per-character cost.</li>
        </ul>

        <h3>Option B — HashMap children</h3>

        <CodeBlock lang="java">{`class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEnd;
}`}</CodeBlock>

        <ul>
          <li><strong>Lookup:</strong>{" "}O(1) average, but with the hashmap constant factor — hashCode, equals, bucket walk. Several times slower per character than the array version in practice.</li>
          <li>
            <strong>Memory per node:</strong>{" "}a small HashMap with K entries is roughly 48 + 32·K bytes. A node with 2
            children: ~112 bytes. A node with 26 children: ~880 bytes. The break-even with the array version is around
            K ≈ 5: below that, HashMap wins on memory; above that, the array wins.
          </li>
          <li><strong>Best for:</strong>{" "}sparse alphabets (Unicode, full ASCII, mixed-case strings, words with digits and punctuation), and the deep parts of a trie where most nodes have just one child.</li>
        </ul>

        <h3>How big is a trie, anyway?</h3>

        <p>
          Worst case: N words averaging length L, with no shared prefixes — N · L nodes total. Best case: tons of shared
          prefixes — closer to L · A nodes, where A is the alphabet size (because the &quot;wide&quot; part near the root
          fills out and the &quot;deep&quot; parts share heavily).
        </p>

        <p>
          A real-world example: 470,000 lowercase English words from a /usr/share/dict/words file. With array-of-26:
        </p>

        <CodeBlock lang="java">{`// Rough sizing
nodes  ≈ 1,000,000   (lots of shared prefixes near the root, less sharing deeper)
bytes  ≈ 1,000,000 × 220 = 220 MB

// With HashMap children:
bytes  ≈ 1,000,000 × ~80 (avg, since most nodes have 1–2 children) = 80 MB`}</CodeBlock>

        <Callout variant="warn" title="Memory is the trie's real cost">
          <p>
            Tries are <strong>memory-hungry</strong>. A trie of 500K English words can easily push 100–200 MB.
            For LeetCode-sized inputs (thousands of words), this is invisible. For production-scale dictionaries,
            it&apos;s real, and people use compressed variants (radix trees, ternary search trees, succinct tries)
            to bring it down.
          </p>
          <p>
            For interviews, just be aware that &quot;tries trade memory for speed&quot; is the right shape of the answer.
            If memory is tight and you don&apos;t need prefix queries, a hashmap is just simpler.
          </p>
        </Callout>

        <h3>The case for hybrid implementations</h3>

        <p>
          Production tries often switch representations per node. Near the root, where most slots are populated, use an
          array. Deep down, where each node has one child on average, use a HashMap or a single-link list. The JDK
          doesn&apos;t ship a built-in trie, but Apache Commons and Guava both have implementations that do this.
        </p>

        <p>
          For interviews, pick one representation and explain the tradeoff if asked. The 26-array version is the
          shortest code and is what most graders expect.
        </p>

        <h3>When is a trie actually the right answer?</h3>

        <ClassifyChallenge
          title="Trie or no trie?"
          prompt="For each scenario, decide whether a trie is the right structure. The wrong-answer category captures cases where a hashmap (or sorted array, or other structure) is just as good or better."
          buckets={[
            { id: "yes", label: "Yes — reach for a trie", color: "rose" },
            { id: "no", label: "No — use a hashmap or other", color: "indigo" },
          ]}
          items={[
            { id: "auto", label: "Autocomplete: given a prefix, return the top 10 matching words.", answer: "yes", explanation: "Classic trie use case. Walk to the prefix node in O(L), then DFS the subtree to enumerate matches." },
            { id: "exact", label: "Exact-membership lookup only: 'is this email address in our blocklist?' — never partial matches.", answer: "no", explanation: "HashSet<String> is faster and uses much less memory. A trie buys you nothing here because you never query by prefix." },
            { id: "wordsearch", label: "Word Search II on a board: find any of 5,000 dictionary words appearing as paths in a 12×12 grid.", answer: "yes", explanation: "The DFS-walks-trie-and-board pattern (next checkpoint). Without the trie, you'd run DFS once per word; with the trie, one DFS finds them all." },
            { id: "spellcheck", label: "Spell-check: 'is this exact word in the dictionary?'", answer: "no", explanation: "Pure exact membership = HashSet. A trie works but doesn't pay for itself unless you also need 'words within edit distance 1' (which IS a trie problem)." },
            { id: "phone", label: "Phone-keypad T9 style: given digit string '4663', find all dictionary words it could spell.", answer: "yes", explanation: "Walks the trie following keypad-letter sets per digit. Each digit branches up to 4 ways; trie pruning kills hopeless paths early." },
            { id: "longest-common", label: "Longest common prefix of an array of strings.", answer: "yes", explanation: "Build a trie of all the strings; the LCP is the path from root until you hit a node with isEnd or more than one child. (Though you can also do it without a trie via vertical scan.)" },
            { id: "anagram", label: "Anagram detection: 'are these two words anagrams of each other?'", answer: "no", explanation: "Anagrams aren't about prefixes. Sort both strings and compare, or use a 26-array character count. Trie has no advantage." },
            { id: "ipv4", label: "Routing table: given an IP address, find the longest prefix match in a CIDR table.", answer: "yes", explanation: "Real-world tries are the standard structure for IP routing tables — same 'longest prefix match' shape as autocomplete. Bit-tries (radix tries) are the production choice." },
            { id: "freq", label: "Top-100 most frequent words in a stream.", answer: "no", explanation: "Frequency counting + bounded heap. Trie isn't useful unless you also need prefix queries on the words." },
            { id: "replace", label: "Given a sentence, replace each word with its shortest dictionary 'root' that's a prefix of it.", answer: "yes", explanation: "Build a trie of roots; for each word, walk the trie until isEnd. Covered in Part 6 — this is LC 648 Replace Words." },
          ]}
        />

        <Quiz
          kind="Memory check"
          question="A trie of 100,000 English words uses ~250 MB with TrieNode[26] children. You measure that the same 100,000 words in HashSet<String> takes only ~25 MB. Why such a gap?"
          options={[
            { label: "HashSet uses less memory because it doesn't store individual characters.", explanation: "HashSet stores each full string. Strings are char[] internally; total characters stored is the same in both." },
            { label: "TrieNode[26] reserves 26 reference slots per node even when most are null, and a million-node trie has a million × 208 bytes of mostly-empty slot overhead.", correct: true, explanation: "Right. The fixed array is the killer. Every internal node carries 208 bytes of children references whether it uses one slot or 26. With ~1M trie nodes, that's >200MB of mostly-null overhead. Switching to HashMap children (or to a more compact representation like a sorted child list) brings the trie down dramatically — often to within 2-3x of the HashSet baseline." },
            { label: "HashSet hashes each string to one bucket, eliminating duplicates.", explanation: "There are no duplicates in either case (they're sets of distinct words). The memory difference isn't from deduplication." },
            { label: "Tries store each character twice (once for the path, once for the value).", explanation: "Tries don't store the character at all — it's implicit in the array slot index. The bloat is the empty array slots, not character storage." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Word Search II ───────────────── */}
      <Checkpoint moduleSlug="tries" id="wordsearch" title="I see why Word Search II is a trie problem" xp={20}>
      <section>
        <h2 id="wordsearch">Word Search II — the DFS + trie combo</h2>

        <p>
          Word Search II (LC 212) is one of the canonical &quot;you should know this is a trie problem&quot; questions
          on the interview circuit. The setup:
        </p>

        <Callout variant="info" title="LC 212 · Word Search II">
          <p>
            Given an <code>m×n</code> board of lowercase letters and a list of <code>words</code>, return every word
            that appears as a path on the board (moving up/down/left/right to adjacent cells, no cell reused per word).
          </p>
        </Callout>

        <h3>The naive solution (and why it&apos;s slow)</h3>

        <p>
          For each word in the list, run a DFS from every cell of the board, trying to match that word character by
          character. Cost per word: O(M · N · 4<sup>L</sup>) where M·N is the board size and L the word length. Total:
        </p>

        <CodeBlock lang="java">{`for each word w in words {           //  W words
    for each cell (r, c) {            //  M·N cells
        dfs(r, c, w, 0);              //  up to 4^L paths
    }
}
// Total: O(W · M · N · 4^L)`}</CodeBlock>

        <p>
          For W = 5,000 words, an 8×8 board, L = 10, that&apos;s ~5,000 × 64 × 1,000,000 ≈ 3 × 10<sup>11</sup>
          operations. Times out hard on LeetCode.
        </p>

        <h3>The insight</h3>

        <p>
          Most of the work in the naive solution is wasted. From cell (3, 4), if no word starts with the letter at that
          cell, all 4<sup>L</sup> paths from there are pointless. We&apos;re re-deriving &quot;does any word start
          here?&quot; from scratch every time.
        </p>

        <p>
          A trie answers <em>that</em>{" "}question in O(1). And once we&apos;re at a trie node, we know exactly which next
          characters could possibly continue a word — they&apos;re the keys of <code>node.children</code>. So:
        </p>

        <Callout variant="insight" title="The trie + DFS pattern">
          <p>
            Build a trie of all dictionary words once. Then run a single DFS over the board, walking the trie
            simultaneously: at each step, the trie node tells you which letters are still in play. If the current cell&apos;s
            letter isn&apos;t in <code>currentTrieNode.children</code>, abandon this path immediately.
          </p>
          <p>
            We pay O(W · L) once to build the trie. Then DFS is bounded by &quot;paths in the board that match prefixes
            of any word&quot;, which the trie aggressively prunes.
          </p>
        </Callout>

        <Mermaid chart={wordSearchII} />

        <h3>The Java sketch</h3>

        <p>
          The trie node here is slightly enriched — instead of a boolean <code>isEnd</code>, we store the actual word
          string at terminal nodes. That way, when we hit a complete word during DFS, we have the string ready to add to
          the result without backtracking the path to recover it.
        </p>

        <CodeBlock lang="java">{`class TrieNode {
    TrieNode[] children = new TrieNode[26];
    String word;          // non-null only at terminal nodes; null elsewhere
}

public List<String> findWords(char[][] board, String[] words) {
    TrieNode root = buildTrie(words);
    List<String> result = new ArrayList<>();
    int m = board.length, n = board[0].length;

    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            dfs(board, r, c, root, result);
        }
    }
    return result;
}

private void dfs(char[][] board, int r, int c, TrieNode node, List<String> out) {
    char ch = board[r][c];
    if (ch == '#') return;                          // already used in this path
    TrieNode next = node.children[ch - 'a'];
    if (next == null) return;                       // KEY PRUNE: no word continues here

    if (next.word != null) {
        out.add(next.word);
        next.word = null;                            // dedupe: don't report twice
    }

    board[r][c] = '#';                              // mark visited in-place
    if (r > 0)               dfs(board, r - 1, c, next, out);
    if (r < board.length - 1) dfs(board, r + 1, c, next, out);
    if (c > 0)               dfs(board, r, c - 1, next, out);
    if (c < board[0].length - 1) dfs(board, r, c + 1, next, out);
    board[r][c] = ch;                               // restore on backtrack
}

private TrieNode buildTrie(String[] words) {
    TrieNode root = new TrieNode();
    for (String w : words) {
        TrieNode n = root;
        for (char c : w.toCharArray()) {
            int idx = c - 'a';
            if (n.children[idx] == null) n.children[idx] = new TrieNode();
            n = n.children[idx];
        }
        n.word = w;
    }
    return root;
}`}</CodeBlock>

        <h3>Three small but critical tricks in this code</h3>

        <ol>
          <li>
            <strong>Storing the word at terminal nodes</strong>{" "}instead of a boolean. When the DFS hits a terminal,
            it has the full string in hand and doesn&apos;t need to reconstruct it from the path — saves both code and
            a string-builder allocation per match.
          </li>
          <li>
            <strong>Setting <code>next.word = null</code> after reporting</strong>. This deduplicates: if the same word
            can be formed from multiple board paths, we only emit it once. Without this, you&apos;d return duplicates
            and need a HashSet pass at the end.
          </li>
          <li>
            <strong>In-place visited marking</strong>{" "}via <code>board[r][c] = &apos;#&apos;</code> then restore on
            backtrack. Avoids allocating an explicit visited matrix. The character &apos;#&apos; is outside [a, z] so
            <code>board[r][c] - &apos;a&apos;</code> falls outside the children array&apos;s valid index range — except
            that we check <code>ch == &apos;#&apos;</code> first to short-circuit.
          </li>
        </ol>

        <Callout variant="warn" title="One edge case: what if a node has no children left?">
          <p>
            After reporting a word and continuing the DFS, the trie node we&apos;re at might have no remaining
            children. A common further optimization is to <strong>prune the trie</strong>{" "}as we go: when a node has no
            children left and no word, splice it out of the parent. This means &quot;shrink the search space as words
            are found&quot;. It&apos;s about 5 extra lines and meaningful for large word lists. The skeleton above is
            the cleanest version that passes LC 212; the pruning is a stretch upgrade.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Build trie:</strong>{" "}O(W · L) time and memory.</li>
          <li><strong>DFS:</strong>{" "}bounded by the number of valid trie-paths through the board. In the worst case still O(M · N · 4<sup>L_max</sup>), but the pruning eliminates most paths early — orders of magnitude faster in practice.</li>
        </ul>

        <p>
          The headline win: instead of W independent searches, you do <em>one</em>{" "}search that prunes the moment the
          board path diverges from every dictionary word.
        </p>

        <Quiz
          kind="Pattern check"
          question="In Word Search II, why store the full word at the terminal trie node instead of a boolean isEnd?"
          options={[
            { label: "Performance — it's faster to compare strings than booleans.", explanation: "The booleans aren't being compared in a hot loop; that's not the issue." },
            { label: "Convenience — when DFS hits a terminal, the word is in hand and you don't need to reconstruct it from the path.", correct: true, explanation: "Right. With a boolean, you'd need to track the path (a StringBuilder) during DFS just so you could materialize the matched word at the end. Storing the word string at the terminal eliminates that — cleaner code, fewer allocations. Setting node.word = null after reporting also gives you free deduplication." },
            { label: "Required by the trie definition.", explanation: "Tries don't require word storage at terminals; a boolean is the standard. Storing the word is an optimization specific to enumeration-heavy use cases like Word Search II." },
            { label: "It's the only way to dedupe.", explanation: "Dedup can also be done with a HashSet of results. But null-ing out the word is a more elegant deduplication that piggybacks on the storage choice." },
          ]}
        />

        <Quiz
          kind="Pattern check"
          question="The board has cells marked '#' to indicate 'currently being visited in the active DFS path'. Why mark in-place rather than using a separate boolean[][] visited array?"
          options={[
            { label: "Marking in-place is the only correct way.", explanation: "Both work. In-place is just a memory micro-optimization." },
            { label: "Avoids allocating a separate M×N matrix per call. Restored on backtrack so the board ends unchanged.", correct: true, explanation: "Right. The boolean[][] approach works fine but allocates m·n bytes upfront. In-place reuses the existing storage by overwriting with a sentinel, then restoring. The trick: '#' is outside [a,z] and the explicit if-check handles it cleanly. This pattern shows up across grid-DFS problems whenever the input is mutable and you can stomach the local mutation." },
            { label: "Boolean arrays are slower to access.", explanation: "Java boolean[] access is fine. The motivation is allocation, not access speed." },
            { label: "It marks the cell permanently visited so future calls skip it.", explanation: "It's restored on backtrack, so it's NOT permanent. If it were, the second word couldn't reuse a cell." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Replace Words + recap ───────────────── */}
      <Checkpoint moduleSlug="tries" id="replace" title="I've completed Module 37 — Tries" xp={25} celebration="Tries unlock the prefix-query family. Next: Union-Find for connectivity and partitioning.">
      <section>
        <h2 id="replace">Replace Words and the prefix-replacement pattern</h2>

        <p>
          One more canonical trie problem to internalize the &quot;walk the trie until you hit isEnd&quot; idiom.
        </p>

        <Callout variant="info" title="LC 648 · Replace Words">
          <p>
            Given a list of <code>roots</code> and a sentence, replace every word in the sentence with the shortest
            root that&apos;s a prefix of it (if such a root exists). If multiple roots are prefixes of a word, use the
            shortest. If none match, leave the word alone.
          </p>
          <p>
            Example: roots = <code>[&quot;cat&quot;, &quot;bat&quot;, &quot;rat&quot;]</code>, sentence =
            <code> &quot;the cattle was rattled by the battery&quot;</code>. Output:
            <code> &quot;the cat was rat by the bat&quot;</code>.
          </p>
        </Callout>

        <h3>Why a trie</h3>

        <p>
          For each word in the sentence, we need to find the shortest root that&apos;s a prefix of it. A trie of roots
          handles this perfectly: walk the trie character-by-character through the word, and the <em>first</em>
          <code> isEnd</code> node you encounter marks the shortest matching root.
        </p>

        <CodeBlock lang="java">{`public String replaceWords(List<String> dictionary, String sentence) {
    Trie trie = new Trie();
    for (String root : dictionary) trie.insert(root);

    String[] words = sentence.split(" ");
    for (int i = 0; i < words.length; i++) {
        words[i] = trie.shortestRoot(words[i]);
    }
    return String.join(" ", words);
}

class Trie {
    private final TrieNode root = new TrieNode();

    void insert(String word) {
        TrieNode n = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (n.children[idx] == null) n.children[idx] = new TrieNode();
            n = n.children[idx];
        }
        n.isEnd = true;
    }

    String shortestRoot(String word) {
        TrieNode n = root;
        StringBuilder sb = new StringBuilder();
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (n.children[idx] == null) return word;     // no root prefixes this word
            n = n.children[idx];
            sb.append(c);
            if (n.isEnd) return sb.toString();             // FIRST isEnd → shortest root
        }
        return word;                                        // word itself wasn't long enough
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd;
}`}</CodeBlock>

        <p>
          The key line is <code>if (n.isEnd) return sb.toString();</code> — the first <code>isEnd</code> we hit during
          the walk is by construction the <em>shortest</em>{" "}root that&apos;s a prefix of the word. We don&apos;t need to
          continue past it.
        </p>

        <Callout variant="insight" title="The 'walk until isEnd' pattern">
          <p>
            This is a recurring trie idiom: walk down character by character; the <em>first</em>{" "}isEnd you encounter
            is the answer. It shows up in Replace Words, in detecting whether one word is a prefix of another in a
            dictionary, in spell-checkers (&quot;did the user type a known prefix and stop?&quot;), and in tokenizers
            for compressed encodings like Huffman codes (where the trie is binary and isEnd marks a complete codeword).
          </p>
          <p>
            The shape: walk down → first isEnd wins. If you ever want the <em>longest</em>{" "}matching prefix instead, walk
            all the way and remember the deepest isEnd seen. Same trie, different bookkeeping.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Build trie:</strong>{" "}O(R · L<sub>r</sub>) for R roots of average length L<sub>r</sub>.</li>
          <li><strong>Per word in sentence:</strong>{" "}O(L<sub>w</sub>) — one trie walk capped at the word&apos;s length.</li>
          <li><strong>Total:</strong>{" "}O(R · L<sub>r</sub> + total characters in sentence). Linear in the input.</li>
        </ul>

        <h3>The full mental checklist for &quot;is this a trie problem?&quot;</h3>

        <p>Reach for a trie when at least one of these holds:</p>

        <ul>
          <li><strong>Prefix matters.</strong> &quot;Find all words starting with X.&quot; &quot;Does any word start with this prefix?&quot; &quot;Shortest/longest matching prefix.&quot; The hashmap can&apos;t do these.</li>
          <li><strong>Many words checked against many positions.</strong>{" "}Word Search II, dictionary-against-grid. The trie consolidates the per-word DFS into one shared traversal.</li>
          <li><strong>Autocomplete or typeahead.</strong>{" "}The product UX literally requires &quot;what continues this prefix?&quot; — a trie answers it natively.</li>
          <li><strong>Streaming insertions and queries.</strong>{" "}Sorted-array binary search needs O(N) per insert; a trie inserts in O(L) and continues to answer prefix queries fast.</li>
        </ul>

        <p>Don&apos;t reach for a trie when:</p>

        <ul>
          <li><strong>You only need exact membership.</strong>{" "}HashMap/HashSet are simpler and use less memory.</li>
          <li><strong>The strings are very long and rarely share prefixes.</strong>{" "}The trie&apos;s structural-sharing payoff vanishes; you&apos;re paying memory for nothing.</li>
          <li><strong>Memory is tight.</strong>{" "}A 26-array trie can use 5-10× the memory of an equivalent HashSet for English words. Compressed variants exist but add code.</li>
          <li><strong>The problem is fundamentally about word distance or anagrams.</strong>{" "}Those are different problem families — sort the characters, or use edit-distance DP, not a trie.</li>
        </ul>

        <h3>Project · build it from scratch</h3>

        <p>
          Implement <code>Trie</code> from scratch (not using any library trie). Solve all three:
        </p>

        <ol>
          <li>
            <strong>LC 208 · Implement Trie (Prefix Tree)</strong> — Medium. Three methods: <code>insert</code>,
            <code> search</code>, <code>startsWith</code>. The version from Part 3 is the answer; type it from memory.
          </li>
          <li>
            <strong>LC 212 · Word Search II</strong> — Hard. The trie + DFS combo from Part 5. Aim for a clean
            implementation with the in-place visited marking and the &quot;set word=null after match&quot; dedup.
          </li>
          <li>
            <strong>LC 648 · Replace Words</strong> — Medium. The walk-until-isEnd pattern from this section.
          </li>
        </ol>

        <Callout variant="info" title="A stretch problem: Implement Trie II (LC 1804)">
          <p>
            Adds <code>countWordsEqualTo(word)</code> and <code>countWordsStartingWith(prefix)</code>. Implement by
            adding two integer counters per node: a count of word-terminations at this node (incremented in
            <code> insert</code>, used by <code>countWordsEqualTo</code>) and a count of words passing through this
            node (incremented at every step of <code>insert</code>, used by <code>countWordsStartingWith</code>). Both
            queries become O(L). Don&apos;t forget to <em>decrement</em>{" "}in <code>erase</code>.
          </p>
        </Callout>

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="A trie turns the dictionary into a prefix-tree, replacing whole-string lookup with character-level path walks. The structural sharing of common prefixes is what makes prefix queries O(L) instead of O(N · L)."
          points={[
            { takeaway: "Recognize prefix queries as the trie's home turf.", detail: "Autocomplete, 'does any word start with X', 'shortest matching root', 'all words with prefix' — all O(L) with a trie, all O(N · L) with a hashmap. The moment you see 'prefix' in a problem, your hand should reach for a trie." },
            { takeaway: "Implement insert/search/startsWith from memory.", detail: "All three share the same walk-down skeleton. Insert allocates missing children and marks isEnd at the end. Search walks and checks isEnd. StartsWith walks and only checks the walk succeeded. The whole thing is ~30 lines." },
            { takeaway: "Reason about the array vs HashMap children tradeoff.", detail: "TrieNode[26] is fastest per-character but uses 200B per node even when sparse. HashMap<Character,TrieNode> is more compact for sparse alphabets, slower per character. Production tries often hybridize. For interviews, default to TrieNode[26] and explain the tradeoff if asked." },
            { takeaway: "Apply the trie + DFS combo on a board.", detail: "Word Search II: build a trie of words once, run ONE board DFS that walks the trie alongside it, prune the moment the board's character isn't in the trie node's children. Store the full word at terminals so you can emit matches without reconstructing them. Set word=null after match for free deduplication." },
            { takeaway: "Use the 'walk until isEnd' idiom.", detail: "Replace Words finds the shortest matching root by walking the trie and returning at the first isEnd. The same shape — first-isEnd-wins or last-isEnd-wins — covers most practical prefix-replacement and prefix-tokenization problems." },
            { takeaway: "Know when NOT to use a trie.", detail: "Pure exact membership, anagram-shaped problems, very long strings with no shared prefixes, and tight-memory contexts all favor a hashmap or some other structure. Tries trade memory for speed — pay the memory only when you need the speed of prefix queries." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You're designing a search bar for a 200,000-word product catalog. Each keystroke needs to return the top 10 matching products in under 5 ms. Which structure?"
          options={[
            { label: "HashSet<String> — O(1) lookup is best.", explanation: "HashSet can't do prefix queries. Each keystroke would have to scan all 200K entries — way too slow for sub-5ms response." },
            { label: "Sorted ArrayList + binary search.", explanation: "Works for static catalogs (the binary search finds the prefix range fast), but inserts are O(N) — bad if the catalog mutates. Also slightly slower per query than a trie." },
            { label: "Trie — O(L) per query independent of catalog size, plus subtree DFS for the top-10 enumeration.", correct: true, explanation: "Right. The trie walks the prefix path in O(L), then enumerates from the subtree. With 200K entries and avg prefix length 5, queries are essentially instant. Memory is the cost — maybe 50-100 MB — but for a search bar that's a fine tradeoff. Add a frequency or popularity score per terminal node and you can sort the top-10 enumeration by relevance." },
            { label: "TreeMap — sorted by string order.", explanation: "TreeMap.tailMap(prefix) is O(log N) and gets you the prefix range, but each character of the prefix involves a comparison, so it's actually O(L · log N) — slightly worse than the trie. Plus enumeration walks string-by-string instead of sharing structure. Trie wins." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In LC 212 (Word Search II), why is building a trie of all dictionary words faster than running a separate DFS per word?"
          options={[
            { label: "Tries are inherently faster than DFS.", explanation: "The DFS still happens — the trie just consolidates the per-word searches into one. The savings come from shared traversal, not from skipping DFS." },
            { label: "The trie consolidates W independent searches into a single board DFS that prunes per cell based on which words could still match.", correct: true, explanation: "Right. Without the trie, each cell is the start of a fresh DFS for every word — even when no word starts with that cell's letter. The trie answers 'does any word start here?' in O(1), and as the DFS deepens, the trie node tells us exactly which letters could continue any word. Most paths get pruned within a few cells. Same DFS, but the search space collapses." },
            { label: "Tries deduplicate words automatically.", explanation: "Tries do save space when prefixes are shared, but the dedup is a side benefit, not the main reason this approach is fast." },
            { label: "DFS doesn't work without tries.", explanation: "DFS works fine standalone — it's just slow when you do it per-word. The trie makes one shared DFS suffice." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="A teammate writes a Trie.search method that returns true whenever the input is a prefix of any stored word — they forgot the isEnd check. Which test case smokes the bug out?"
          options={[
            { label: "search('') on an empty trie.", explanation: "An empty trie's root has no children. walk('') returns the root (a non-null node), so the buggy method returns true even though nothing's been inserted. Borderline — but it's only a bug if the empty string is meaningful. Most test cases won't include it." },
            { label: "Insert 'cat'. Then search('ca').", correct: true, explanation: "Right. The walk through 'c' then 'a' succeeds — both nodes exist on the way to 'cat'. The buggy version returns true. The correct version notices the a-node has isEnd = false (no one inserted 'ca') and returns false. This is the canonical test case: any prefix of an inserted word that wasn't itself inserted." },
            { label: "Insert 'cat'. Then search('cat').", explanation: "This passes BOTH the buggy and correct versions: 'cat' is in the trie and the walk reaches an isEnd node. Doesn't distinguish them." },
            { label: "Insert nothing. Then search('z').", explanation: "Both versions return false: walk('z') returns null because no child exists. This case doesn't smoke out the bug either; we need a successful walk to a non-isEnd node." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-rose-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Module 37 complete · Tries</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            Prefix queries demystified. You can now implement a trie from scratch, recognize trie problems on sight,
            apply the DFS-plus-trie combo on a grid, and reason about when a hashmap is the right call instead.
            Module 38 — Union-Find — picks up another specialized structure: O(α(n)) connectivity queries with two
            tiny optimizations (path compression, union by rank) doing all the heavy lifting.
          </p>
          <Link
            href="/courses/dsa/modules/union-find"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Next: Union-Find (Disjoint Set Union) →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="tries" />
    </article>
  );
}
