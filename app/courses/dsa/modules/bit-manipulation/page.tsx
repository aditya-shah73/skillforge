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

const CHECKPOINTS = [
  { id: "setup", title: "Binary numbers and the operators in Java" },
  { id: "tricks", title: "The bit-manipulation toolbox: get/set/clear/toggle bit i" },
  { id: "xor", title: "XOR's superpowers (and the Single Number trick)" },
  { id: "counting", title: "Counting bits: Brian Kernighan + DP" },
  { id: "bitmask", title: "Bitmask as a set: a teaser for bitmask DP" },
  { id: "project", title: "Project: Sum of Two Integers (no + or -)" },
  { id: "phase-recap", title: "Phase 6 · Algorithmic Techniques wrap-up" },
];

export default function BitManipulationModule() {
  const mod = getModuleBySlug("bit-manipulation")!;

  // The Single Number flow — XOR every element, duplicates cancel, the loner survives.
  const singleNumberFlow = `
flowchart LR
    subgraph IN["Input: [4, 1, 2, 1, 2]"]
        direction LR
        N1["4"] --> N2["1"] --> N3["2"] --> N4["1"] --> N5["2"]
    end
    IN -->|"acc = 0; acc ^= x for each x"| ACC
    subgraph ACC["Running XOR"]
        direction TB
        S0["start: 0000"]
        S1["^4: 0100"]
        S2["^1: 0101"]
        S3["^2: 0111"]
        S4["^1: 0110"]
        S5["^2: 0100"]
        S0 --> S1 --> S2 --> S3 --> S4 --> S5
    end
    ACC -->|"every duplicate cancels itself"| OUT["Result: 4"]
    style IN fill:#1e293b,color:#fff,stroke:#475569
    style S0 fill:#312e81,color:#fff
    style S5 fill:#10b981,color:#fff,stroke:#047857
    style OUT fill:#fef3c7,color:#000,stroke:#d97706
  `.trim();

  // Sum of Two Integers — XOR is the no-carry sum, AND<<1 is the carry.
  const sumFlow = `
flowchart TB
    subgraph S0["Iter 0 · a=5 (101), b=3 (011)"]
        direction TB
        A0["sum = a ^ b = 110 (6)"]
        C0["carry = (a & b) << 1 = 001 << 1 = 010 (2)"]
    end
    subgraph S1["Iter 1 · a=6 (110), b=2 (010)"]
        direction TB
        A1["sum = a ^ b = 100 (4)"]
        C1["carry = (a & b) << 1 = 010 << 1 = 100 (4)"]
    end
    subgraph S2["Iter 2 · a=4 (100), b=4 (100)"]
        direction TB
        A2["sum = a ^ b = 000 (0)"]
        C2["carry = (a & b) << 1 = 100 << 1 = 1000 (8)"]
    end
    subgraph S3["Iter 3 · a=0 (0000), b=8 (1000)"]
        direction TB
        A3["sum = a ^ b = 1000 (8)"]
        C3["carry = (a & b) << 1 = 0 — done"]
    end
    S0 --> S1 --> S2 --> S3
    S3 -->|"return a = 8"| OUT["5 + 3 = 8"]
    style S0 fill:#1e293b,color:#fff
    style S1 fill:#312e81,color:#fff
    style S2 fill:#4338ca,color:#fff
    style S3 fill:#6366f1,color:#fff
    style OUT fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="bit-manipulation" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module 25 · Closeout
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · ends with Phase 6 wrap-up</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="setup" title="I can read binary in Java and know my operators" xp={20}>
      <section>
        <h2 id="setup">Binary numbers and the operators in Java</h2>

        <p>
          You&apos;ve been using <code>int</code> for the whole course as if it were just &quot;a number.&quot; It is —
          but underneath, it&apos;s 32 bits packed into 4 bytes. Most of the time you don&apos;t care. In this module you
          will, because a surprising number of LeetCode problems collapse from clever to one-liner once you can see the
          bits.
        </p>

        <h3>The shape of an int</h3>

        <p>
          A Java <code>int</code> is exactly <strong>32 bits</strong>, signed, two&apos;s complement. A Java{" "}
          <code>long</code> is exactly <strong>64 bits</strong>, same encoding. Range:
        </p>

        <ul>
          <li><code>int</code> &nbsp;— −2³¹ to 2³¹−1, roughly ±2.1 billion</li>
          <li><code>long</code> — −2⁶³ to 2⁶³−1, roughly ±9.2 quintillion</li>
        </ul>

        <p>
          When you see <code>0b00000000_00000000_00000000_00000101</code>, that&apos;s <code>5</code>. The underscores
          are just visual separators — Java allows them in any numeric literal since Java 7. The leading bit is the{" "}
          <em>sign bit</em> in two&apos;s complement: <code>0</code> means non-negative, <code>1</code> means negative.
        </p>

        <h3>Two&apos;s complement, in one paragraph</h3>

        <p>
          To negate a number in two&apos;s complement: flip every bit, then add 1. So <code>-1</code> is{" "}
          <code>~0 + 1 = 0xFFFFFFFF</code> — all 32 bits set. <code>-5</code> is <code>~5 + 1</code>. The reason the
          designers picked this scheme over the more obvious &quot;sign bit + magnitude&quot; is that addition just
          works: you can add a positive and a negative without any special-case logic, and the carry rolls off the
          top correctly. The CPU has one adder, and it doesn&apos;t care about signs.
        </p>

        <Callout variant="insight" title="Why -1 is all 1s, in one line">
          <p>
            If you add 1 to <code>-1</code> you get <code>0</code>. The only 32-bit pattern that, when you add 1, rolls
            over to all-zeros (with the carry escaping off the top) is all-ones. So <code>-1 == 0xFFFFFFFF</code> by
            arithmetic necessity, not convention.
          </p>
        </Callout>

        <h3>Java&apos;s seven bit operators</h3>

        <p>
          You already know <code>+ - * /</code>. Here are the operators that work directly on the bit pattern:
        </p>

        <CodeBlock lang="java">{`int a = 0b1100;   // 12
int b = 0b1010;   // 10

a & b;    // 0b1000 = 8       AND  — bit set iff both inputs have it set
a | b;    // 0b1110 = 14      OR   — bit set iff either input has it set
a ^ b;    // 0b0110 = 6       XOR  — bit set iff exactly one input has it set
~a;       // 0b...11110011 = -13   NOT — flip every bit (all 32!)

a << 2;   // 0b110000 = 48    left shift  — multiply by 2^k, fill with zeros
a >> 2;   // 0b11 = 3         arithmetic right shift — divide by 2^k, fill with sign bit
a >>> 2;  // 0b11 = 3         logical    right shift — divide by 2^k, fill with zeros`}</CodeBlock>

        <p>
          For positive numbers, <code>&gt;&gt;</code> and <code>&gt;&gt;&gt;</code> are identical. The difference shows
          up only on negative numbers — and it&apos;s a real difference, not a curiosity:
        </p>

        <CodeBlock lang="java">{`int n = -8;            // 0xFFFFFFF8 (all ones except the low three)

n >> 1;                // -4   — fills in a 1 on the left to preserve the sign
n >>> 1;               // 2147483644 (huge positive) — fills in a 0 on the left

// Stated differently:
// >>  treats the int as a signed quantity and divides by 2.
// >>> treats the int as 32 raw bits and shifts them.`}</CodeBlock>

        <Callout variant="warn" title="The &gt;&gt;&gt; trap">
          <p>
            If you need to iterate over the bits of an <code>int</code> from MSB down using a right shift, you almost
            always want <code>&gt;&gt;&gt;</code> (logical), not <code>&gt;&gt;</code> (arithmetic). With <code>&gt;&gt;</code>,
            a negative input fills new high bits with 1s forever, and your loop never terminates. Java&apos;s own{" "}
            <code>Integer.toBinaryString</code> uses <code>&gt;&gt;&gt;</code> internally for exactly this reason.
          </p>
        </Callout>

        <h3>Worked example: n = 5, ~n = -6</h3>

        <p>
          The complement operator surprises everyone the first time. Why is <code>~5</code> equal to <code>-6</code>{" "}
          and not, say, <code>-5</code>?
        </p>

        <CodeBlock lang="plain">{` 5  =  00000000 00000000 00000000 00000101
~5  =  11111111 11111111 11111111 11111010   (every bit flipped)

To read 11111111...11111010 as a signed int, decode two's complement:
  flip: 00000000 00000000 00000000 00000101
  + 1:  00000000 00000000 00000000 00000110  =  6
So the value is -6.

Equivalently, the identity ~n == -n - 1 always holds.`}</CodeBlock>

        <p>
          That identity — <code>~n == -n - 1</code> — is worth memorizing. It pops up constantly when you&apos;re
          deriving bit tricks from scratch.
        </p>

        <h3>Reading bits in Java</h3>

        <p>
          Java has a few standard helpers you should know about so you don&apos;t reimplement them by accident:
        </p>

        <ul>
          <li><code>Integer.toBinaryString(n)</code> — string of 1s and 0s, no leading zeros, treats n as unsigned</li>
          <li><code>Integer.bitCount(n)</code> — popcount, the number of 1 bits, JIT-compiled to a single CPU instruction on modern hardware</li>
          <li><code>Integer.numberOfLeadingZeros(n)</code>, <code>numberOfTrailingZeros(n)</code></li>
          <li><code>Integer.highestOneBit(n)</code>, <code>lowestOneBit(n)</code> — return the bit pattern, not the index</li>
          <li><code>Integer.reverse(n)</code>, <code>Integer.reverseBytes(n)</code></li>
        </ul>

        <p>
          For <code>long</code>, the same helpers exist on <code>Long</code>. In an interview, knowing these exists is
          half the win — but you&apos;ll usually be asked to implement at least one of them &quot;from scratch.&quot;
          That&apos;s what the rest of this module is about.
        </p>

        <Quiz
          kind="Quick check"
          question="What does (int)((1L << 32) - 1) evaluate to in Java?"
          options={[
            { label: "0 — int overflow.", explanation: "(1L << 32) is 4294967296L, then -1L is 4294967295L. The cast to int truncates to the low 32 bits — but those 32 bits are all 1s." },
            { label: "-1 — the low 32 bits are all 1s, which is the two's-complement representation of -1.", correct: true, explanation: "Right. (1L << 32) - 1 = 0x00000000FFFFFFFFL. Cast to int keeps the low 32 bits, which is 0xFFFFFFFF — and that pattern, interpreted as a signed int, is -1. This is the standard idiom for 'a 32-bit mask of all ones,' and the cast lands you on -1." },
            { label: "2147483647 — Integer.MAX_VALUE.", explanation: "MAX_VALUE is 0x7FFFFFFF, with the sign bit clear. The pattern 0xFFFFFFFF has every bit set, including the sign bit, so it's -1, not MAX_VALUE." },
            { label: "Compile error.", explanation: "Java allows the cast and the shift just fine. The expression is well-formed and evaluates at runtime." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="You write `for (int i = -8; i != 0; i = i >> 1) { ... }`. What happens?"
          options={[
            { label: "Loops 4 times — the bit pattern of -8 is shifted right four times before reaching zero.", explanation: "That would be true for >>>, the logical shift. With arithmetic >>, the sign bit replicates and you never reach zero." },
            { label: "Infinite loop — arithmetic right-shift fills high bits with the sign bit, so the value stays negative forever.", correct: true, explanation: "Right. -8 is 0xFFFFFFF8; >> 1 fills with the sign bit, giving 0xFFFFFFFC = -4. Repeat — eventually you get to -1 = 0xFFFFFFFF, and -1 >> 1 is still -1. The classic >> vs >>> bug. Use >>> when you want the bit pattern to drain to zero." },
            { label: "Compile error — i is signed and the loop is malformed.", explanation: "Compiles fine. The bug is runtime behavior, not type-checking." },
            { label: "Loops once and exits.", explanation: "The loop runs as long as i != 0. With arithmetic shift, i is never 0 for a negative starting value." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Tricks ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="tricks" title="I can get/set/clear/toggle a bit without thinking" xp={25}>
      <section>
        <h2 id="tricks">The bit-manipulation toolbox</h2>

        <p>
          Six idioms cover 90% of bit-manipulation problems. Memorize them once and you&apos;ll spot the pattern instantly
          in problem statements that look like &quot;the i-th flag,&quot; &quot;is power of 2,&quot; or &quot;walk the
          set bits.&quot;
        </p>

        <h3>1. Get bit i</h3>

        <CodeBlock lang="java">{`// Returns 0 or 1 — the bit at index i (0 = least significant).
int getBit(int n, int i) {
    return (n >> i) & 1;
}`}</CodeBlock>

        <p>
          Shift the bit you care about into the low position, then mask everything else off. Worked example with{" "}
          <code>n = 0b10110</code>, <code>i = 2</code>:
        </p>

        <CodeBlock lang="plain">{`n        = 10110
n >> 2   = 00101         (push bit 2 to position 0)
& 1      = 00001 = 1     (mask everything but the low bit)`}</CodeBlock>

        <h3>2. Set bit i</h3>

        <CodeBlock lang="java">{`int setBit(int n, int i) {
    return n | (1 << i);
}`}</CodeBlock>

        <p>
          Build a mask with a single 1 at position i, then OR it in. OR with 1 forces the bit on; OR with 0 leaves
          neighbors alone. <code>n = 0b10010</code>, <code>i = 2</code>:
        </p>

        <CodeBlock lang="plain">{`n          = 10010
1 << 2     = 00100
n | mask   = 10110         (bit 2 turned on; the rest unchanged)`}</CodeBlock>

        <h3>3. Clear bit i</h3>

        <CodeBlock lang="java">{`int clearBit(int n, int i) {
    return n & ~(1 << i);
}`}</CodeBlock>

        <p>
          Build a mask with a single 0 at position i and 1s everywhere else, then AND. AND with 0 forces the bit off;
          AND with 1 leaves neighbors alone. <code>n = 0b10110</code>, <code>i = 2</code>:
        </p>

        <CodeBlock lang="plain">{`n            = 10110
1 << 2       = 00100
~(1 << 2)    = ...11011    (the mask is 32 bits; only bit 2 is zero)
n & mask     = 10010       (bit 2 cleared; the rest unchanged)`}</CodeBlock>

        <h3>4. Toggle bit i</h3>

        <CodeBlock lang="java">{`int toggleBit(int n, int i) {
    return n ^ (1 << i);
}`}</CodeBlock>

        <p>
          XOR with 1 flips a bit; XOR with 0 leaves it alone. So a mask with a single 1 at position i toggles exactly
          that bit. <code>n = 0b10110</code>, <code>i = 2</code> → <code>0b10010</code>; toggle the same bit again →{" "}
          <code>0b10110</code>. (XOR is its own inverse — that&apos;s the property the next part will exploit hard.)
        </p>

        <h3>5. Lowest set bit</h3>

        <CodeBlock lang="java">{`int lowestSetBit(int n) {
    return n & -n;       // returns the bit pattern, not the index
}`}</CodeBlock>

        <p>
          The most magical of the six. Why does <code>n &amp; -n</code> isolate the lowest 1?{" "}
          <code>-n</code> is two&apos;s complement, which is &quot;flip all bits, then add 1.&quot; The +1 propagates
          through every trailing zero, then stops at the lowest 1, which gets flipped from 0 to 1 by the carry. Above
          that bit, the original flip survives. Below it, the carry chain consumed everything. AND those two patterns
          and only the lowest 1 survives.
        </p>

        <CodeBlock lang="plain">{`n         =  0 0 0 0 1 1 0 0     (12)
~n        =  1 1 1 1 0 0 1 1
~n + 1    =  1 1 1 1 0 1 0 0     (-12 in two's complement)
n & -n    =  0 0 0 0 0 1 0 0     (4 — the lowest 1 of n)`}</CodeBlock>

        <h3>6. Clear lowest set bit</h3>

        <CodeBlock lang="java">{`int clearLowestSetBit(int n) {
    return n & (n - 1);
}`}</CodeBlock>

        <p>
          Subtracting 1 turns the lowest 1 into a 0 and turns all the trailing 0s below it into 1s. AND with the
          original wipes out those flipped trailing bits and the lowest 1, leaving everything else unchanged.
        </p>

        <CodeBlock lang="plain">{`n          =  0 0 0 0 1 1 0 0     (12)
n - 1      =  0 0 0 0 1 0 1 1     (11; lowest 1 cleared, trailing 0s set)
n & (n-1)  =  0 0 0 0 1 0 0 0     (8 — lowest 1 of n removed)`}</CodeBlock>

        <h3>The power-of-2 check</h3>

        <p>
          Combining tricks 5 and 6: a positive integer <code>n</code> is a power of 2 iff it has exactly one set bit
          iff clearing that bit gives 0.
        </p>

        <CodeBlock lang="java">{`boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}`}</CodeBlock>

        <p>
          The <code>n &gt; 0</code> guard matters: <code>0 &amp; -1 == 0</code> would otherwise classify zero as a
          power of 2, and negative numbers would slip through too (e.g. <code>Integer.MIN_VALUE</code> = 0x80000000 has
          one set bit). The standard library version, <code>Integer.bitCount(n) == 1</code>, is also a one-liner — and
          for non-negative <code>n</code>, equivalent.
        </p>

        <Callout variant="info" title="Worked: is 64 a power of 2?">
          <p>
            <code>64 = 0b1000000</code>. <code>64 - 1 = 0b0111111</code>. <code>64 &amp; 63 = 0</code> — yes. Now try
            <code>48 = 0b110000</code>: <code>48 - 1 = 0b101111</code>; <code>48 &amp; 47 = 0b100000 = 32</code> — not
            zero, so not a power of 2.
          </p>
        </Callout>

        <h3>Iterating over set bits</h3>

        <p>
          Using trick 6 in a loop gives you a popcount that runs in O(set bits), which is faster than the
          bit-by-bit-shift version when the input is sparse:
        </p>

        <CodeBlock lang="java">{`int popcount(int n) {
    int count = 0;
    while (n != 0) {
        n &= n - 1;          // peel off the lowest 1
        count++;
    }
    return count;
}`}</CodeBlock>

        <p>This is Brian Kernighan&apos;s algorithm — and the bridge to the next part.</p>

        <Quiz
          kind="Toolbox check"
          question="You have an int permissions and want to set bit 3 ON, bit 5 OFF, and toggle bit 7 — all at once. Which expression does it?"
          options={[
            { label: "(permissions | (1 << 3)) & ~(1 << 5) ^ (1 << 7)", correct: true, explanation: "Right. Set with OR, clear with AND-NOT, toggle with XOR — applied in sequence. Operator precedence: |, & ~, ^ — so the parentheses on the first two are needed but not on the XOR (it's lowest precedence). The composition pattern works for any combination of bit edits." },
            { label: "permissions | (1 << 3) | ~(1 << 5) | (1 << 7)", explanation: "All ORs only set bits. ~(1 << 5) has bit 5 zero and everything else one — ORing that into permissions sets every bit except 5, not what you want." },
            { label: "permissions & (1 << 3) & ~(1 << 5) & (1 << 7)", explanation: "ANDing with (1 << 3) zeroes everything except bit 3. You'd lose all your other bits. AND clears, OR sets — you've got them swapped." },
            { label: "permissions ^ (1 << 3) ^ (1 << 5) ^ (1 << 7)", explanation: "Three XORs would toggle all three bits, including 3 and 5 — you wanted 3 set unconditionally and 5 cleared unconditionally, not toggled." },
          ]}
        />

        <Quiz
          kind="Toolbox check"
          question="Why does `n & (n - 1) == 0` correctly identify powers of 2 only when paired with `n > 0`?"
          options={[
            { label: "n - 1 underflows for n == 0.", explanation: "0 - 1 doesn't underflow in two's complement — it just wraps to -1, which is 0xFFFFFFFF. The issue is what 0 & -1 evaluates to." },
            { label: "0 & -1 == 0, so n == 0 would falsely pass; and Integer.MIN_VALUE has one set bit but is negative.", correct: true, explanation: "Right. 0 - 1 is 0xFFFFFFFF, and 0 & 0xFFFFFFFF is 0 — so n == 0 sneaks past the test if you don't guard. Integer.MIN_VALUE is 0x80000000, which has exactly one bit set; the trick says 'one set bit means power of 2,' but a negative number with one set bit isn't a power of 2 in any reasonable sense. The n > 0 guard rules out both edge cases." },
            { label: "Powers of 2 must be at least 2.", explanation: "1 is conventionally a power of 2 (it's 2^0), and the trick correctly returns true for n=1." },
            { label: "It's a Java-specific issue with int overflow.", explanation: "It's a math issue, not a Java-specific one. Any language with two's-complement ints would have the same edge cases." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · XOR ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="xor" title="I understand XOR's properties and the Single Number trick" xp={25}>
      <section>
        <h2 id="xor">XOR&apos;s superpowers</h2>

        <p>
          XOR is the bit operator that does the most disproportionate work for its weight. Three properties are doing
          all of it:
        </p>

        <ul>
          <li><strong>Self-cancellation</strong> &nbsp;— <code>a ^ a = 0</code></li>
          <li><strong>Identity</strong> &nbsp;— <code>a ^ 0 = a</code></li>
          <li><strong>Commutative &amp; associative</strong> &nbsp;— you can XOR a sequence in any order and get the same result</li>
        </ul>

        <p>
          Combine them and you get something remarkable: if you XOR every element of an array, every value that appears
          an even number of times cancels itself out completely, and every value that appears an odd number of times
          survives unchanged.
        </p>

        <h3>LC 136 · Single Number</h3>

        <p>
          Every element in <code>nums</code> appears exactly twice except one, which appears once. Find it. With XOR,
          the entire problem is one line:
        </p>

        <CodeBlock lang="java">{`public int singleNumber(int[] nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`}</CodeBlock>

        <Mermaid chart={singleNumberFlow} />

        <p>
          The naive solution uses a HashSet — add on first sight, remove on second; whatever&apos;s left is the loner.
          That&apos;s O(n) time, O(n) space. The XOR version is O(n) time, <strong>O(1) space</strong>. The space
          savings come from the fact that XOR <em>itself</em> is the data structure: a single 32-bit accumulator that
          remembers the parity of every value seen so far.
        </p>

        <Callout variant="insight" title="Why &quot;parity accumulator&quot; is the right mental model">
          <p>
            Bit by bit, XOR is just &quot;count the number of 1s in this column, mod 2.&quot; A duplicate contributes
            two 1s to its bits, which mod 2 is zero. A loner contributes one 1, which mod 2 is one. So the final
            accumulator&apos;s bits are exactly the bits of the value that appeared an odd number of times — there can
            only be one such value, by the problem statement.
          </p>
        </Callout>

        <h3>LC 268 · Missing Number</h3>

        <p>
          You&apos;re given an array of <code>n</code> distinct numbers from <code>[0, n]</code> with one value
          missing. Find it. The same XOR trick works — pair every index with every value, and the missing one is the
          only thing without a partner.
        </p>

        <CodeBlock lang="java">{`public int missingNumber(int[] nums) {
    int acc = nums.length;          // start with n itself, since it's not an index
    for (int i = 0; i < nums.length; i++) {
        acc ^= i ^ nums[i];
    }
    return acc;
}`}</CodeBlock>

        <p>
          For <code>nums = [3, 0, 1]</code> with <code>n = 3</code>: <code>3 ^ (0 ^ 3) ^ (1 ^ 0) ^ (2 ^ 1) = 2</code>.
          Every present value appears twice (once as index, once as value), so it cancels. The missing value, 2, only
          appears as an index — it survives.
        </p>

        <Callout variant="info" title="The arithmetic alternative — and why XOR is preferred">
          <p>
            You can also solve missing-number with sum: <code>n*(n+1)/2 - sum(nums)</code>. That&apos;s correct for
            normal-size arrays, but it overflows when <code>n</code> approaches 2^16 (since <code>n²</code> overflows
            <code>int</code>). XOR has no overflow because every operation stays within 32 bits — it&apos;s the more
            robust solution for the same asymptotic cost.
          </p>
        </Callout>

        <h3>LC 260 · Single Number III — find two singletons</h3>

        <p>
          Now the puzzle gets more interesting. Every element appears twice except <em>two</em> different values that
          each appear once. Find both. XOR-everything gives you <code>a ^ b</code> — but you can&apos;t recover{" "}
          <code>a</code> and <code>b</code> directly from the combined value.
        </p>

        <p>
          The trick: <code>a ^ b</code> has a <code>1</code> in every bit position where <code>a</code> and{" "}
          <code>b</code> differ. Pick any one such position — say, the lowest set bit of <code>a ^ b</code>. Now
          partition the array into two groups: numbers with that bit set, and numbers without. <code>a</code> goes in
          one group, <code>b</code> goes in the other (because they differ on that bit), and every duplicate goes in
          the same group as its twin (because duplicates are equal in every bit). XOR each group separately —
          duplicates cancel, and you&apos;re left with <code>a</code> and <code>b</code>.
        </p>

        <CodeBlock lang="java">{`public int[] singleNumberIII(int[] nums) {
    int xor = 0;
    for (int x : nums) xor ^= x;     // xor = a ^ b

    int diffBit = xor & -xor;        // any bit where a and b differ — pick the lowest

    int a = 0, b = 0;
    for (int x : nums) {
        if ((x & diffBit) == 0) a ^= x;
        else                    b ^= x;
    }
    return new int[]{a, b};
}`}</CodeBlock>

        <p>
          Two passes, O(n) time, O(1) space — and a beautiful application of the lowest-set-bit trick from the
          previous part. The partitioning step is where the bit toolbox earns its keep.
        </p>

        <h3>Other XOR moves worth knowing</h3>

        <ul>
          <li>
            <strong>In-place swap</strong>: <code>a ^= b; b ^= a; a ^= b;</code> swaps two ints with no temporary.
            Cute, almost never the right answer in real code (unreadable, no faster than a temp on any modern CPU,
            breaks if a and b alias the same memory), but a good demo of self-cancellation in action.
          </li>
          <li>
            <strong>Detect odd parity</strong>: <code>(x ^ x &gt;&gt;&gt; 16 ^ x &gt;&gt;&gt; 8 ^ ... ) &amp; 1</code>{" "}
            in a fold tree gives the parity of <code>x</code>&apos;s set bits in O(log) ops. (Hardware does this in
            one instruction; <code>Integer.bitCount(x) &amp; 1</code> is the cleanest portable form.)
          </li>
          <li>
            <strong>Toggle without branches</strong>: <code>flag ^= 1</code> alternates a 0/1 cleanly.
          </li>
        </ul>

        <Quiz
          kind="XOR check"
          question="An array contains every integer from 1..100 exactly twice, except one number that appears three times. What does XOR-ing the entire array give you?"
          options={[
            { label: "0 — every number appears an even number of times.", explanation: "Two appearances cancel, but three appearances leave one copy. The triple-appearing value survives an odd count." },
            { label: "The triple-appearing number — three XORs cancel down to one copy.", correct: true, explanation: "Right. Self-cancellation means a^a = 0, and a^a^a = a. So every duplicate (count 2) zeroes out, but the triple-counted value survives once. The XOR trick generalizes to: 'survive iff appearance count is odd.' Same logic as Single Number, just with odd = 3 instead of odd = 1." },
            { label: "Three times the triple-appearing number.", explanation: "XOR isn't addition. a^a^a = a, not 3a. There's no 'three times' here — XOR is bitwise mod-2 on each column." },
            { label: "Undefined — XOR can't handle uneven counts.", explanation: "XOR is perfectly defined for any sequence of inputs, regardless of how many times each value appears." },
          ]}
        />

        <Quiz
          kind="XOR check"
          question="In LC 260's two-singletons trick, why does picking ANY differing bit (not just the lowest) work for partitioning?"
          options={[
            { label: "It only works with the lowest bit; that's why the example uses x & -x.", explanation: "The lowest is convenient and idiomatic, but mathematically any single differing bit works. The lowest-set-bit trick is just a fast way to pick one." },
            { label: "Because a and b differ on that bit by definition, so they fall in different groups; and duplicates equal each other on every bit, so they fall in the same group as their twin.", correct: true, explanation: "Right. The partition needs two properties: a and b must end up on opposite sides (which any bit where they differ guarantees), and duplicates must end up together (which any bit guarantees, since equal numbers have equal bits everywhere). So any bit set in a^b works as the partition key. The lowest is just easy to extract via x & -x." },
            { label: "Because XOR is commutative, the partition bit doesn't matter.", explanation: "Commutativity is about reordering operations on the same data, not about the partition. The partition correctness comes from a and b differing on the chosen bit." },
            { label: "Because the highest bit is always the sign, and a and b can't both be negative.", explanation: "Sign isn't relevant here; the partition logic works for any signedness. And the highest differing bit isn't required either — any differing bit suffices." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Counting Bits ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="counting" title="I know Brian Kernighan's trick and the counting-bits DP" xp={25}>
      <section>
        <h2 id="counting">Counting bits: Brian Kernighan + DP</h2>

        <p>
          Two algorithms for counting set bits, each elegant in its own way and each useful in different situations.
        </p>

        <h3>LC 191 · Number of 1 Bits — Brian Kernighan&apos;s algorithm</h3>

        <p>
          You&apos;ve already seen this one. Use the <code>n &amp; (n - 1)</code> trick to peel off the lowest set bit
          and count how many times you can do it before reaching zero:
        </p>

        <CodeBlock lang="java">{`public int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        n &= n - 1;
        count++;
    }
    return count;
}`}</CodeBlock>

        <Callout variant="insight" title="Why this beats the naive bit-by-bit loop">
          <p>
            The naive approach is to shift right 32 times and check the low bit each time — that&apos;s O(32), or
            O(width) — fixed cost regardless of how many 1s are in the input. Kernighan&apos;s loop is O(set bits),
            which for sparse inputs (most production-data inputs are sparse) can be dramatically faster. For
            <code>n = 0x80000000</code> (one set bit), Kernighan does one iteration; the naive loop does 32.
          </p>
        </Callout>

        <p>
          (For absolute speed, <code>Integer.bitCount(n)</code> JIT-compiles to a single <code>POPCNT</code>{" "}
          instruction on x86 since Java 7. The Kernighan version is what to write when an interviewer asks you to
          &quot;implement it yourself.&quot;)
        </p>

        <h3>LC 338 · Counting Bits — the DP twist</h3>

        <p>
          Now: given <code>n</code>, return an array <code>ans</code> of length <code>n + 1</code> where{" "}
          <code>ans[i]</code> is the popcount of <code>i</code>, for <code>i = 0..n</code>. Calling Kernighan{" "}
          <code>n + 1</code> times is fine — total work is O(n log n) in the worst case, and O(n) on average — but
          there&apos;s a cleaner DP that nails O(n) every time.
        </p>

        <p>
          The recurrence: <code>dp[i] = dp[i &gt;&gt; 1] + (i &amp; 1)</code>.
        </p>

        <p>
          The idea: every integer <code>i</code> can be written as <code>(i &gt;&gt; 1)</code> with one extra low bit
          tacked on the end. So the popcount of <code>i</code> is the popcount of <code>i &gt;&gt; 1</code> (which
          we already computed, because we&apos;re iterating in increasing order), plus 1 if the dropped low bit was a
          1, or 0 otherwise. Constant work per index, with O(n) memory for the answer array.
        </p>

        <CodeBlock lang="java">{`public int[] countBits(int n) {
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1);
    }
    return dp;
}`}</CodeBlock>

        <p>Worked example — <code>n = 8</code>:</p>

        <CodeBlock lang="plain">{`i  binary    i >> 1   dp[i >> 1]   i & 1   dp[i]
0  0000      —        —            —       0
1  0001      0        0            1       1
2  0010      1        1            0       1
3  0011      1        1            1       2
4  0100      2        1            0       1
5  0101      2        1            1       2
6  0110      3        2            0       2
7  0111      3        2            1       3
8  1000      4        1            0       1`}</CodeBlock>

        <p>
          Each row is O(1). The whole table builds in O(n). And there&apos;s a satisfying alternative recurrence using
          the Kernighan trick: <code>dp[i] = dp[i &amp; (i - 1)] + 1</code>, which says &quot;popcount of i is one more
          than the popcount of i with its lowest 1 removed.&quot; Both are O(n); pick whichever you find easier to
          remember.
        </p>

        <Callout variant="info" title="Why this counts as DP, not just memoization">
          <p>
            The defining feature of DP is that smaller subproblems&apos; answers feed directly into bigger ones with no
            recomputation. Here, <code>dp[i &gt;&gt; 1]</code> was filled in earlier in the same loop because{" "}
            <code>i &gt;&gt; 1 &lt; i</code> for all <code>i &gt; 0</code>. Bottom-up, no recursion, no memo table —
            just an iterative table fill. Phase 7 will lean on this exact pattern over and over.
          </p>
        </Callout>

        <Quiz
          kind="Counting check"
          question="For the recurrence dp[i] = dp[i >> 1] + (i & 1), why does iterating i from 1 to n in order guarantee correctness?"
          options={[
            { label: "Java initializes int arrays to zero, so dp[0] = 0 is already correct.", explanation: "True, but that's only a base case — the question is about why later cells have their dependencies ready." },
            { label: "Because i >> 1 < i for all i > 0, so by the time we compute dp[i], dp[i >> 1] has already been filled in this loop.", correct: true, explanation: "Right. The loop order matters because each cell depends on a strictly smaller index. i >> 1 is at most i/2 (or (i-1)/2 for odd i), so it's always less than i — and we've already visited it. This is the topological-order argument that justifies bottom-up DP: process subproblems in an order where every dependency is resolved first." },
            { label: "Because the JVM eagerly evaluates dp[i >> 1].", explanation: "JVM evaluation strategy isn't the reason. Even an interpreted language would compute the right answer with this loop order." },
            { label: "It doesn't — you have to compute in reverse order.", explanation: "Reverse would break it: dp[n] reads dp[n >> 1], which hasn't been computed yet. Forward is correct." },
          ]}
        />

        <Quiz
          kind="Counting check"
          question="Compared to calling Integer.bitCount(i) in a loop, what does the DP version of Counting Bits actually save?"
          options={[
            { label: "Asymptotic time — bitCount in a loop is O(n²), DP is O(n).", explanation: "bitCount is O(1) on modern hardware. Calling it n times is O(n), not O(n²)." },
            { label: "It doesn't really save anything — bitCount is already fast. The DP is mostly an exercise in seeing the recurrence.", correct: true, explanation: "Right. Integer.bitCount is a single CPU instruction (POPCNT) and the loop is O(n) either way. In an interview context the DP approach is the expected answer because it shows you spotted the recurrence; in production, you'd just call bitCount. Both approaches are O(n) — the win is conceptual, not performance." },
            { label: "Memory — DP avoids allocating the result array.", explanation: "Both versions allocate the same n+1 result array; the question is what fills it." },
            { label: "Branch misprediction — DP has fewer branches.", explanation: "Both are simple straight-line loops; branch prediction is comparable. This is overthinking it — the right answer is that both are fine, and the DP showcases the pattern." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Bitmask ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="bitmask" title="I see how an int can encode a small set" xp={20}>
      <section>
        <h2 id="bitmask">Bitmask as a set: a teaser for bitmask DP</h2>

        <p>
          Here&apos;s the punchline of this whole module: <strong>an <code>int</code> is a set</strong>. Specifically,
          a 32-element set drawn from the universe <code>{`{0, 1, ..., 31}`}</code>. Bit <code>i</code> is on iff
          element <code>i</code> is in the set. Every set operation maps to a bit operation, and they all run in O(1):
        </p>

        <ul>
          <li><strong>Empty set</strong> &nbsp;— <code>0</code></li>
          <li><strong>Universal set</strong> &nbsp;— <code>(1 &lt;&lt; n) - 1</code> for an n-element universe</li>
          <li><strong>Singleton {`{i}`}</strong> &nbsp;— <code>1 &lt;&lt; i</code></li>
          <li><strong>Membership test</strong> &nbsp;— <code>(s &gt;&gt; i) &amp; 1</code> &nbsp;or&nbsp; <code>(s &amp; (1 &lt;&lt; i)) != 0</code></li>
          <li><strong>Add element i</strong> &nbsp;— <code>s | (1 &lt;&lt; i)</code></li>
          <li><strong>Remove element i</strong> &nbsp;— <code>s &amp; ~(1 &lt;&lt; i)</code></li>
          <li><strong>Union</strong> &nbsp;— <code>a | b</code></li>
          <li><strong>Intersection</strong> &nbsp;— <code>a &amp; b</code></li>
          <li><strong>Symmetric difference</strong> &nbsp;— <code>a ^ b</code></li>
          <li><strong>Set difference</strong> &nbsp;— <code>a &amp; ~b</code></li>
          <li><strong>Size</strong> &nbsp;— <code>Integer.bitCount(s)</code></li>
          <li><strong>Subset test</strong> &nbsp;— <code>(a &amp; b) == a</code> &nbsp;means &quot;a ⊆ b&quot;</li>
        </ul>

        <Callout variant="insight" title="Why this is so much faster than HashSet">
          <p>
            For small universes (≤ 32 with int, ≤ 64 with long), a bitmask is faster than HashSet by orders of
            magnitude — every operation is one CPU instruction instead of hashing, looking up a bucket, comparing
            equality, and following pointers. The cost is the universe-size limit: as soon as you need more than 64
            elements you have to either move to <code>BigInteger</code> bit operations (slower per-op but unlimited
            size) or back to HashSet.
          </p>
        </Callout>

        <h3>Iterate every subset of {`{0..n-1}`}</h3>

        <p>
          With one int as the subset, &quot;loop over every subset&quot; is just &quot;loop from 0 to 2^n - 1.&quot;
          For each value of <code>mask</code>, the bits of <code>mask</code> tell you which elements are in this
          particular subset.
        </p>

        <CodeBlock lang="java">{`for (int mask = 0; mask < (1 << n); mask++) {
    // 'mask' represents one specific subset of {0..n-1}.
    // For each bit i in mask, element i is included.
    for (int i = 0; i < n; i++) {
        if ((mask & (1 << i)) != 0) {
            // element i is in this subset
        }
    }
}`}</CodeBlock>

        <p>
          That&apos;s O(2^n · n), which is exactly the complexity you want for &quot;try every subset and pick the
          best.&quot; For n ≤ 20, this is fast (n=20 → ~21 million iterations, well under a second). For n ≥ 25,
          you&apos;re in trouble unless you can find structure to prune.
        </p>

        <h3>Iterate every subset of a given mask</h3>

        <p>
          Sometimes you don&apos;t want all 2^n subsets — you want the subsets <em>of a particular mask</em>{" "}
          <code>m</code>. There&apos;s a clever idiom for this:
        </p>

        <CodeBlock lang="java">{`for (int s = mask; s > 0; s = (s - 1) & mask) {
    // 's' iterates over every non-empty subset of 'mask'.
}`}</CodeBlock>

        <p>
          Why does this work? <code>s - 1</code> turns the lowest set bit of <code>s</code> into 0 and flips all bits
          below it to 1. ANDing with <code>mask</code> drops those flipped low bits that aren&apos;t in <code>mask</code>{" "}
          — leaving exactly the next-smaller subset. The loop stops when <code>s</code> becomes <code>0</code>{" "}
          (the empty subset, optionally handled separately).
        </p>

        <Callout variant="info" title="Why this is genuinely surprising">
          <p>
            A mask with k set bits has exactly 2^k subsets. The loop visits each one in exactly k iterations of the
            outer pattern? No — in 2^k iterations. The point is that this loop visits every submask of mask in O(2^k)
            total time, where k is the popcount of mask. Across all masks, the total work is the famous{" "}
            <code>3^n</code> sum (each bit independently chooses to be in mask, in submask, or in neither — so there
            are 3^n (mask, submask) pairs), not <code>4^n</code>. That O(3^n) total is the workhorse of subset-DP.
          </p>
        </Callout>

        <h3>The teaser: bitmask DP</h3>

        <p>
          Suppose you have <code>n = 15</code> cities and you want the shortest tour that visits each one exactly once
          (Travelling Salesman). The naive search is <code>n! ≈ 1.3 trillion</code> — utterly infeasible. The bitmask DP
          version uses <code>dp[mask][i]</code> = &quot;shortest path that has visited exactly the cities in mask and
          currently sits at city i.&quot; Total states: 2^15 · 15 ≈ 491,520. Transitions: O(n). Total work: about 7
          million operations — under a second.
        </p>

        <CodeBlock lang="java">{`// Sketch only — full implementation comes in Module 29 (Phase 7 · Advanced DP).
// dp[mask][i] = min cost to visit exactly the cities in 'mask', ending at city i.

int[][] dp = new int[1 << n][n];
// ... base cases ...

for (int mask = 0; mask < (1 << n); mask++) {
    for (int i = 0; i < n; i++) {
        if ((mask & (1 << i)) == 0) continue;       // i must be in mask
        for (int j = 0; j < n; j++) {
            if ((mask & (1 << j)) != 0 || i == j) continue;
            int next = mask | (1 << j);
            dp[next][j] = Math.min(dp[next][j], dp[mask][i] + cost[i][j]);
        }
    }
}`}</CodeBlock>

        <p>
          We&apos;re leaving the actual TSP solution for Phase 7 — the point here is just to plant the seed: when{" "}
          <em>n</em> is small (≤ 20-ish) and the state needs to remember &quot;which subset have we seen,&quot;
          bitmask DP is the technique. Module 29 will work this out properly.
        </p>

        <Quiz
          kind="Bitmask check"
          question="Why does the loop `for (int s = mask; s > 0; s = (s - 1) & mask)` enumerate exactly the non-empty subsets of mask?"
          options={[
            { label: "Because (s - 1) is the next integer down, and ANDing with mask filters it.", explanation: "Closer, but 's - 1' isn't the next subset — many integers between subsets aren't subsets. The AND step is what skips them." },
            { label: "Because (s - 1) flips the lowest bit of s and the bits below it, and `& mask` keeps only the bits also in mask — yielding the subset just below s in submask order.", correct: true, explanation: "Right. Subtracting 1 from s zeros the lowest set bit and sets all lower bits; ANDing with mask intersects back into mask. The result is the next-smaller submask in the natural ordering. The loop visits each submask exactly once before s becomes 0 and the loop exits." },
            { label: "Because mask is always a power of 2.", explanation: "The trick works for any mask, not just powers of 2. Powers of 2 have only one non-empty subset, which would be a degenerate case." },
            { label: "Because Java's for-loop syntax automatically tracks visited subsets.", explanation: "Java does no such tracking. Correctness comes from the math of (s-1) & mask, not from the language." },
          ]}
        />

        <Quiz
          kind="Bitmask check"
          question="Why is bitmask-as-set limited to small universes (n ≤ 32 with int, n ≤ 64 with long)?"
          options={[
            { label: "Because Java doesn't support larger primitive integer types.", correct: true, explanation: "Right. int is exactly 32 bits, long is exactly 64 — those are the limits set by the language. Beyond that you need BigInteger (which supports bit operations but isn't a primitive — every op allocates) or Java's BitSet (a wrapper around long[]). Both work, but you lose the single-instruction speed of primitive bitops." },
            { label: "Because hashing collisions become more likely.", explanation: "There's no hashing in a bitmask — the value IS the set. Hashing isn't related." },
            { label: "Because 2^32 subsets can't be stored in memory.", explanation: "You don't store all subsets — you store one mask, an int. The limitation is bit-count per mask, not subset count." },
            { label: "Because Integer.bitCount is slow above 32.", explanation: "bitCount is O(1) regardless of input. The size cap is from primitive type widths, not algorithm cost." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Project ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="project" title="I implemented Sum of Two Integers without + or -" xp={40} manual manualLabel="I solved Sum of Two Integers in Java">
      <section>
        <h2 id="project">Project: Sum of Two Integers</h2>

        <p>
          LC 371. Implement integer addition without using <code>+</code> or <code>-</code>. The trick weaves together
          three ideas from this module: XOR for &quot;sum without carry,&quot; AND for &quot;where the carry happens,&quot;
          and left-shift for &quot;where the carry lands.&quot;
        </p>

        <h3>The two halves of an addition</h3>

        <p>
          When you add two binary numbers in the usual way, every column does two things: it produces a result bit, and
          it produces a carry into the next column. Both can be expressed bitwise:
        </p>

        <ul>
          <li><strong>Sum bit (no carry)</strong>: <code>a ^ b</code> &nbsp;— XOR is exactly &quot;1 + 0 = 1, 0 + 1 = 1, 1 + 1 = 0&quot; (the result bit ignoring the carry).</li>
          <li><strong>Carry to next column</strong>: <code>(a &amp; b) &lt;&lt; 1</code> &nbsp;— a carry happens iff both bits are 1, and that carry has to be added one column to the left.</li>
        </ul>

        <p>
          The total addition is &quot;sum bit XOR (sum of the carry).&quot; But the carry is itself a number that
          might cause further carries when added in. So we recurse: replace <code>a</code> with the no-carry sum and{" "}
          <code>b</code> with the carry, and repeat. Eventually the carry runs out of room (becomes zero), and{" "}
          <code>a</code> alone is the answer.
        </p>

        <h3>The full implementation</h3>

        <CodeBlock lang="java">{`public int getSum(int a, int b) {
    while (b != 0) {
        int sum   = a ^ b;             // bits that are set in exactly one
        int carry = (a & b) << 1;      // bits that are set in both, shifted left
        a = sum;
        b = carry;
    }
    return a;
}`}</CodeBlock>

        <Callout variant="insight" title="Why the loop terminates">
          <p>
            Each iteration, the carry is set only where both <code>a</code> and <code>b</code> had a 1, and then
            shifted left by one. Roughly speaking, the carry moves &quot;leftward&quot; by at least one bit per
            iteration. After at most 32 iterations on int (or 64 on long), the carry has been shifted entirely off the
            top of the int and is zero — the loop exits, and <code>a</code> contains the final sum. Two&apos;s
            complement makes this work even for negative numbers and sign-flipped sums; the bits handle themselves.
          </p>
        </Callout>

        <h3>Walk-through: 5 + 3</h3>

        <Mermaid chart={sumFlow} />

        <CodeBlock lang="plain">{`Iter 0:  a = 5 = 0101    b = 3 = 0011
         sum   = 0101 ^ 0011 = 0110   (= 6)
         carry = (0101 & 0011) << 1 = 0001 << 1 = 0010   (= 2)

Iter 1:  a = 0110 (6)    b = 0010 (2)
         sum   = 0110 ^ 0010 = 0100   (= 4)
         carry = (0110 & 0010) << 1 = 0010 << 1 = 0100   (= 4)

Iter 2:  a = 0100 (4)    b = 0100 (4)
         sum   = 0100 ^ 0100 = 0000   (= 0)
         carry = (0100 & 0100) << 1 = 0100 << 1 = 1000   (= 8)

Iter 3:  a = 0000 (0)    b = 1000 (8)
         sum   = 0000 ^ 1000 = 1000   (= 8)
         carry = (0000 & 1000) << 1 = 0   — done!

Loop exits, return a = 8.   5 + 3 = 8.  ✓`}</CodeBlock>

        <h3>Subtraction, for free</h3>

        <p>
          Once you have addition, subtraction is <code>a + (-b)</code>, and <code>-b</code> is two&apos;s complement:
          <code>~b + 1</code>. So:
        </p>

        <CodeBlock lang="java">{`public int getDifference(int a, int b) {
    int negB = getSum(~b, 1);   // -b = ~b + 1
    return getSum(a, negB);
}`}</CodeBlock>

        <p>
          Two calls to your own <code>getSum</code>. No <code>-</code> operator anywhere — the bit operators do all
          the work.
        </p>

        <h3>Edge cases to verify</h3>

        <ul>
          <li><code>getSum(0, 0)</code> — loop never enters, returns 0 immediately.</li>
          <li><code>getSum(-1, 1)</code> — should be 0. (-1 is all-ones; ANDing with 1 gives 1, XORing gives ...11110. After the carry chain, the answer settles at 0.)</li>
          <li><code>getSum(Integer.MAX_VALUE, 1)</code> — overflows to <code>Integer.MIN_VALUE</code>, exactly as <code>+</code> would. Two&apos;s complement makes overflow consistent across both methods.</li>
          <li><code>getSum(-2, -3)</code> — should be -5. Negative inputs work because two&apos;s complement encodes them as bit patterns that the same algorithm processes correctly.</li>
        </ul>

        <Callout variant="warn" title="The classic interview follow-up">
          <p>
            &quot;Now do it without a loop.&quot; Hint: the carry can&apos;t propagate further than 32 bits, so a fixed
            unrolled chain of 32 (sum, carry) updates always suffices. It&apos;s ugly but constant-time. Most interviewers
            are satisfied with the loop version — but if asked, the unroll exists.
          </p>
        </Callout>

        <h3>The other three LeetCode problems</h3>

        <p>The full project list for this module is:</p>

        <ul>
          <li><strong>LC 136 · Single Number</strong> — XOR everything. ~3 lines.</li>
          <li><strong>LC 191 · Number of 1 Bits</strong> — Brian Kernighan&apos;s loop. ~5 lines.</li>
          <li><strong>LC 338 · Counting Bits</strong> — DP recurrence <code>dp[i] = dp[i &gt;&gt; 1] + (i &amp; 1)</code>. ~6 lines.</li>
          <li><strong>LC 371 · Sum of Two Integers</strong> — the implementation above. ~6 lines.</li>
        </ul>

        <p>
          Type each one out, submit, see green. Total time: about 30 minutes if you understand the patterns. The point
          isn&apos;t the lines of code — it&apos;s recognizing &quot;XOR cancels duplicates,&quot; &quot;<code>n &amp; (n-1)</code>{" "}
          peels a bit,&quot; &quot;<code>i &gt;&gt; 1</code> is the right subproblem,&quot; and &quot;XOR is sum,
          AND<code>&lt;&lt;</code>1 is carry&quot; on sight in future problems.
        </p>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 7 · Phase 6 wrap-up ───────────────── */}
      <Checkpoint moduleSlug="bit-manipulation" id="phase-recap" title="I've completed Module 25 — and Phase 6!" xp={50} celebration="Eight algorithmic techniques. You now have a vocabulary for solving most of the LeetCode catalog. Phase 7 — Dynamic Programming — is where the real bossfights live.">
      <section>
        <h2 id="phase-recap">Phase 6 · Algorithmic Techniques wrap-up</h2>

        <p>
          Eight modules. Eight techniques. Each one is a lens through which a whole family of problems suddenly looks
          tractable. The map of Phase 6:
        </p>

        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M18</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Two pointers</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when an array is sorted (or sortable) and you need pairs/triples that satisfy a relation. The two
              indices walk inward (or in the same direction) and prune the search space linearly.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M19</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Sliding window</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when you want a contiguous subarray (or substring) that satisfies an invariant. Expand the right
              pointer until the invariant breaks; contract the left until it&apos;s restored. O(n).
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M20</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Binary search</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when the search space is monotonic — sorted array, or any predicate that flips from false to true
              exactly once. Includes &quot;binary-search the answer&quot; for parametric problems. O(log n).
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M21</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Sorting</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when ordering simplifies the rest of the algorithm — interval problems, deduplication, two-pointer
              setups. Most languages ship merge or quick. O(n log n).
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M22</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Recursion &amp; D&amp;C</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when the problem decomposes naturally into independent (or near-independent) subproblems. Master
              theorem gives O(complexity); base case and combine step are the contracts that matter.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M23</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Backtracking</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when you need to enumerate or search combinatorial space — subsets, permutations, placements.
              Choose / explore / unchoose. Prune early to escape the exponential.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M24</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Greedy</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when each local optimum provably leads to the global one — exchange argument, matroid structure,
              or proof by induction. When greedy is wrong, it&apos;s spectacularly wrong; check small cases first.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">M25</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Bit manipulation</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
              Use when the input is naturally binary (flags, presence) or when XOR&apos;s self-cancellation collapses
              an O(n)-space problem to O(1). Bitmask is a 32-element set in disguise.
            </p>
          </div>
        </div>

        <PartRecap
          title="The Phase 6 mental model"
          gist="Algorithmic techniques are pattern-recognition lenses. The hard part isn't implementing them — it's spotting which lens applies to a problem you've never seen before."
          points={[
            { takeaway: "Sorted input is a strong signal — reach for binary search or two pointers first.", detail: "Whenever a problem hands you sorted data (or you can sort cheaply), the answer is almost always one of: binary search the value, two-pointer convergence, or a sliding window. The sortedness is the signal — don't waste it on a hashmap solution." },
            { takeaway: "Contiguous subarray? Sliding window. Pairs/triples? Two pointers. Search a value or threshold? Binary search.", detail: "These three look similar from a distance — they all walk indices over an array — but the sub-pattern depends on what shape the answer takes. Internalize the one-line trigger so you don't waste time iterating between them." },
            { takeaway: "Recursion + memoization → DP. Backtracking + memoization → top-down DP.", detail: "If your recursion has overlapping subproblems, you've stumbled into Phase 7. Subsets-with-memoization is just bitmask DP. Recursion-tree-with-memo is what every DP textbook calls 'top-down.' Phase 7 will make this rigorous." },
            { takeaway: "Greedy is the cheapest technique, but the hardest to trust.", detail: "When greedy works, the code is 5 lines. When it doesn't, it produces wrong answers fast. Always sketch a proof of correctness — exchange argument, induction, or counterexample search — before submitting greedy. If you can't prove it, fall back to DP." },
            { takeaway: "Bit manipulation is the lens for \"what if I treat this as bits?\" It hides in plain sight.", detail: "Many subset-DP, parity, and small-constant-state problems become trivial once you spot the bit pattern. Single Number, Counting Bits, and bitmask DP are the canonical examples — the trick is noticing 'oh, n ≤ 20, this is bitmask territory.'" },
          ]}
        />

        <h3>Mix and match — pattern recognition challenge</h3>

        <p>
          Last task of Phase 6: classify each problem by which Phase 6 technique fits best. These deliberately don&apos;t
          spoon-feed the answer — read the problem, picture the input, and ask &quot;which lens makes this collapse.&quot;
        </p>

        <ClassifyChallenge
          title="Phase 6 · pattern bingo"
          prompt="Pick the technique you'd reach for first. Some problems admit multiple solutions, but one is usually the cleanest fit."
          buckets={[
            { id: "two-ptr", label: "Two pointers", color: "rose" },
            { id: "sliding", label: "Sliding window", color: "amber" },
            { id: "bsearch", label: "Binary search", color: "emerald" },
            { id: "backtrack", label: "Backtracking", color: "indigo" },
            { id: "greedy", label: "Greedy", color: "sky" },
            { id: "bitmask", label: "Bit manipulation", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Find the median of two sorted arrays in O(log(min(m,n))).", answer: "bsearch", explanation: "The log gives it away. You binary-search the partition point in the shorter array; the median falls out from the four boundary values." },
            { id: "2", label: "Generate all permutations of a string.", answer: "backtrack", explanation: "Combinatorial enumeration. Choose / explore / unchoose, swapping the chosen index into place. n! outputs, so the cost is unavoidable." },
            { id: "3", label: "Longest substring with at most k distinct characters.", answer: "sliding", explanation: "Contiguous-subarray-with-invariant. Expand right; when the distinct-count exceeds k, shrink left until it doesn't. O(n)." },
            { id: "4", label: "Find the smallest number in [1, n] whose square exceeds x.", answer: "bsearch", explanation: "Monotonic predicate (i² > x flips false→true exactly once). Binary search on the answer space [1, n]. O(log n)." },
            { id: "5", label: "Pair up tasks so the difference between max and min within each pair is minimized.", answer: "two-ptr", explanation: "Sort, then pair smallest-with-largest using head and tail pointers. Classic two-pointer convergence over a sorted array." },
            { id: "6", label: "Schedule N meetings into the fewest possible rooms.", answer: "greedy", explanation: "Sort by start time, greedily assign each meeting to the earliest-freeing room (min-heap of room-end-times). Greedy + heap is the canonical interval-scheduling pattern." },
            { id: "7", label: "Among all 2^n subsets of n ≤ 20 cities, find the one minimizing total tour cost.", answer: "bitmask", explanation: "n ≤ 20 plus 'subset' is the bitmask DP signature. dp[mask][last_city]. We sketched it in this module; the full solution is in Module 29." },
            { id: "8", label: "Place 8 queens on an 8x8 board with no two attacking each other.", answer: "backtrack", explanation: "Place row by row, prune when a queen attacks any earlier row. Backtrack on dead-end. Choose / explore / unchoose, with diagonals tracked in three sets (or three bitmasks)." },
            { id: "9", label: "In an array where every element appears 3 times except one (which appears once), find the loner — O(1) extra space.", answer: "bitmask", explanation: "Generalization of Single Number. Track ones-count and twos-count of each bit-column; the value with count 1 mod 3 survives. XOR isn't enough alone — you need a small bit-state machine." },
            { id: "10", label: "Smallest contiguous subarray whose sum is at least target (positive ints).", answer: "sliding", explanation: "Variable-window: expand right while sum < target; record length and shrink left while sum >= target. O(n)." },
          ]}
        />

        <Quiz
          kind="Phase final"
          question="A problem says: 'You have an array of n ≤ 20 jobs and a set of k machines. Find the minimum total time to assign each job to exactly one machine, with each machine running its assigned jobs sequentially.' Which Phase 6 technique fits best?"
          options={[
            { label: "Greedy — sort jobs by length and assign to least-loaded machine.", explanation: "That's the LPT heuristic, and it's a 4/3-approximation of optimal — not exact. The problem asks for the minimum, so greedy gives the wrong answer in general. The n ≤ 20 hint is the giveaway." },
            { label: "Backtracking — try every assignment and prune.", explanation: "Workable but expensive: k^n possibilities. For n=20, k=4, that's a trillion — too slow. There's a state-space-collapse opportunity that makes this tractable." },
            { label: "Bitmask DP — dp[mask] = min time to schedule the subset of jobs encoded by mask, distributing one machine at a time.", correct: true, explanation: "Right. n ≤ 20 plus 'subset' plus 'minimum' is the bitmask DP signature. State: dp[mask] = min makespan when subset of jobs 'mask' has been processed. Transition: pick a submask to assign to one machine, recurse on the complement. The submask iteration trick `for (s = mask; s > 0; s = (s-1) & mask)` is the inner loop. O(3^n · k) — about 3 billion for n=20, k=4 — too slow naively, but with the right state design (and the n ≤ 14 variant on actual interviews) bitmask DP solves it. The n ≤ 20 is the strongest signal you have." },
            { label: "Binary search — search the answer space for the minimum makespan T.", explanation: "Binary-searching the answer is plausible (predicate: 'can we finish in time T?'), but verifying the predicate is itself NP-hard for general k. For specific k values it's tractable, but the cleanest exact technique for n ≤ 20 is bitmask DP." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn&apos;t at the start of Phase 6"
          gist="You've gone from raw data structures to actual algorithmic technique. Same data, but you now know which lens to put in front of it."
          points={[
            { takeaway: "Spot the technique in the first read of the problem statement.", detail: "Sorted input → two pointers or binary search. Contiguous subarray + invariant → sliding window. n ≤ 20 + subset → bitmask DP. Combinatorial enumeration → backtracking. Local optimum + provable structure → greedy. The pattern recognition is the skill; the implementations are 10–30 lines each." },
            { takeaway: "Reach for XOR's self-cancellation when the problem has parity structure.", detail: "Single Number, Missing Number, Single Number III all collapse to a few lines once you see XOR as a parity accumulator. Same idea applies to deduplication, set difference (a^b), and toggling state — XOR is the operator that 'remembers what's odd.'" },
            { takeaway: "Use binary search far more aggressively than at the start of Phase 6.", detail: "It's not just 'search a sorted array.' It's 'search any monotonic predicate,' which covers 'minimize T such that a feasibility check passes' (Koko, Capacity to Ship), 'find the largest x with f(x) ≤ target' (Sqrt), 'split into k groups with min/max' (chocolate, painters). Once you see monotonicity, you have a log-factor solution." },
            { takeaway: "Backtracking is the universal \"try everything sensibly\" tool — but pruning is what makes it fast.", detail: "N-Queens is 4²⁰ without pruning, ~2700 with row + diagonal pruning. The choose/explore/unchoose template is universal; the pruning is problem-specific. Always ask 'what state can I track that lets me reject early?'" },
            { takeaway: "Greedy is high-leverage but high-risk. Verify or fall back to DP.", detail: "When greedy works (Jump Game, Activity Selection, Huffman), the code is shorter than DP and the constants are smaller. When it fails (Knapsack with weights, Longest Increasing Subsequence by length-only), it fails silently. Test small cases against brute force or DP before trusting it." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Phase 6 complete · Algorithmic Techniques</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            Eight techniques. Two pointers, sliding window, binary search, sorting, recursion, backtracking, greedy,
            and bit manipulation. You now have a vocabulary for reading a problem statement and picking the right
            lens — instead of brute-forcing your way to TLE. The next phase, Dynamic Programming, builds on
            recursion + memoization to crack problems where greedy fails and brute force is exponential.
          </p>
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>

        <div className="not-prose mt-12 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-800 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40">
          <p className="text-xs uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300 font-semibold">Up next · Phase 7</p>
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1">Dynamic Programming</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Memoization, overlapping subproblems, and the patterns that turn O(2^n) into O(n²). Coming soon.</p>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="bit-manipulation" />
    </article>
  );
}
