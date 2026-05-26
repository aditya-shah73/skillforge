import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "prototypes-classes";

const CHECKPOINTS = [
  { id: "cp-chain", title: "The prototype chain" },
  { id: "cp-new", title: "What `new` actually does" },
  { id: "cp-class", title: "`class` as sugar over prototypes" },
];

export default function PrototypesClassesModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Prototypes, classes, and what <code>new</code> actually does
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          JavaScript doesn&apos;t have classes — it has objects linked to other objects. Once you see the chain, <code>class</code>, <code>new</code>, and <code>instanceof</code> stop being magic.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Forget &quot;inheritance&quot; for a minute. JavaScript objects are <strong>linked lists of fallback pointers</strong>. Every object carries a hidden pointer (its <code>[[Prototype]]</code>, accessible via <code>Object.getPrototypeOf(obj)</code> or the legacy <code>__proto__</code>) that says &quot;if you ask me for a property I don&apos;t have, look <em>here</em>.&quot;
        </p>
        <p>
          When you read <code>obj.foo</code>, JS first checks <code>obj</code> itself. If <code>foo</code> isn&apos;t there, it follows the prototype pointer to the next object and checks there. Then the next. Then the next. The chain ends at <code>Object.prototype</code>, whose own prototype is <code>null</code>. If nothing matched along the way, you get <code>undefined</code>.
        </p>
        <p>
          That&apos;s the whole mechanism. No classes, no inheritance hierarchies — just objects pointing at other objects, with <code>JS</code>{" "}walking the chain on lookup. Everything else — <code>class</code>, <code>new</code>, <code>instanceof</code>, <code>Object.create</code> — is convenience syntax for setting up these pointers.
        </p>
      </section>

      <section>
        <h2>The formula: <code>[[Prototype]]</code> + the lookup walk</h2>
        <ol>
          <li>Every object has a hidden internal slot <code>[[Prototype]]</code>{" "}— a pointer to another object (or <code>null</code>).</li>
          <li>Property reads walk the chain: own properties first, then prototype, then its prototype, until match or <code>null</code>.</li>
          <li>Property writes are different — they create a new own property on <code>obj</code>{" "}instead of modifying the prototype (with rare exceptions for setters defined upstream).</li>
        </ol>
        <p>
          The chain is read-only for lookups; writes always land locally. This asymmetry is what makes prototype-based code safe — children don&apos;t accidentally mutate their parents.
        </p>
        <pre><code>{`const animal = { eats: true };
const rabbit = { jumps: true };

Object.setPrototypeOf(rabbit, animal); // rabbit's [[Prototype]] → animal

rabbit.jumps;   // true   — own property
rabbit.eats;    // true   — found via prototype walk
rabbit.eats = false; // creates an OWN 'eats' on rabbit, doesn't mutate animal
animal.eats;    // true still — write didn't go up the chain`}</code></pre>
        <Callout variant="warn" title="Don&apos;t use Object.setPrototypeOf in hot paths">
          <p className="m-0">It works, but it&apos;s slow — engines optimize for prototypes set at object-creation time. Use <code>Object.create(proto)</code>{" "}or a constructor function or <code>class</code>{" "}to set the prototype up front instead.</p>
        </Callout>
      </section>

      <section>
        <h2>Worked example: building the chain by hand</h2>
        <p>
          Here&apos;s the simplest pattern that demonstrates the whole system, no <code>class</code>{" "}keyword in sight:
        </p>
        <pre><code>{`// Step 1: define a "parent" object with shared methods
const animalProto = {
  describe() {
    return this.name + " eats " + this.food;
  },
};

// Step 2: make a new object linked to animalProto
const rabbit = Object.create(animalProto);
rabbit.name = "Bunny";
rabbit.food = "carrots";

rabbit.describe();              // "Bunny eats carrots"
rabbit.hasOwnProperty("name");  // true  — own property
rabbit.hasOwnProperty("describe"); // false — lives on animalProto
Object.getPrototypeOf(rabbit) === animalProto; // true`}</code></pre>
        <p>
          That&apos;s it. <code>Object.create(proto)</code>{" "}makes a new empty object whose <code>[[Prototype]]</code>{" "}is <code>proto</code>. <code>rabbit.describe()</code>{" "}finds <code>describe</code>{" "}on the prototype; <code>this</code>{" "}inside is <code>rabbit</code>{" "}(implicit binding — Rule 3 from the last module). The combination of prototype lookup + dynamic <code>this</code>{" "}gives you the same behavior &quot;classes&quot; would, with one fewer concept to learn.
        </p>

        <Quiz
          question="Predict: `const p = { v: 1 }; const c = Object.create(p); c.v = 99; console.log(p.v, c.v);`"
          kind="Predict the output"
          options={[
            { label: "99 99", explanation: "That would only happen if writes went up the chain. They don't — c.v = 99 creates an OWN property on c." },
            { label: "1 99", correct: true, explanation: "Right. Writing creates a local property on c (shadowing p.v). p.v is untouched." },
            { label: "99 1", explanation: "c.v = 99 sets the value on c, not on p." },
            { label: "1 1", explanation: "c.v was reassigned to 99, so c.v is 99 now." },
          ]}
        />
      </section>

      <section>
        <h2><code>new</code>: what it actually does, in 4 steps</h2>
        <p>
          You&apos;ve seen <code>new</code>{" "}from the <code>this</code>{" "}side already. Here&apos;s the full picture, including the prototype piece:
        </p>
        <pre><code>{`function User(name) {
  this.name = name;
}
User.prototype.greet = function () {
  return "hi " + this.name;
};

const u = new User("Ada");
u.greet(); // "hi Ada"`}</code></pre>
        <p>When you write <code>new User(&quot;Ada&quot;)</code>, here&apos;s what JS does, step by step:</p>
        <ol>
          <li>Create a fresh, empty object <code>{`{}`}</code>.</li>
          <li>Set the new object&apos;s <code>[[Prototype]]</code>{" "}to <code>User.prototype</code>.</li>
          <li>Call <code>User</code>{" "}with <code>this</code>{" "}bound to the new object (Rule 1 from the <code>this</code>{" "}module). The function body assigns <code>this.name = name</code>, which lands on the new object.</li>
          <li>Return the new object automatically (unless the constructor explicitly returns its own object — primitives returned are ignored).</li>
        </ol>
        <p>
          That&apos;s the entire mechanism. <code>u.name</code>{" "}is an own property (set by step 3). <code>u.greet</code>{" "}lives on <code>User.prototype</code>{" "}— a single function shared by every instance, found via the prototype walk (step 2&apos;s legacy).
        </p>

        <h3>Implement <code>new</code>{" "}from scratch</h3>
        <p>It&apos;s 5 lines. You should write this once to feel the mechanics:</p>
        <pre><code>{`function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);   // steps 1 + 2
  const ret = Ctor.apply(obj, args);           // step 3
  return (typeof ret === "object" && ret !== null) ? ret : obj;  // step 4
}

function User(name) { this.name = name; }
User.prototype.greet = function () { return "hi " + this.name; };

const u = myNew(User, "Ada");
u.greet(); // "hi Ada"
u instanceof User; // true`}</code></pre>
        <p>
          The trick at the end — &quot;return <code>ret</code>{" "}if it&apos;s an object, otherwise return <code>obj</code>&quot; — handles a real quirk: constructors that explicitly return an object override the new-instance behavior. (Returning primitives is silently ignored.) This is why the React docs sometimes warn against returning anything from class constructors.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-chain"
        title="The prototype chain"
        celebration="You can explain prototypes without using the word 'inheritance'. That's the milestone."
      >
        <Quiz
          question="`const a = { x: 1 }; const b = Object.create(a); console.log(b.x);` logs…"
          kind="Defend it"
          options={[
            { label: "undefined", explanation: "b has no own `x`, but the prototype walk finds it on a." },
            { label: "1", correct: true, explanation: "Right. b doesn't have x as own; the walk goes to a, which has x = 1. Found, returned." },
            { label: "TypeError", explanation: "Property access through prototypes is safe — no throw." },
            { label: "null", explanation: "Walking the chain returns the value (1), not null." },
          ]}
        />
        <Quiz
          question="If you do `b.x = 99` in the above, what does `a.x` become?"
          kind="Defend it"
          options={[
            { label: "99", explanation: "Writes don't go up the chain. b.x = 99 creates an own property on b, leaving a untouched." },
            { label: "1", correct: true, explanation: "Right. Writes are always local. The lookup found x on a for read; the write lands on b as a new own property, shadowing a.x for future reads." },
            { label: "undefined", explanation: "a.x was 1 before; b.x = 99 doesn't delete it." },
            { label: "TypeError", explanation: "Assignment through prototypes is allowed." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2><code>class</code>: it&apos;s sugar all the way down</h2>
        <p>
          The <code>class</code>{" "}keyword was added in 2015 because the constructor-function pattern was awkward and verbose. <em>Everything</em>{" "}<code>class</code>{" "}does could already be done with functions and prototypes — and that&apos;s exactly what the engine does under the hood:
        </p>
        <pre><code>{`// Modern class syntax
class User {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return "hi " + this.name;
  }
}

// What it desugars to (roughly):
function User(name) {
  this.name = name;
}
User.prototype.greet = function () {
  return "hi " + this.name;
};`}</code></pre>
        <p>
          The two snippets are nearly identical in behavior. <code>class</code>{" "}adds a few real semantic differences — they&apos;re always strict mode, methods are non-enumerable by default, you can&apos;t call them without <code>new</code>{" "}— but the underlying storage is the same prototype chain you built by hand.
        </p>

        <h3>Inheritance: <code>extends</code>{" "}and the chain</h3>
        <pre><code>{`class Animal {
  constructor(name) { this.name = name; }
  describe() { return this.name + " (animal)"; }
}

class Dog extends Animal {
  constructor(name) {
    super(name);              // call parent constructor — required before using this
    this.kind = "dog";
  }
  describe() {
    return super.describe() + " — woof";
  }
}

const d = new Dog("Rex");
d.describe();                  // "Rex (animal) — woof"
Object.getPrototypeOf(d) === Dog.prototype;                          // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype;          // true`}</code></pre>
        <p>
          <code>extends Animal</code>{" "}sets up the prototype chain so that <code>Dog.prototype</code>&apos;s prototype is <code>Animal.prototype</code>. A <code>Dog</code>{" "}instance looks like:
        </p>
        <pre><code>{`d → Dog.prototype → Animal.prototype → Object.prototype → null`}</code></pre>
        <p>
          <code>d.describe()</code>{" "}finds <code>describe</code>{" "}on <code>Dog.prototype</code>{" "}first (the override). <code>super.describe()</code>{" "}walks up one level and calls the parent version. Everything is just lookup + walk + <code>this</code>{" "}binding.
        </p>

        <Callout variant="warn" title="`super` is a special form, not a variable">
          <p className="m-0">You can&apos;t store <code>super</code>{" "}in a variable or pass it around. The engine resolves <code>super.X</code>{" "}at parse time based on where the call is lexically placed. This matters in interview snippets that ask &quot;why does this throw?&quot; — usually because someone tried to use <code>super</code>{" "}from outside its class body.</p>
        </Callout>

        <Quiz
          question="Predict: `class A { x() { return 1; } } class B extends A { x() { return super.x() + 1; } } const b = new B(); b.x();`"
          kind="Predict the output"
          options={[
            { label: "1", explanation: "B.x overrides — its body returns super.x() + 1, which is 2." },
            { label: "2", correct: true, explanation: "Right. B.x calls super.x() (which is A.x → 1) and adds 1." },
            { label: "TypeError", explanation: "super.x() is valid inside B.x — it walks one level up the prototype chain." },
            { label: "undefined", explanation: "Methods return their computed value, not undefined." },
          ]}
        />
      </section>

      <section>
        <h2><code>instanceof</code>: just a chain walk</h2>
        <p>
          <code>a instanceof B</code>{" "}is also just prototype-chain checking, dressed up:
        </p>
        <pre><code>{`function instanceOf(obj, Ctor) {
  let p = Object.getPrototypeOf(obj);
  while (p !== null) {
    if (p === Ctor.prototype) return true;
    p = Object.getPrototypeOf(p);
  }
  return false;
}`}</code></pre>
        <p>
          That&apos;s the entire definition. Walk <code>obj</code>&apos;s prototype chain. If <code>Ctor.prototype</code>{" "}appears anywhere on it, return true. The catch: if you reassign <code>Ctor.prototype</code>{" "}after creating instances, <code>instanceof</code>{" "}breaks — old instances point at the <em>old</em>{" "}prototype object, not the new one. This is a real bug in legacy code that tries to swap class methods at runtime.
        </p>

        <h3>Why React stopped recommending classes</h3>
        <p>
          React class components worked by extending <code>React.Component</code>, which uses exactly this machinery. <code>this.setState</code>, <code>this.props</code>, <code>this.state</code> — all instance properties accessed through prototype lookup. The problems weren&apos;t with the prototype mechanism itself; they were:
        </p>
        <ul>
          <li>The <code>this</code>{" "}binding gotcha (from Module 3) — event handlers had to be <code>.bind(this)</code>-ed or written as arrow class properties.</li>
          <li>Logic reuse — sharing stateful behavior between classes required HOCs or render props, both leaky and awkward.</li>
          <li>Component code got split awkwardly across lifecycle methods (data fetching in <code>componentDidMount</code>, cleanup in <code>componentWillUnmount</code>) — related logic ended up in different parts of the class.</li>
        </ul>
        <p>
          Hooks fix all three by leaning on closures (Module 2) instead of <code>this</code> (Module 3). The prototype chain is still everywhere — every array has <code>Array.prototype</code>, every <code>document</code>{" "}node has <code>HTMLElement.prototype</code>{" "}— but in app code you rarely have to think about it. <code>class</code>{" "}components still work; the team just moved the recommendation to function components for the reasons above.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-new"
        title="What `new` actually does"
        celebration="You can rebuild `new` in 5 lines. That's senior-front-end JS knowledge."
      >
        <Quiz
          question="Which of these is NOT one of the four steps `new Fn()` performs?"
          kind="Defend it"
          options={[
            { label: "Create a fresh, empty object", explanation: "It does this — step 1." },
            { label: "Set the new object's [[Prototype]] to Fn.prototype", explanation: "It does this — step 2." },
            { label: "Bind a free `super` keyword to Fn's parent", correct: true, explanation: "Right. `new` doesn't set up `super` — that's done at class declaration time, via `extends`. Plain constructor functions don't have `super`." },
            { label: "Call Fn with `this` set to the new object, and return the new object (unless Fn returns its own object)", explanation: "These are steps 3 and 4 — both happen." },
          ]}
        />
        <Quiz
          question="`function F() { return { x: 99 }; } const f = new F(); console.log(f.x);` logs…"
          kind="Defend it"
          options={[
            { label: "undefined", explanation: "F explicitly returned an object — `new` honors that, returning it instead of the fresh `this`." },
            { label: "99", correct: true, explanation: "Right. When a constructor explicitly returns an object, `new` returns that object instead of the freshly-created `this`. f is { x: 99 }." },
            { label: "TypeError", explanation: "Constructors can return objects with `new`; it's a normal escape hatch." },
            { label: "[object Object]", explanation: "f.x reads the x property, which is 99." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Variants that show up in interviews</h2>

        <h3>1. The shadowing/override pattern</h3>
        <pre><code>{`class A { speak() { return "A"; } }
class B extends A { speak() { return "B"; } }
const b = new B();
b.speak();      // "B"
A.prototype.speak.call(b); // "A" — explicit binding, bypasses the override`}</code></pre>
        <p>
          <code>b.speak()</code>{" "}finds <code>speak</code>{" "}on <code>B.prototype</code>{" "}(walk stops there). <code>A.prototype.speak.call(b)</code>{" "}explicitly grabs the parent&apos;s method and runs it with <code>b</code>{" "}as <code>this</code>. The override mechanism is just &quot;find the first match in the walk&quot; — bypass it by going to the source.
        </p>

        <h3>2. Static methods aren&apos;t on instances</h3>
        <pre><code>{`class Foo {
  static make() { return new Foo(); }
  hello() { return "hi"; }
}
Foo.make();          // works — static
const f = new Foo();
f.hello();           // works — instance method on Foo.prototype
f.make();            // TypeError — static methods live on Foo itself, not Foo.prototype`}</code></pre>
        <p>
          <code>static</code>{" "}attaches to the class (the constructor function itself), not to <code>Foo.prototype</code>. Instances don&apos;t have it in their chain. Useful for factory functions or class-level utilities — but easy to misuse if you think of them as &quot;normal methods.&quot;
        </p>

        <h3>3. Private fields (<code>#field</code>) are NOT just convention</h3>
        <pre><code>{`class Account {
  #balance = 0;
  deposit(n) { this.#balance += n; }
  read() { return this.#balance; }
}
const a = new Account();
a.deposit(50);
a.read();        // 50
a.#balance;      // SyntaxError — private fields are physically inaccessible outside the class body`}</code></pre>
        <p>
          The <code>#</code>{" "}prefix is a real privacy mechanism — enforced at the syntax level, not at runtime via convention. Closure-based privacy (the module pattern from the closures chapter) is the older alternative; <code>#field</code>{" "}is the modern in-class equivalent. Both still exist for different reasons — closures don&apos;t need a class, while <code>#field</code>{" "}plays nicely with <code>extends</code>.
        </p>

        <Quiz
          question="A useful difference between class private fields (`#x`) and closure-based privacy is…"
          kind="Quick check"
          options={[
            { label: "`#x` is faster", explanation: "Engines optimize both well; performance isn't the key differentiator." },
            { label: "`#x` is enforced by the syntax; closure privacy is enforced by scope. Both are real privacy, but `#x` plays well with `class extends` while closures don't require a class at all", correct: true, explanation: "Right. They solve the same problem in different paradigms — pick whichever fits your codebase." },
            { label: "`#x` can be accessed via Object.getOwnPropertyDescriptor", explanation: "It can't — private fields are intentionally excluded from reflection APIs." },
            { label: "Closure privacy is deprecated", explanation: "It isn't — both patterns are alive. They're complementary." },
          ]}
        />
      </section>

      <section>
        <h2>The project: implement <code>new</code>{" "}+ <code>Object.create</code>{" "}+ a chain visualizer</h2>
        <p>
          Three small builds that force you to <em>see</em>{" "}the chain. Predict the behavior of each utility before testing it.
        </p>
        <Callout variant="insight" title="How to do this project">
          <p className="mb-2">In a scratch file, no libraries:</p>
          <ol className="m-0">
            <li>Build each utility from scratch.</li>
            <li>Test against the real builtin to make sure your version behaves identically.</li>
            <li>Add the chain-visualizer at the end and run it on a few classes to see the structure.</li>
          </ol>
        </Callout>

        <h3>Part 1: <code>myNew(Ctor, ...args)</code></h3>
        <p>Reproduce <code>new</code>{" "}as a function (5 lines is the canonical implementation — yours can be longer). Match these tests:</p>
        <pre><code>{`function User(name) { this.name = name; }
User.prototype.greet = function () { return "hi " + this.name; };
const u = myNew(User, "Ada");
u.name === "Ada";              // true
u.greet() === "hi Ada";        // true
u instanceof User;             // true

function F() { return { x: 99 }; }
const f = myNew(F);
f.x === 99;                    // true (constructor returning an object overrides)`}</code></pre>

        <h3>Part 2: <code>myObjectCreate(proto)</code></h3>
        <p>Reproduce <code>Object.create</code>{" "}(its core single-argument form). Two-line implementation; trick is internalizing what it really does.</p>
        <pre><code>{`const p = { v: 1 };
const c = myObjectCreate(p);
Object.getPrototypeOf(c) === p;  // true
c.v === 1;                       // true (via prototype walk)`}</code></pre>
        <p>
          Hint: use <code>new</code>{" "}with an empty function whose prototype you set to <code>proto</code>{" "}— that&apos;s how <code>Object.create</code>{" "}was traditionally polyfilled before it became builtin.
        </p>

        <h3>Part 3: <code>printChain(obj)</code></h3>
        <p>Write a function that walks <code>obj</code>&apos;s prototype chain and logs each link&apos;s constructor name + own property names, until <code>null</code>.</p>
        <pre><code>{`printChain(new Date());
// Date     { (no own props on instance — Date's data is internal) }
// Date.prototype { getTime, getDate, ... }
// Object.prototype { toString, hasOwnProperty, ... }
// null`}</code></pre>
        <p>
          This last one is the gold — once you can <em>see</em>{" "}the chain on any object, prototypes become visible structures, not magic.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-class"
        title="`class` as sugar over prototypes"
        celebration="You can read any `class` snippet and instantly translate it to function + prototype form."
      >
        <Quiz
          question="True or false: A `class` declaration creates an entirely separate kind of object from a constructor function."
          kind="Defend it"
          options={[
            { label: "True — classes are a distinct primitive in JS", explanation: "Classes ARE just functions, with extra restrictions and conveniences. typeof MyClass === 'function'." },
            { label: "False — a class is a function with extra semantics (always strict, must be called with `new`, non-enumerable prototype methods); the underlying machinery is the same", correct: true, explanation: "Right. typeof Class === 'function'. The prototype chain is identical to what you'd build by hand. Class is sugar." },
            { label: "True — classes use private storage", explanation: "Classes can have private fields, but the class declaration itself isn't a separate primitive." },
            { label: "False, but only for ES6 classes — ES2022 classes are different", explanation: "ES2022 added features (private fields, static blocks) but the class is still a function underneath." },
          ]}
        />
        <Quiz
          question="Why does `class Foo {}` then `new Foo()` work, but `function bar() {}` then `bar.x = 1` then `new bar()` also work?"
          kind="Defend it"
          options={[
            { label: "Both classes and functions are callable with `new`; the prototype chain is set up the same way", correct: true, explanation: "Right. Any function with a `prototype` property is constructible with `new` (except arrows). Classes just enforce that you must use `new` and other syntactic rules — the runtime mechanism is identical." },
            { label: "Functions can't be used with `new`", explanation: "They can — that's the entire constructor-function pattern, which classes desugar to." },
            { label: "Classes have hidden state functions lack", explanation: "Classes have a few extra invariants (must-call-with-new, strict mode, etc.) but no hidden state." },
            { label: "Arrows work the same way", explanation: "Arrows actually DON'T work with `new` — they have no [[Construct]] internal method. Regular functions and classes do." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second interview answer</h2>
        <Callout variant="insight" title="Say it out loud">
          <p className="m-0">
            &quot;JavaScript&apos;s inheritance model is prototype-based, not class-based. Every object has a hidden <code>[[Prototype]]</code>{" "}pointer to another object. When you read a property, JS first checks the object itself, then walks up the prototype chain, stopping at the first match or returning undefined when it hits <code>null</code>. <code>new Ctor()</code>{" "}is shorthand for: create a fresh object, link its prototype to <code>Ctor.prototype</code>, call <code>Ctor</code>{" "}with <code>this</code>{" "}bound to the new object, and return the new object. <code>class</code>{" "}is syntactic sugar over that pattern — adds nice features like <code>extends</code>{" "}and private fields, but underneath it&apos;s still functions wired into prototype chains. <code>instanceof</code>{" "}is just a check for whether a given <code>.prototype</code>{" "}appears anywhere on an object&apos;s chain. React class components used this machinery, but the team moved to function components mostly because <code>this</code>{" "}binding was awkward and stateful logic was hard to share — hooks lean on closures instead of the prototype chain.&quot;
          </p>
        </Callout>
      </section>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          Module 5 is <strong>the event loop</strong>. We&apos;re leaving the static structure of JS (values, scope, prototypes) and entering the <em>dynamics</em>{" "}— how JS schedules work over time. Why does <code>Promise.resolve().then</code>{" "}run before <code>setTimeout(fn, 0)</code>? Why does React batch state updates? You&apos;re going to find out by tracing the call stack, task queue, and microtask queue by hand.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
