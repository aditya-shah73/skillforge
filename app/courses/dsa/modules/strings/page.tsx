import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "setup", title: "What a String really is" },
  { id: "immutability", title: "Immutability & the + trap" },
  { id: "stringbuilder", title: "StringBuilder & char[] tricks" },
  { id: "patterns", title: "Patterns: anagram, palindrome, char counting" },
  { id: "project", title: "Project: anagram & palindrome lab" },
  { id: "final", title: "Final quiz" },
];

export default function StringsModule() {
  const mod = getModuleBySlug("strings")!;

  // The bug: each "+" allocates a fresh String. The chain copies n times.
  const concatChain = `
flowchart LR
    A["s = ''"] --> B["s = 'a'<br/>(new alloc, copy 0)"]
    B --> C["s = 'ab'<br/>(new alloc, copy 1)"]
    C --> D["s = 'abc'<br/>(new alloc, copy 2)"]
    D --> E["s = 'abcd'<br/>(new alloc, copy 3)"]
    E --> F["..."]
    F --> G["s = 'abc...n'<br/>(new alloc, copy n-1)"]
    style A fill:#10b981,color:#fff,stroke:#059669
    style B fill:#fb923c,color:#fff,stroke:#ea580c
    style C fill:#fb923c,color:#fff,stroke:#ea580c
    style D fill:#fb923c,color:#fff,stroke:#ea580c
    style E fill:#fb923c,color:#fff,stroke:#ea580c
    style G fill:#ef4444,color:#fff,stroke:#dc2626
  `.trim();

  // StringBuilder mental model — same doubling-array trick we just learned
  const sbModel = `
flowchart TB
    subgraph SB["StringBuilder (mutable)"]
        direction LR
        S0["[0]<br/>h"]
        S1["[1]<br/>e"]
        S2["[2]<br/>l"]
        S3["[3]<br/>l"]
        S4["[4]<br/>o"]
        S5["[5]<br/>—"]
        S6["[6]<br/>—"]
        S7["[7]<br/>—"]
    end
    L["count = 5<br/>capacity = 8"] -.-> SB
    SB -.->|"toString()"| OUT["new String('hello')<br/>immutable copy"]
    style S0 fill:#fbbf24,color:#000,stroke:#d97706
    style S1 fill:#fbbf24,color:#000,stroke:#d97706
    style S2 fill:#fbbf24,color:#000,stroke:#d97706
    style S3 fill:#fbbf24,color:#000,stroke:#d97706
    style S4 fill:#fbbf24,color:#000,stroke:#d97706
    style S5 fill:#e2e8f0,color:#000,stroke:#94a3b8
    style S6 fill:#e2e8f0,color:#000,stroke:#94a3b8
    style S7 fill:#e2e8f0,color:#000,stroke:#94a3b8
    style L fill:#1e293b,color:#fff,stroke:#475569
    style OUT fill:#0ea5e9,color:#fff,stroke:#0284c7
    style SB fill:#fef3c7,color:#000,stroke:#fbbf24
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/dsa" className="text-emerald-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Phase 2 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Strings &amp; string building
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Strings are arrays in disguise. The twist is immutability — and the trap of <code>+</code> in a loop. Plus the patterns (anagram, palindrome, frequency counting) that interview problems hide behind.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="strings" />
        <ModuleProgress moduleSlug="strings" checkpoints={CHECKPOINTS} />
      </header>

      {/* PART 1: WHAT A STRING REALLY IS */}
      <Checkpoint moduleSlug="strings" id="setup" title="What a String really is" xp={15} celebration="A String is just an array of characters with a contract. Onward.">
      <section>
        <h2>Part 1: A String is an array of characters with a contract</h2>

        <p>
          You spent Module 5 understanding arrays. The good news: a Java <code>String</code> is, internally, an array of characters. The bad news: it&apos;s wrapped behind a class that promises one thing — <strong>you cannot modify it</strong>.
        </p>

        <Callout variant="insight" title="The Java String model, in one sentence">
          <p className="m-0">
            A <code>String</code> is an immutable, length-prefixed, indexable sequence of characters, stored internally as a <code>byte[]</code> (or <code>char[]</code> on older JVMs). Every operation that &ldquo;changes&rdquo; it returns a brand-new <code>String</code> object.
          </p>
        </Callout>

        <p>
          Three properties to internalize:
        </p>
        <ul>
          <li><strong>Indexable in O(1).</strong> <code>s.charAt(i)</code> is array indexing under the hood — same address arithmetic, same constant-time guarantee as <code>arr[i]</code>.</li>
          <li><strong>Length is cached.</strong> <code>s.length()</code> is O(1). It&apos;s a stored field, not a scan.</li>
          <li><strong>Immutable.</strong>{" "}There is no <code>s.charAt(0) = &apos;X&apos;</code>. There is no <code>s.append(&apos;Y&apos;)</code>. Anything that &ldquo;modifies&rdquo; — <code>toLowerCase</code>, <code>substring</code>, <code>replace</code>, <code>trim</code>, <code>+</code> — allocates a new object.</li>
        </ul>

        <Quiz
          kind="Gut check"
          question={`What does this print: String s = "hi"; s.toUpperCase(); System.out.println(s);`}
          options={[
            { label: "HI", explanation: "toUpperCase doesn't mutate s — it can't, strings are immutable. It returns a new String you didn't capture." },
            { label: "hi", correct: true, explanation: "Right. toUpperCase returned a new String 'HI', but you threw it away by not assigning it. The original s still points to 'hi'. The fix is s = s.toUpperCase()." },
            { label: "Empty string.", explanation: "Operations on a String never mutate it to empty. The reference is unchanged." },
            { label: "Compile error.", explanation: "It compiles fine. Forgetting to capture the return value is a runtime bug, not a compile-time one." },
          ]}
        />

        <h3>Why immutability?</h3>
        <p>
          Java&apos;s designers chose immutability for several practical reasons that all turn out to matter:
        </p>
        <ul>
          <li><strong>Safe to share.</strong>{" "}Two threads reading the same <code>String</code> never need to synchronize — there&apos;s nothing to race on.</li>
          <li><strong>Safe as a hash key.</strong>{" "}A mutable key whose contents change after insertion would corrupt every hash map. Immutability makes <code>String</code> a safe <code>HashMap</code> key.</li>
          <li><strong>Safe to intern / cache.</strong>{" "}The JVM keeps a pool of literal strings — <code>&quot;hello&quot;</code> appearing in two different files refers to the same object. Only possible if it can&apos;t change.</li>
          <li><strong>Safe to pass to security-critical APIs.</strong>{" "}If <code>openFile(path)</code> took a mutable string, an attacker could mutate <code>path</code> after the security check but before the open. (This is a real exploit class.)</li>
        </ul>

        <h3>String literals vs new String</h3>
        <CodeBlock lang="java">{`String a = "hello";
String b = "hello";
String c = new String("hello");

a == b           // true  — both point to the SAME interned literal
a == c           // false — new String() forces a fresh allocation
a.equals(c)      // true  — equals compares characters, not references`}</CodeBlock>

        <Callout variant="warn" title="== vs equals on Strings is the #1 Java gotcha">
          <p className="m-0">
            <code>==</code> compares <em>references</em> (are these the same object?). <code>.equals()</code> compares <em>characters</em> (do these contain the same text?). For strings you almost always want <code>.equals()</code>. The literal pool sometimes makes <code>==</code> appear to work, which is exactly what makes the bug nasty when it doesn&apos;t.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question={`Given String a = "abc"; String b = "ab" + "c"; (both compile-time constants), what is a == b?`}
          options={[
            { label: "false — they're separately constructed.", explanation: "The Java compiler folds compile-time constant string concatenation. \"ab\" + \"c\" becomes \"abc\" at compile time and gets interned with the existing \"abc\"." },
            { label: "true — compile-time constant folding interns both into the same object.", correct: true, explanation: "Right. javac evaluates \"ab\" + \"c\" at compile time, producing the literal \"abc\". The literal pool gives a and b the same reference. (If b were built from variables instead of literals, == would be false.)" },
            { label: "Compile error — you can't concat at the declaration site.", explanation: "You absolutely can. Both are valid Java." },
            { label: "Depends on the JVM.", explanation: "The literal pool behavior is part of the Java Language Specification, not JVM-specific." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="A String is a length-prefixed immutable byte array. The contract is: read-only."
          points={[
            { takeaway: "charAt(i) and length() are O(1).", detail: "Indexing is array address arithmetic. Length is a stored int. Same cost as arrays." },
            { takeaway: "Strings are immutable — every 'modifying' method returns a new object.", detail: "toUpperCase, substring, replace, trim — all allocate. The original is untouched." },
            { takeaway: "Use .equals() to compare contents. == compares references.", detail: "The literal pool sometimes makes == look right; that's a coincidence, not a guarantee. Always reach for .equals() for content comparison." },
            { takeaway: "Immutability buys thread safety, hash-key safety, and the literal pool.", detail: "All three matter in real code. The cost is allocation pressure when you 'modify' often — which is what Part 2 is about." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2: IMMUTABILITY AND THE + TRAP */}
      <Checkpoint moduleSlug="strings" id="immutability" title="Immutability & the + trap" xp={20} celebration="You'll never write s += inside a loop again. Or if you do, you'll know exactly what it costs.">
      <section>
        <h2>Part 2: Why <code>+</code> in a loop is O(n²)</h2>

        <p>
          Here&apos;s the bug that&apos;s broken more interview answers and more production hot paths than any other String mistake:
        </p>

        <CodeBlock lang="java">{`// DO NOT — looks innocent, runs in quadratic time
String result = "";
for (int i = 0; i < n; i++) {
    result = result + arr[i];        // each iteration: allocate-and-copy
}
return result;`}</CodeBlock>

        <p>
          Each <code>+</code> on a String allocates a brand-new <code>String</code> object whose payload is the concatenation. To do that, the JVM:
        </p>
        <ol>
          <li>Allocates a new char array large enough to hold both operands.</li>
          <li>Copies the left operand&apos;s characters into it.</li>
          <li>Copies the right operand&apos;s characters into it.</li>
          <li>Wraps it in a new <code>String</code>.</li>
        </ol>
        <p>
          Run that inside a loop where the left operand keeps growing, and the work is 1 + 2 + 3 + ... + n = n(n+1)/2 character-copies. Pure quadratic. At n = 100,000 that&apos;s about 5 billion copies — seconds of CPU for what should be milliseconds.
        </p>

        <Mermaid chart={concatChain} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Each <code>+</code> allocates a fresh <code>String</code> and copies the previous payload. The chain is O(n²) in copies.
        </p>

        <WorkedExample
          title="Counting copies for n = 5 with += in a loop"
          subtitle="Build 'abcde' starting from empty by appending one char at a time."
          steps={[
            {
              title: "Iteration 0: result = '' + 'a' → 'a'",
              body: <p>Copy 0 chars from old, 1 char from new. <strong>1 copy total.</strong></p>,
            },
            {
              title: "Iteration 1: result = 'a' + 'b' → 'ab'",
              body: <p>Copy 1 char from old, 1 char from new. Running total: 1 + 2 = <strong>3 copies.</strong></p>,
            },
            {
              title: "Iteration 2: result = 'ab' + 'c' → 'abc'",
              body: <p>Copy 2 chars from old, 1 from new. Running total: 3 + 3 = <strong>6 copies.</strong></p>,
            },
            {
              title: "Iteration 3: result = 'abc' + 'd' → 'abcd'",
              body: <p>Copy 3 chars from old, 1 from new. Running total: 6 + 4 = <strong>10 copies.</strong></p>,
            },
            {
              title: "Iteration 4: result = 'abcd' + 'e' → 'abcde'",
              body: <p>Copy 4 chars from old, 1 from new. Running total: 10 + 5 = <strong>15 copies.</strong></p>,
            },
            {
              title: "The shape: 1 + 2 + 3 + 4 + 5 = n(n+1)/2",
              body: (
                <>
                  <p>
                    For n = 5 we did 15 copies. For n = 100, we&apos;d do 5,050. For n = 1,000,000, we&apos;d do 500,000,500,000 — half a trillion. That&apos;s O(n²).
                  </p>
                  <p>
                    The geometric series math from Module 3 doesn&apos;t save us here, because we&apos;re not doubling capacity — every iteration allocates exactly the right size, copying everything.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Callout variant="warn" title="The compiler does NOT save you here">
          <p className="m-0">
            <code>javac</code> rewrites a <em>single</em> <code>a + b + c</code> expression into one <code>StringBuilder</code> call — that&apos;s fine. But it can&apos;t rewrite <code>+=</code> across loop iterations, because each iteration is a separate statement. The quadratic blowup survives the compile.
          </p>
        </Callout>

        <h3>The fix: build mutably, freeze at the end</h3>
        <p>
          The pattern is: build with a <em>mutable</em>{" "}structure (<code>StringBuilder</code>), then call <code>.toString()</code> once at the end to get an immutable <code>String</code> for the rest of your code to use.
        </p>

        <CodeBlock lang="java">{`// Correct — O(n) total
StringBuilder sb = new StringBuilder();
for (int i = 0; i < n; i++) {
    sb.append(arr[i]);          // amortized O(1) per append
}
return sb.toString();           // one final allocation, O(n)`}</CodeBlock>

        <p>
          <code>StringBuilder</code> is, internally, exactly the dynamic array you built in Module 5 — a backing <code>char[]</code> with a <code>count</code> field, doubling on overflow. <code>append</code> is amortized O(1). Total work over n appends is O(n). At n = 1,000,000 you&apos;re doing about 2 million character-touches instead of half a trillion.
        </p>

        <Quiz
          kind="Concept check"
          question="Why is StringBuilder.append() amortized O(1) but String + is O(n)?"
          options={[
            { label: "StringBuilder is implemented in native code.", explanation: "Both are pure Java. The difference is mutability and the doubling backing array, not native-vs-Java." },
            { label: "StringBuilder reuses its growing backing array; String + must allocate-and-copy the entire current value every time.", correct: true, explanation: "Right. StringBuilder applies the Module 3 doubling trick to a char[]. String + can't — every result must be a fresh immutable String, which means full re-copy of the existing characters every time." },
            { label: "StringBuilder uses a linked list of chars internally.", explanation: "It uses a contiguous char[] (now byte[] in JDK 9+ for compact strings). Same array model as ArrayList." },
            { label: "Strings allocate on the stack, StringBuilder on the heap.", explanation: "Both allocate on the heap. The difference is in-place mutation vs allocate-fresh-each-time." },
          ]}
        />

        <h3>Operator vs method — same trap, different syntax</h3>
        <p>
          A nastier version of the bug is <code>String.concat</code>:
        </p>
        <CodeBlock lang="java">{`// Same bug, same Big-O — concat doesn't help.
for (int i = 0; i < n; i++) {
    result = result.concat(String.valueOf(arr[i]));
}`}</CodeBlock>
        <p>
          <code>String.concat</code> still returns a new immutable String. It&apos;s not magical. Anything that returns <code>String</code> on every call inside a loop is suspicious.
        </p>

        <ClassifyChallenge
          title="Mutable or immutable?"
          prompt="For each operation, decide whether the receiver is modified in place (mutable) or the operation returns a new object (immutable)."
          buckets={[
            { id: "mutates", label: "Mutates in place", color: "rose" },
            { id: "returns-new", label: "Returns a new object", color: "emerald" },
          ]}
          items={[
            { id: "string-uppercase", label: "String s = \"hi\"; s.toUpperCase();", answer: "returns-new", explanation: "Strings are immutable. toUpperCase returns a new String; the original s is unchanged." },
            { id: "sb-append", label: "StringBuilder sb = new StringBuilder(); sb.append(\"hi\");", answer: "mutates", explanation: "StringBuilder is the mutable counterpart. append modifies the internal char[] in place." },
            { id: "string-replace", label: "s.replace('a', 'b')", answer: "returns-new", explanation: "Same rule — String can't change. A new String is returned with the substitution." },
            { id: "string-substring", label: "s.substring(2, 5)", answer: "returns-new", explanation: "Returns a new String covering the slice. The original s is untouched." },
            { id: "sb-reverse", label: "sb.reverse()", answer: "mutates", explanation: "StringBuilder.reverse mutates the buffer in place and returns this for chaining." },
            { id: "char-array-set", label: "char[] arr = ...; arr[0] = 'X';", answer: "mutates", explanation: "char[] is just an array. Indexed write is a direct mutation — exactly what you'd expect from arrays." },
            { id: "string-trim", label: "s.trim()", answer: "returns-new", explanation: "Strings are immutable. trim allocates a new String with whitespace removed and returns it." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="String concatenation in a loop is the classic O(n²) trap. StringBuilder is the O(n) escape."
          points={[
            { takeaway: "+ on strings always allocates a new String and copies both operands.", detail: "Inside a loop where one operand grows, total work is 1 + 2 + ... + n = O(n²)." },
            { takeaway: "javac folds a single + chain into one StringBuilder call. It cannot fold across loop iterations.", detail: "String s = a + b + c gets compiled to one builder. for(...) s += x; doesn't, because each iteration is its own expression." },
            { takeaway: "StringBuilder is the dynamic-array-of-chars from Module 5 — same doubling trick, same amortized O(1) append.", detail: "Build with the mutable type, freeze with toString() at the end. The pattern works for any loop building one string." },
            { takeaway: "Anything that returns String inside a loop deserves suspicion.", detail: "+, concat, replace, substring — they all allocate. If you call them n times, the loop is O(n²) at minimum." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3: STRINGBUILDER AND CHAR[] TRICKS */}
      <Checkpoint moduleSlug="strings" id="stringbuilder" title="StringBuilder & char[] tricks" xp={20} celebration="You can pick the right string-building tool reflexively now.">
      <section>
        <h2>Part 3: StringBuilder, char[], and the toolkit</h2>

        <p>
          You now have one rule (don&apos;t use <code>+</code> in a loop) and one tool (<code>StringBuilder</code>). Time to sharpen both.
        </p>

        <h3>StringBuilder, in detail</h3>
        <p>
          <code>StringBuilder</code> is the same dynamic array you implemented in Module 5, specialized to characters. It has:
        </p>
        <ul>
          <li>A backing <code>char[] value</code> (or <code>byte[]</code> on JDK 9+ for ASCII).</li>
          <li>An <code>int count</code> = how many chars are actually in use.</li>
          <li><code>capacity()</code> exposes the backing array length.</li>
          <li>Doubling growth on overflow.</li>
        </ul>

        <Mermaid chart={sbModel} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          StringBuilder = mutable char[] + count + doubling. <code>toString()</code> takes an immutable snapshot.
        </p>

        <CodeBlock lang="java">{`StringBuilder sb = new StringBuilder();
sb.append("hello");           // backing char[] now holds h,e,l,l,o; count=5
sb.append(' ');               // append single char — same O(1) amortized
sb.append("world");

sb.reverse();                 // in-place reverse — O(n)
sb.insert(0, "<<");           // insert at index 0 — O(n) shift, just like ArrayList
sb.deleteCharAt(2);           // O(n) shift left

String result = sb.toString();  // freezes to immutable String — O(n) one-time copy`}</CodeBlock>

        <Callout variant="info" title="Pre-size when you know the answer">
          <p className="m-0">
            <code>new StringBuilder(expectedSize)</code> skips all the resize-and-copy churn if you already know roughly how big the output will be. For a method that returns <code>n</code> characters, <code>new StringBuilder(n)</code> turns total work from ~2n into exactly n. Same trick as <code>new ArrayList&lt;&gt;(n)</code>.
          </p>
        </Callout>

        <h3>StringBuffer vs StringBuilder — which one?</h3>
        <p>
          <code>StringBuffer</code> exists for historical reasons. It&apos;s thread-safe (every method is <code>synchronized</code>), which sounds nice but costs you a lot of performance in the 99% case where you&apos;re building a string in one thread and immediately throwing the builder away.
        </p>
        <p>
          <strong>Default to <code>StringBuilder</code>.</strong>{" "}Reach for <code>StringBuffer</code> only if you genuinely have multiple threads appending to the same builder, which is rare and usually a design smell — you&apos;d build per-thread builders and merge them.
        </p>

        <Quiz
          kind="Quick check"
          question="You're building a string of expected length 1,000,000. Which is fastest?"
          options={[
            { label: "String result = \"\"; for (...) result += c;", explanation: "O(n²). Half a trillion character-copies for n = 10⁶. Catastrophic." },
            { label: "new StringBuilder(); for (...) sb.append(c);", explanation: "Fast — O(n) — but you'll do ~log₂(10⁶) ≈ 20 resizes along the way, each copying everything. Total work ≈ 2n character-copies." },
            { label: "new StringBuilder(1_000_000); for (...) sb.append(c);", correct: true, explanation: "Right. Pre-sizing skips every resize. Total work is exactly n character-writes, no copies. About half the wall time of the no-pre-size version." },
            { label: "new StringBuffer(1_000_000); for (...) sb.append(c);", explanation: "Same algorithmic cost as the StringBuilder pre-sized version, but every append takes a synchronized monitor — measurably slower in single-threaded code." },
          ]}
        />

        <h3>char[] — when you want full control</h3>
        <p>
          Sometimes you want bare metal: a fixed-size char array you index by hand. The classic case is &ldquo;reverse a string in place&rdquo; — a problem that&apos;s only interesting <em>because</em>{" "}Strings are immutable, so you have to convert to <code>char[]</code> first.
        </p>

        <CodeBlock lang="java">{`String reverse(String s) {
    char[] arr = s.toCharArray();           // O(n) copy
    int l = 0, r = arr.length - 1;
    while (l < r) {
        char tmp = arr[l]; arr[l] = arr[r]; arr[r] = tmp;
        l++; r--;
    }
    return new String(arr);                 // O(n) wrap into a fresh String
}`}</CodeBlock>

        <p>
          The two-pointer pattern previewed in Module 5 (Arrays) shows up immediately. For palindrome checks, anagram checks, and any &ldquo;process the string from both ends&rdquo; problem, <code>char[]</code> + two pointers is the natural shape.
        </p>

        <Callout variant="insight" title="Three tools, one rule">
          <p className="m-0">
            <strong>String</strong>{" "}for handing finished text around. <strong>StringBuilder</strong>{" "}for building text in a loop. <strong>char[]</strong>{" "}when you need indexed mutation or two-pointer scans. Picking the wrong one usually shows up as bad Big-O.
          </p>
        </Callout>

        <h3>The deceptively useful String methods</h3>
        <p>
          Three methods you&apos;ll reach for constantly. All O(n), but the constants are small:
        </p>
        <CodeBlock lang="java">{`s.toCharArray()                  // String → char[]; O(n) copy
String.valueOf(charArr)          // char[] → String; O(n) copy
new String(charArr, off, len)    // slice of char[] → String

s.split(",")                     // String → String[] by separator; O(n)
String.join(",", list)           // List<String> → String with separator; O(total length)`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="You need to count how many times each letter appears in a String s of length n. Which is the cleanest O(n)?"
          options={[
            { label: "for each c in 'a'..'z': s.indexOf(c) — return early if not present.", explanation: "Each indexOf is O(n) and you do 26 of them — that's 26n work. Worse, indexOf only finds the first; you'd need a more complex loop. There's a single-pass solution." },
            { label: "Convert to char[], then for each c, do a nested for-loop counting.", explanation: "That's O(26n) at best, O(n²) at worst. There's a single-pass solution." },
            { label: "Build a char-keyed HashMap with one pass over s.", explanation: "Works and is O(n), but for fixed lowercase ASCII you can use a 26-int array instead — fewer allocations, faster constants." },
            { label: "Make int[] counts = new int[26]; for each c in s, counts[c - 'a']++;", correct: true, explanation: "Right. The 'character → small index' trick collapses a HashMap to a fixed-size int array. One pass, O(n), with tiny constants. This pattern is the basis of anagram and frequency-counting problems in Part 4." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="StringBuilder for in-loop building, char[] for indexed mutation and two-pointer scans, String for handing off finished text."
          points={[
            { takeaway: "StringBuilder is a mutable char[] dynamic array — same model as ArrayList, same amortized O(1) append.", detail: "Backing array, count, doubling. Pre-size with new StringBuilder(n) when you know the answer to skip resize churn." },
            { takeaway: "Default to StringBuilder. Use StringBuffer only when multiple threads share the builder.", detail: "StringBuffer's synchronized methods cost time you usually don't need." },
            { takeaway: "Convert String → char[] when you need indexed mutation.", detail: "Reverse-in-place, swap, two-pointer scans — all want char[] semantics, then one new String() at the end." },
            { takeaway: "For lowercase-letter frequency problems, int[26] beats HashMap.", detail: "counts[c - 'a']++ replaces a hash lookup with an array index. Same Big-O, dramatically smaller constants. Recurs in anagram, palindrome variants, sliding window." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 4: PATTERNS */}
      <Checkpoint moduleSlug="strings" id="patterns" title="Patterns: anagram, palindrome, char counting" xp={25} celebration="Three more named patterns. Recognition is starting to feel automatic.">
      <section>
        <h2>Part 4: Three patterns that show up everywhere</h2>

        <p>
          The interview problems hidden inside &ldquo;String&rdquo; questions almost always reduce to one of three patterns. Once you see them, the problem statement starts to feel like a costume.
        </p>

        <h3>Pattern 1: Frequency counting (the &ldquo;int[26]&rdquo; trick)</h3>
        <p>
          For lowercase ASCII, build a fixed-size frequency array indexed by <code>c - &apos;a&apos;</code>. One pass to populate; one pass (or O(1) lookup) to answer.
        </p>
        <p>
          This is the engine behind &ldquo;Valid Anagram&rdquo;: two strings are anagrams iff they have identical character frequencies.
        </p>
        <CodeBlock lang="java">{`boolean isAnagram(String a, String b) {
    if (a.length() != b.length()) return false;
    int[] counts = new int[26];
    for (int i = 0; i < a.length(); i++) {
        counts[a.charAt(i) - 'a']++;       // a contributes +1
        counts[b.charAt(i) - 'a']--;       // b contributes -1
    }
    for (int v : counts) if (v != 0) return false;
    return true;
}`}</CodeBlock>
        <p>
          Time: O(n). Space: O(1) — the int[26] is a constant-size buffer regardless of input length.
        </p>

        <Callout variant="insight" title="The trick is the 'cancellation' loop">
          <p className="m-0">
            Combining +1 from <code>a</code> and -1 from <code>b</code> in the same loop is a cute optimization, but the real lesson is: you don&apos;t need a HashMap when the alphabet is small and known. <code>int[26]</code>, <code>int[128]</code> (full ASCII), or <code>int[256]</code> (extended ASCII) — pick by alphabet, not by reflex.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="The isAnagram above has space complexity O(1). Why is that defensible — doesn't the int[26] take memory?"
          options={[
            { label: "It's true that O(1) is wrong; isAnagram is O(n).", explanation: "Space and time are different axes. The function uses 26 ints regardless of input size." },
            { label: "26 is a small constant. Big-O ignores constants — int[26] is bounded by a constant size that doesn't grow with n.", correct: true, explanation: "Right. Auxiliary space is O(1) when the buffer doesn't grow with n. Even at n = 10⁹, the int[26] is still 26 ints (~104 bytes). That's the definition of constant space." },
            { label: "Java zero-initializes the array for free.", explanation: "Zero-init is real work, but it's bounded by the array size — which is constant here. The space claim doesn't depend on init being free." },
            { label: "Because Strings are immutable.", explanation: "Unrelated. Immutability affects what we can do with strings, not how much space the count array uses." },
          ]}
        />

        <h3>Pattern 2: Two pointers from both ends (palindrome)</h3>
        <p>
          A palindrome reads the same forwards and backwards. The cleanest check is: walk pointers in from both ends and compare.
        </p>
        <CodeBlock lang="java">{`boolean isPalindrome(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r) {
        if (s.charAt(l) != s.charAt(r)) return false;
        l++; r--;
    }
    return true;
}`}</CodeBlock>
        <p>
          Time: O(n). Space: O(1). Compare to the &ldquo;reverse the string and check equals&rdquo; approach, which is O(n) time but also O(n) extra space — and reads worse.
        </p>

        <Callout variant="info" title="The variants are where the trickiness lives">
          <p className="m-0">
            &ldquo;Valid Palindrome&rdquo; on LeetCode allows non-letters and is case-insensitive — so the inner loop becomes &ldquo;skip non-letters on both sides, lower-case before comparing.&rdquo; Same shape, more conditions. &ldquo;Palindrome with at most one deletion&rdquo; is the same shape with one branch on mismatch. The pattern is: <em>two pointers from both ends, advance/skip per the rules</em>.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Why is the two-pointer palindrome check O(1) auxiliary space, while reversing the string and comparing is O(n)?"
          options={[
            { label: "Two pointers terminates earlier on average.", explanation: "Average-case termination affects time, not auxiliary space. Even if both ran the full n iterations, the space difference is structural." },
            { label: "The two-pointer version uses only two int variables; reversing allocates a new n-character String.", correct: true, explanation: "Right. l, r, and the comparison char are all O(1) auxiliary space. Reversing — whether via StringBuilder.reverse() or new String(toCharArray reversed) — allocates O(n) extra. Same time, different space." },
            { label: "Reversing has higher Big-O for time too.", explanation: "Both are O(n) time. The difference is space, not time." },
            { label: "Java optimizes away the int variables.", explanation: "Big-O space is about asymptotic auxiliary memory the algorithm needs in principle, not about JVM optimizations." },
          ]}
        />

        <h3>Pattern 3: The &ldquo;build it up&rdquo; pattern</h3>
        <p>
          When the problem is &ldquo;produce a transformed version of the string,&rdquo; the move is: walk the input once, append to a <code>StringBuilder</code>, return <code>.toString()</code> at the end.
        </p>
        <CodeBlock lang="java">{`String compress(String s) {
    StringBuilder sb = new StringBuilder(s.length());   // pre-size!
    int i = 0;
    while (i < s.length()) {
        char c = s.charAt(i);
        int j = i;
        while (j < s.length() && s.charAt(j) == c) j++;
        sb.append(c);
        if (j - i > 1) sb.append(j - i);
        i = j;
    }
    return sb.toString();
}
// "aaabbc" → "a3b2c"`}</CodeBlock>
        <p>
          Time: O(n). Space: O(n) for the output (which the problem requires). Auxiliary space: O(1) beyond the output buffer.
        </p>

        <h3>Composite pattern: anagram groups</h3>
        <p>
          &ldquo;Group Anagrams&rdquo; (LeetCode 49) combines two of the three patterns: for each string, compute a <em>signature</em> (sorted chars, or a 26-int frequency tuple), then bucket by signature in a HashMap.
        </p>
        <CodeBlock lang="java">{`Map<String, List<String>> groups = new HashMap<>();
for (String s : input) {
    char[] sig = s.toCharArray();
    Arrays.sort(sig);                           // signature = sorted chars
    String key = new String(sig);
    groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
}
return new ArrayList<>(groups.values());`}</CodeBlock>
        <p>
          Time: O(N · k log k) where N = number of strings, k = average string length. The <code>k log k</code> is from sorting each signature. There&apos;s an O(N · k) variant using <code>int[26]</code> as the signature key — but encoding it as a hashable key takes some care.
        </p>

        <Quiz
          kind="Concept check"
          question="In Group Anagrams, why is sorting each string's chars (O(k log k)) and using the result as a HashMap key correct?"
          options={[
            { label: "Sorting the same set of characters always produces the same string, so anagrams collide on the same key.", correct: true, explanation: "Right. Two strings are anagrams iff they have the same multiset of characters. Sorting deterministically canonicalizes that multiset into a string — which gives a unique HashMap key per anagram class. Different multiset → different sorted result → different bucket." },
            { label: "Java HashMaps require sorted keys.", explanation: "They don't. Any object with a stable hashCode/equals works. Sorting is for canonicalization, not HashMap requirements." },
            { label: "Sorting is faster than counting.", explanation: "It's actually slower asymptotically — O(k log k) vs O(k) for a count array. Sorting is just simpler to code." },
            { label: "Anagrams are alphabetically equivalent by definition.", explanation: "Anagrams have the same multiset of characters, not anything alphabetical. Sorting is a tool for testing the multiset condition, not a definition." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Three patterns: int[26] for frequency, two pointers for palindromes, StringBuilder for transformations."
          points={[
            { takeaway: "int[26] frequency counts in O(1) auxiliary space when alphabet is small.", detail: "counts[c - 'a']++ pattern. Anagram, palindrome variants, sliding window — same trick, different shapes." },
            { takeaway: "Two pointers from both ends solves palindrome and its variants in O(n) time, O(1) space.", detail: "Skip-non-letters, single-deletion, k-deletion — all add inner conditions to the same outer two-pointer skeleton." },
            { takeaway: "For 'transform a string' problems, walk the input and append to a pre-sized StringBuilder.", detail: "Run-length encoding, JSON-escape, casing rules — same skeleton, different per-character logic." },
            { takeaway: "Group anagrams = signature + HashMap bucket. The signature is the canonical form.", detail: "Sorted chars is the easy signature. A 26-int tuple is the asymptotically faster one. Either way, HashMap groups things that share a signature." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 5: PROJECT */}
      <Checkpoint moduleSlug="strings" id="project" title="Project: anagram & palindrome lab" xp={40} celebration="You've built the three patterns by hand. The shape is in your fingers now." manual manualLabel="I built and tested it">
      <section>
        <h2>Part 5: Project — anagram &amp; palindrome lab</h2>

        <p>
          Two pieces. First, a small lab class that demonstrates each of the three patterns from Part 4, with timing instrumentation so you can <em>feel</em>{" "}the O(n²) vs O(n) gap. Second, three LeetCode warm-ups that exercise each pattern.
        </p>

        <h3>Goal</h3>
        <p>
          A class <code>StringLab</code> with three methods. Each one solves a small problem using one of the three patterns. Plus a <code>main</code> that runs each on inputs of growing size and prints the wall-clock time, so you can see linear, quadratic, and the dramatic gap between them.
        </p>

        <h3>Step-by-step</h3>

        <ol className="space-y-4 not-prose">
          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 1 — buildBad and buildGood (the + trap)</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="mt-0">Two methods that produce a string of <code>n</code> identical chars:</p>
              <CodeBlock lang="java">{`String buildBad(int n)  { String s = ""; for (int i = 0; i < n; i++) s = s + 'a'; return s; }
String buildGood(int n) { StringBuilder sb = new StringBuilder(n); for (int i = 0; i < n; i++) sb.append('a'); return sb.toString(); }`}</CodeBlock>
              <p className="mb-0">Time both for n = 1k, 10k, 100k. The bad version explodes around 100k. The good version doesn&apos;t notice.</p>
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 2 — isAnagram (frequency-array pattern)</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Implement <code>boolean isAnagram(String a, String b)</code> using the int[26] / single-pass cancellation trick from Part 4. Test with: <code>(&quot;listen&quot;, &quot;silent&quot;) → true</code>, <code>(&quot;rat&quot;, &quot;car&quot;) → false</code>, <code>(&quot;a&quot;, &quot;ab&quot;) → false</code> (length mismatch).
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 3 — isPalindrome (two pointers)</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Implement <code>boolean isPalindrome(String s)</code> with two pointers. Then make a second version <code>isPalindromeAlphanum(String s)</code> that ignores non-letters and is case-insensitive — that&apos;s LeetCode 125. Test with: <code>(&quot;A man, a plan, a canal: Panama&quot;) → true</code>.
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 4 — reverseString (in-place char[])</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              LeetCode 344 (&ldquo;Reverse String&rdquo;) gives you a <code>char[]</code> directly and asks you to reverse it in place — no return value. Implement with two pointers from both ends. Verify the array is mutated.
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 5 — Timing harness</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="mt-0">Write a <code>main</code> that runs each method on inputs of size n = 1k, 10k, 100k, and (only for the good version) 1M. Print:</p>
              <CodeBlock lang="java">{`long t0 = System.nanoTime();
String result = buildBad(n);
long ms = (System.nanoTime() - t0) / 1_000_000;
System.out.printf("n=%-7d  ms=%-5d  resultLen=%d%n", n, ms, result.length());`}</CodeBlock>
              <p className="mb-0">You should see buildBad&apos;s time grow ~100× when n grows 10× (quadratic). buildGood&apos;s time grows ~10× when n grows 10× (linear).</p>
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 6 — LeetCode warm-ups</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              The three problems your three methods solve:
              <ul className="my-2">
                <li><strong>Valid Anagram</strong> (LC 242) — your isAnagram.</li>
                <li><strong>Valid Palindrome</strong> (LC 125) — your isPalindromeAlphanum.</li>
                <li><strong>Reverse String</strong> (LC 344) — your reverseString.</li>
              </ul>
              For each, write a comment at the top of the solution: time complexity, space complexity, and which pattern from Part 4 it uses.
            </div>
          </li>
        </ol>

        <h3>Stretch goals</h3>
        <ul>
          <li>Add <code>longestCommonPrefix(String[] arr)</code> (LC 14) — column-by-column scan.</li>
          <li>Add <code>groupAnagrams(String[] arr)</code> (LC 49) using the signature pattern.</li>
          <li>Time <code>buildBad</code> for n = 200k, 400k, 800k. Confirm the 4× scaling per 2× input — the signature of O(n²).</li>
          <li>Try a <code>buildPlus(int n)</code> that uses <code>+</code> in a single expression (<code>&quot;a&quot; + &quot;b&quot; + ... + &quot;z&quot;</code>, hardcoded). Decompile with <code>javap -c</code> and see <code>StringBuilder</code> in the bytecode — proof that javac fixes single-expression concat but not loops.</li>
        </ul>

        <Callout variant="insight" title="Why this lab matters in interviews">
          <p className="m-0">
            &ldquo;Why is your solution O(n) instead of O(n²)?&rdquo; is one of the most common follow-up questions on string problems. Having actually <em>seen</em>{" "}the gap on your own machine — having watched buildBad take 8 seconds on n = 100k while buildGood finishes instantly — is what makes the answer come naturally instead of memorized.
          </p>
        </Callout>

      </section>
      </Checkpoint>

      {/* PART 6: FINAL QUIZ */}
      <Checkpoint moduleSlug="strings" id="final" title="Final quiz" xp={30} celebration="Module 6 done. Linked lists are next.">
      <section>
        <h2>Final check</h2>

        <Quiz
          kind="Final"
          question={`What's the time complexity of: String s = ""; for (int i = 0; i < n; i++) s += chars[i]; return s;`}
          options={[
            { label: "O(n) — each += is one append.", explanation: "On String, += is not 'one append.' It allocates a new String each time and copies the entire current value. Total work is quadratic." },
            { label: "O(n²) — each += copies the whole growing string.", correct: true, explanation: "Right. Iteration k copies k characters. Total is 1 + 2 + ... + n = n(n+1)/2 = O(n²). The fix is StringBuilder, which gives O(n)." },
            { label: "O(n log n) — like sorting.", explanation: "There's nothing logarithmic here — no halving, no balanced tree, no sorting." },
            { label: "O(n) amortized — javac rewrites += as StringBuilder.", explanation: "javac only folds a single + chain inside one expression. += across loop iterations stays as separate concat operations. The compiler can't help you." },
          ]}
        />

        <Quiz
          kind="Final"
          question="When should you reach for char[] instead of String or StringBuilder?"
          options={[
            { label: "Always — char[] is the fastest of the three.", explanation: "Different tools for different jobs. char[] is best for indexed mutation; for append-heavy building, StringBuilder is better." },
            { label: "When you need to mutate by index or do two-pointer scans where reading and writing positions matters.", correct: true, explanation: "Right. char[] gives you direct indexed read/write. That's what you need for in-place reverse, in-place character swap, two-pointer mutations. StringBuilder doesn't give you that — its mutations are appends, inserts, deletes by position, not raw indexed write." },
            { label: "When the string is shorter than 16 characters.", explanation: "There's no length-based rule for picking a tool. The decision is about the operations you want to do." },
            { label: "When you don't need Unicode support.", explanation: "char arrays handle the same Unicode-as-UTF-16 model as String. Different tools, same encoding." },
          ]}
        />

        <Quiz
          kind="Final"
          question="What's the auxiliary space complexity of: boolean isPalindrome(String s) { int l=0, r=s.length()-1; while (l<r) { if (s.charAt(l) != s.charAt(r)) return false; l++; r--; } return true; }"
          options={[
            { label: "O(n) — the input string.", explanation: "Auxiliary space excludes the input. We're asking about extra space the algorithm itself needs to allocate." },
            { label: "O(n) — char comparisons allocate.", explanation: "charAt returns a primitive char, no allocation. == on primitives is just a CPU compare." },
            { label: "O(1) — only two int counters and a few primitive locals.", correct: true, explanation: "Right. l, r, and the implicit per-iteration char temporaries are all bounded primitives. No heap allocation that grows with n. This is one of the wins of the two-pointer approach over 'reverse-and-compare'." },
            { label: "O(log n) — like binary search.", explanation: "There's no halving. Both pointers advance one step at a time. Linear in time, constant in auxiliary space." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Which of these is the most common reason to choose StringBuffer over StringBuilder?"
          options={[
            { label: "Better performance — StringBuffer is JVM-optimized.", explanation: "It's the opposite. StringBuffer's synchronized methods take a monitor on every call — slower in single-threaded code, which is the common case." },
            { label: "It's the modern API; StringBuilder is legacy.", explanation: "Inverted. StringBuilder (Java 5+) is the modern unsynchronized API. StringBuffer (Java 1.0) is the legacy thread-safe one." },
            { label: "Multiple threads need to append to the same builder.", correct: true, explanation: "Right — the only sound reason. StringBuffer's synchronized methods make it safe for cross-thread sharing. In single-threaded code, StringBuilder is strictly better. (And even in multi-threaded code, per-thread StringBuilders + a final merge is usually a better design than one shared StringBuffer.)" },
            { label: "Smaller memory footprint.", explanation: "Footprint is essentially identical. The difference is the synchronization, not the layout." },
          ]}
        />

        <div className="my-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 p-8 text-white shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
            ✦ Phase 2 · Module {mod.number} complete
          </div>
          <h3 className="mt-0 mb-2 text-white">Strings, demystified</h3>
          <p className="mb-4 opacity-95">
            You see the immutable byte array. You feel the O(n²) trap of <code>+</code>. You know the three tools — <code>String</code>, <code>StringBuilder</code>, <code>char[]</code> — and which one to reach for. And you have three named patterns (frequency arrays, two pointers from ends, append-and-build) that handle a remarkable share of string interview questions.
          </p>
          <p className="mb-4 opacity-95">
            <strong>Up next: Module 7 — Linked lists.</strong>{" "}Where arrays are contiguous memory, linked lists are nodes-and-pointers. Different tradeoffs: O(1) head insert and remove, O(n) random access. The dummy-head trick. The fast/slow pointer pattern. And the question of why anyone ever uses a linked list at all.
          </p>
          <Link
            href="/courses/dsa/modules/linked-lists"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-amber-700 font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Module 7 — Linked lists →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="strings" />
    </article>
  );
}
