import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "this-binding";

const CHECKPOINTS = [
  { id: "cp-rules", title: "The four `this` binding rules" },
  { id: "cp-arrows", title: "Why arrow functions don't have `this`" },
  { id: "cp-react", title: "The React class-handler bind trap" },
];

export default function ThisBindingModule() {
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
          <code>this</code>, binding, and arrow functions
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          <code>this</code> is decided at <em>call time</em>, not at write time. Once you know the four rules, every snippet becomes a simple game of &quot;which one fired?&quot;
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Forget every &quot;<code>this</code> refers to the current object&quot; explanation you&apos;ve been given. The right mental model is this:
        </p>
        <p>
          A function is a <strong>recipe</strong>. The recipe contains the word &quot;<code>this</code>&quot; like a blank in a Mad Libs game — it&apos;s not filled in when you write the recipe. The blank only gets filled when the recipe is <em>executed</em>, and what fills it depends entirely on <em>how</em> the function was called.
        </p>
        <p>
          There are exactly <strong>four ways</strong> a function gets called, and each way fills in the blank differently. Learn the four rules, walk through every snippet in order, and you can predict <code>this</code> in any scenario.
        </p>
      </section>

      <section>
        <h2>The formula: the four binding rules, in priority order</h2>
        <p>
          When a function runs, JS resolves <code>this</code> by checking these rules <strong>top to bottom</strong> and stopping at the first match:
        </p>
        <ol>
          <li><strong>new binding</strong> — was the function called with <code>new</code>? Then <code>this</code> is the freshly-created object.</li>
          <li><strong>Explicit binding</strong> — was it called with <code>.call(ctx)</code>, <code>.apply(ctx)</code>, or is it a function previously <code>.bind(ctx)</code>-wrapped? Then <code>this</code> is <code>ctx</code>.</li>
          <li><strong>Implicit binding</strong> — was it called as a method, i.e. <code>obj.fn()</code>? Then <code>this</code> is <code>obj</code>.</li>
          <li><strong>Default binding</strong> — none of the above? Then <code>this</code> is <code>undefined</code> in strict mode (which all modules are), or the global object in sloppy mode.</li>
        </ol>
        <p>
          Plus one separate rule outside this hierarchy: <strong>arrow functions don&apos;t have their own <code>this</code></strong> at all. They inherit <code>this</code> from the surrounding lexical scope, the same way variables do. We&apos;ll come back to this.
        </p>

        <Callout variant="insight" title="The trick that simplifies everything">
          <p className="m-0">When you see a function call, look at <em>the dot to the left of the parens</em>. <code>obj.fn()</code> — there&apos;s a dot, the thing left of the dot is <code>this</code>. <code>fn()</code> — no dot, default binding (undefined in strict mode). <code>fn.call(x)</code> — explicit override, <code>this</code> is <code>x</code>. <code>new Fn()</code> — new binding, <code>this</code> is the fresh object. That&apos;s 90% of <code>this</code> questions answered in one glance.</p>
        </Callout>
      </section>

      <section>
        <h2>Rule 1: Default binding</h2>
        <pre><code>{`function show() {
  console.log(this);
}
show(); // undefined  (strict mode — which all modules and class bodies use)`}</code></pre>
        <p>
          Plain call, no dot, no <code>new</code>, no <code>.call</code>. In strict mode, <code>this</code> is <code>undefined</code>. In sloppy/old-style scripts, it would be the global object (<code>window</code> in browsers, <code>global</code> in Node) — but every modern setup runs in strict mode (modules, classes, all React/Next.js code), so default = undefined is the answer you&apos;ll need.
        </p>
        <p>
          This is the one beginners trip on most. Method ripped off its object:
        </p>
        <pre><code>{`const user = {
  name: "Aditya",
  greet() {
    console.log("hi " + this.name);
  },
};

user.greet();          // "hi Aditya"  — implicit binding (rule 3)

const fn = user.greet; // detach the method
fn();                  // TypeError: Cannot read properties of undefined (reading 'name')`}</code></pre>
        <p>
          Same recipe, different call site. <code>user.greet()</code> has a dot — implicit binding fires, <code>this</code> is <code>user</code>. <code>fn()</code> has no dot — default binding fires, <code>this</code> is <code>undefined</code>, and <code>undefined.name</code> blows up.
        </p>
      </section>

      <section>
        <h2>Rule 2: Implicit binding (the dot rule)</h2>
        <pre><code>{`const team = {
  name: "Platform",
  show() {
    console.log(this.name);
  },
};
team.show(); // "Platform"`}</code></pre>
        <p>
          When a function is called as <code>X.fn()</code>, <code>this</code> inside <code>fn</code> is <code>X</code>. Simple — until the function escapes:
        </p>
        <pre><code>{`setTimeout(team.show, 0); // undefined  — passing team.show DETACHES it`}</code></pre>
        <p>
          You passed the function value to <code>setTimeout</code>. <code>setTimeout</code> doesn&apos;t know <code>team</code> exists; later, it calls the stored function directly, no dot. Default binding fires, <code>this</code> is <code>undefined</code>, <code>this.name</code> throws.
        </p>
        <p>
          This is the source of the &quot;why does my event handler lose <code>this</code>?&quot; bug in React class components — the answer is in Rule 4 territory, but the mechanism is here.
        </p>

        <Quiz
          question="Predict: `const obj = { v: 1, get() { return this.v; } }; const f = obj.get; console.log(obj.get(), f());`"
          kind="Predict the output"
          options={[
            { label: "1 1", explanation: "Close — first call is implicit (1), but `f()` is detached. Default binding fires." },
            { label: "1 then TypeError", correct: true, explanation: "Right. `obj.get()` is implicit binding → this = obj → 1. `f()` is default binding → this = undefined → reading .v throws." },
            { label: "TypeError immediately", explanation: "`obj.get()` works fine — it has the dot." },
            { label: "1 undefined", explanation: "It throws, not returns undefined, because reading .v off undefined is a TypeError." },
          ]}
        />
      </section>

      <section>
        <h2>Rule 3: Explicit binding (<code>.call</code>, <code>.apply</code>, <code>.bind</code>)</h2>
        <p>
          Every function has built-in methods to force <code>this</code> at call time:
        </p>
        <pre><code>{`function greet(greeting) {
  return greeting + ", " + this.name;
}
const a = { name: "Ada" };
const b = { name: "Bo" };

greet.call(a, "hi");   // "hi, Ada"     — call invokes immediately, with this = a
greet.apply(b, ["yo"]); // "yo, Bo"     — apply is like call but args as array
const greetBo = greet.bind(b);
greetBo("hey");        // "hey, Bo"    — bind returns a NEW function permanently bound to b`}</code></pre>
        <p>
          <code>.call</code> and <code>.apply</code> differ only in how they pass extra args (one by one vs. as an array). <code>.bind</code> is the important one: it returns a <em>new function</em> with <code>this</code> pre-set, which is the pattern React class components needed for event handlers (more on that below).
        </p>
        <Callout variant="warn" title="`.bind` returns a new function — `this` is locked forever">
          <p className="m-0">Once you <code>.bind</code> a function, even calling the result with <code>.call</code> can&apos;t change its <code>this</code>. The bind wins. This matters for performance: doing <code>{`onClick={this.handle.bind(this)}`}</code> inside render creates a new function every render, which can defeat React.memo. We&apos;ll cover the fix in Phase 4.</p>
        </Callout>

        <h3>Why <code>.bind</code> exists at all</h3>
        <p>
          <code>.bind</code> exists because of the &quot;method detached → loses <code>this</code>&quot; problem. Here&apos;s the canonical use case:
        </p>
        <pre><code>{`const team = {
  name: "Platform",
  show() { console.log(this.name); },
};

const bound = team.show.bind(team);
setTimeout(bound, 0); // "Platform" — bind ensures this is team, even after detachment`}</code></pre>
        <p>
          You hand <code>setTimeout</code> a function that already knows what <code>this</code> should be. The detachment can&apos;t hurt it.
        </p>
      </section>

      <section>
        <h2>Rule 4: <code>new</code> binding</h2>
        <pre><code>{`function User(name) {
  this.name = name;
}
const u = new User("Ada");
console.log(u.name); // "Ada"`}</code></pre>
        <p>
          When you call a function with <code>new</code>, four things happen behind the scenes:
        </p>
        <ol>
          <li>A brand-new object is created.</li>
          <li><code>this</code> is set to that object.</li>
          <li>The function body runs (mutating the new object via <code>this</code>).</li>
          <li>The new object is returned automatically (unless the function explicitly returns its own object).</li>
        </ol>
        <p>
          We&apos;ll dissect this further in the prototypes module — for now, the relevant point is just: <code>new</code> outranks every other rule. Even <code>fn.bind(x)</code> applied first <em>cannot</em> override <code>new</code>.
        </p>

        <Quiz
          question="Predict: `function F() { this.v = 1; } const b = F.bind({ v: 99 }); const x = new b(); console.log(x.v);`"
          kind="Predict the output"
          options={[
            { label: "99", explanation: "That would be true if `.bind` won — but `new` outranks `.bind`. The new object's `this` is used, not the bound one." },
            { label: "1", correct: true, explanation: "Right. `new b()` ignores bind's context, creates a fresh object, sets `this.v = 1` on it, and returns it." },
            { label: "undefined", explanation: "`new` ensures `this.v = 1` runs on the fresh object — the property is set." },
            { label: "TypeError", explanation: "Bound functions can be called with `new`; they just ignore the bind in that case." },
          ]}
        />
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-rules"
        title="The four `this` binding rules"
        celebration="You have the priority order. Half the JS interview tricks are now decoded."
      >
        <Quiz
          question="`const o = { x: 1, get() { return this.x; } }; o.get.call({ x: 99 });` returns…"
          kind="Defend it"
          options={[
            { label: "1", explanation: "That would be implicit binding — but `.call(...)` is explicit binding, which overrides implicit." },
            { label: "99", correct: true, explanation: "Right. Explicit binding (Rule 2) overrides implicit binding (Rule 3). this = {x:99}, so this.x = 99." },
            { label: "undefined", explanation: ".call sets this explicitly to {x:99}, which has the property." },
            { label: "TypeError", explanation: "Nothing here throws." },
          ]}
        />
        <Quiz
          question="In strict mode, `function f() { return this; } f();` returns…"
          kind="Defend it"
          options={[
            { label: "the global object", explanation: "That's the sloppy-mode answer. Strict mode (all modules and class bodies) returns undefined." },
            { label: "undefined", correct: true, explanation: "Right. Default binding in strict mode is undefined. Module code is always strict." },
            { label: "the function itself", explanation: "`this` is not the function — `arguments.callee` was a now-deprecated way to get the function." },
            { label: "null", explanation: "Default binding produces undefined, not null." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Arrow functions: the exception that swallows the rules</h2>
        <p>
          Arrow functions <strong>do not have their own <code>this</code></strong>. When you write <code>=&gt;</code>, the function&apos;s <code>this</code> is whatever <code>this</code> was in the surrounding lexical scope at the moment the arrow was created. None of the four rules apply.
        </p>
        <pre><code>{`const obj = {
  v: 1,
  arrow: () => this.v,        // 'this' captured from MODULE scope, not obj
  method() {
    return this.v;            // implicit binding works here
  },
  delayed() {
    setTimeout(() => {
      console.log(this.v);    // 'this' captured from method's lexical scope
    }, 0);                    // → logs 1, because method's 'this' is obj
  },
};

obj.method();                 // 1
obj.arrow();                  // undefined  (or TypeError in strict mode)
obj.delayed();                // 1`}</code></pre>
        <p>
          <code>arrow</code> was created in module scope, where <code>this</code> is <code>undefined</code>. The dot before the call doesn&apos;t change that — arrows ignore the call-site rules. <code>method</code>, written as a regular function, follows implicit binding.
        </p>
        <p>
          <code>delayed</code> is the elegant case: the outer method has <code>this === obj</code>, and the inner arrow inherits that. No <code>.bind</code> needed, no <code>const self = this</code> hack. This is why arrow functions in React event handlers <em>just work</em>:
        </p>
        <pre><code>{`class Button extends React.Component {
  state = { count: 0 };

  // arrow class property — 'this' captured at class instantiation, always the component
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>;
  }
}`}</code></pre>
        <p>
          The arrow form removes the need to call <code>.bind(this)</code> in the constructor — which is exactly the pattern React class components needed to ship for years before this syntax existed. Function components dodge the problem entirely (no <code>this</code>{" "}to speak of), which is one of the cleanest wins of the hooks era.
        </p>

        <Callout variant="warn" title="Arrow functions also can&apos;t be called with `new`">
          <p className="m-0">Arrows have no <code>this</code> and no <code>prototype</code>, which means <code>new arrowFn()</code> throws a TypeError. If you&apos;re writing a constructor (or a class — which uses normal functions internally), don&apos;t use an arrow.</p>
        </Callout>

        <Quiz
          question="`const obj = { v: 1, fn() { return [1].map(() => this.v); } }; obj.fn();` returns…"
          kind="Predict the output"
          options={[
            { label: "[undefined]", explanation: "That would be true if the arrow had its own `this`. But arrows inherit from the enclosing scope — `fn`, which has this = obj." },
            { label: "[1]", correct: true, explanation: "Right. The arrow inherits `this` from `fn`'s scope. `fn` was called with implicit binding (obj.fn()), so this = obj, this.v = 1." },
            { label: "TypeError", explanation: "Nothing throws — the arrow's lexical `this` is obj." },
            { label: "[null]", explanation: "this is obj, not null. v = 1." },
          ]}
        />
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-arrows"
        title="Why arrow functions don't have `this`"
        celebration="The arrow vs. function decision is now a tool — not a guess."
      >
        <Quiz
          question="An arrow function inside a method always inherits `this` from…"
          kind="Defend it"
          options={[
            { label: "the global object", explanation: "Only if the enclosing scope happened to be global. The arrow takes whatever the enclosing scope had." },
            { label: "the enclosing lexical scope at the moment the arrow was created", correct: true, explanation: "Right. Arrows have no `this` of their own — they reach outward to the nearest enclosing function-or-class scope." },
            { label: "the call site (whoever invokes it)", explanation: "That's normal-function behavior. Arrows ignore the call site for `this`." },
            { label: "the prototype of the object", explanation: "Prototypes are unrelated to `this` binding." },
          ]}
        />
        <Quiz
          question="Why does this break? `class C { x = 1; handle() { setTimeout(function () { console.log(this.x); }, 0); } }` (and a new instance calls c.handle())"
          kind="Defend it"
          options={[
            { label: "Class properties are private", explanation: "`x = 1` is a regular field, not private. The bug is about `this`." },
            { label: "The inner function is called by setTimeout with no explicit `this`, so default binding fires and `this` is undefined", correct: true, explanation: "Right. The inner function is a regular function, not an arrow. setTimeout calls it bare → default binding → this is undefined → this.x throws." },
            { label: "setTimeout strips the `this`", explanation: "setTimeout doesn't strip anything — it just calls the function bare, which IS the issue. Default binding does the rest." },
            { label: "Classes don't work with setTimeout", explanation: "They do — you just need an arrow or .bind(this) for the inner function." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Variants that show up in interviews</h2>

        <h3>1. The <code>const self = this</code> pattern (and why it&apos;s dead)</h3>
        <pre><code>{`const obj = {
  name: "team",
  show() {
    const self = this;
    setTimeout(function () {
      console.log(self.name); // works — closes over self, not this
    }, 0);
  },
};`}</code></pre>
        <p>
          This was the workaround before arrows. Save <code>this</code> into a regular variable; the inner function closes over the variable, sidestepping the rebinding. You should never write this in new code — use an arrow — but you&apos;ll see it constantly in pre-2015 JS.
        </p>

        <h3>2. Methods on the prototype, called via instance</h3>
        <pre><code>{`class Counter {
  constructor() { this.n = 0; }
  inc() { this.n++; }
}
const c = new Counter();
c.inc();      // works — implicit binding: this = c
const inc = c.inc;
inc();        // TypeError — detached, default binding, this = undefined`}</code></pre>
        <p>
          The same detachment bug as before, just inside a class. The fix is either an arrow class property (<code>inc = () =&gt; {`{ this.n++; }`}</code>) or <code>.bind(this)</code> in the constructor. Function components sidestep this entirely — there&apos;s no <code>this</code>{" "}in a function component.
        </p>

        <h3>3. Event handlers in HTML strings (legacy bug)</h3>
        <pre><code>{`button.onclick = function () {
  console.log(this); // the button element — DOM event handlers bind 'this' to the element
};
button.onclick = () => {
  console.log(this); // module scope (probably undefined) — arrow doesn't bind!
};`}</code></pre>
        <p>
          DOM APIs implicitly call event handlers with the element as <code>this</code>. Arrow functions don&apos;t take that binding. This is a real interview gotcha for &quot;why didn&apos;t my event handler see <code>this</code> as the button?&quot;
        </p>

        <Quiz
          question="`button.addEventListener('click', () => console.log(this));` — inside a module, what does this log on click?"
          kind="Quick check"
          options={[
            { label: "the button", explanation: "That's what a normal function would log — DOM events bind `this` to the target. Arrows don't take that binding." },
            { label: "undefined (the module-scope `this`)", correct: true, explanation: "Right. Arrows inherit lexically — and a module's top-level `this` is undefined." },
            { label: "window", explanation: "Modules are strict mode; module-scope `this` is undefined, not window." },
            { label: "the document", explanation: "Even DOM-bound `this` wouldn't be document — and arrows don't take DOM binding anyway." },
          ]}
        />
      </section>

      <section>
        <h2>The project: predict <code>this</code> in 10 snippets</h2>
        <p>
          For each of the snippets below, do the same thing: <em>walk the four rules in priority order</em>, name which one fired, then predict <code>this</code>. Run only after predicting. Track which ones you missed — that&apos;s the corner of the rule-set you don&apos;t own yet.
        </p>
        <Callout variant="insight" title="The walk-through procedure">
          <p className="mb-2">For every snippet, check the rules <em>in order</em>:</p>
          <ol className="m-0">
            <li>Is the call <code>new fn()</code>? <strong>new binding</strong> — this is the fresh object.</li>
            <li>Is it <code>fn.call(x)</code>, <code>fn.apply(x, ...)</code>, or is <code>fn</code> a bound function? <strong>Explicit binding</strong> — this is x.</li>
            <li>Is it <code>X.fn()</code> (dot to the left)? <strong>Implicit binding</strong> — this is X.</li>
            <li>None of the above? <strong>Default binding</strong> — this is undefined (strict mode).</li>
            <li>Arrow override: if <code>fn</code> is an arrow, skip all the above and read <code>this</code> from the surrounding lexical scope.</li>
          </ol>
        </Callout>
        <p>The 10 snippets:</p>
        <ol>
          <li><code>{`function f() { return this; } f();`}</code></li>
          <li><code>{`const o = { v: 1, f() { return this.v; } }; o.f();`}</code></li>
          <li><code>{`const o = { v: 1, f() { return this.v; } }; const g = o.f; g();`}</code></li>
          <li><code>{`function f() { return this.v; } f.call({ v: 7 });`}</code></li>
          <li><code>{`function F() { this.v = 5; } const x = new F(); x.v;`}</code></li>
          <li><code>{`const o = { v: 1, f: () => this }; o.f();`}</code></li>
          <li><code>{`const o = { v: 1, f() { return () => this.v; } }; o.f()();`}</code></li>
          <li><code>{`const f = function () { return this; }.bind({ v: 9 }); f.call({ v: 0 });`}</code></li>
          <li><code>{`class C { v = 1; f() { return [1].map(function () { return this; }); } } new C().f();`}</code></li>
          <li><code>{`class C { v = 1; f() { return [1].map(() => this.v); } } new C().f();`}</code></li>
        </ol>
        <p>
          Predict each, then run them in a module (set <code>&quot;type&quot;: &quot;module&quot;</code> in <code>package.json</code> or use a <code>.mjs</code> file — these answers assume strict mode). The ones you predict wrong are the most valuable practice; trace the call style, name the rule that fires, see where your mental model needs reinforcement.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-react"
        title="The React class-handler bind trap"
        celebration="You can read class component code without flinching now."
      >
        <Quiz
          question="In a React class component, why was `this.handleClick = this.handleClick.bind(this)` required in the constructor before arrow class properties existed?"
          kind="Defend it"
          options={[
            { label: "React requires methods to be bound", explanation: "React doesn't care — JavaScript does. The issue is `this` binding semantics." },
            { label: "When React calls the handler (e.g. button.onClick = this.handleClick), the method is detached from its instance, so default binding fires and `this` becomes undefined", correct: true, explanation: "Right. React stores the function reference and later calls it bare. Without bind, default binding takes over → this is undefined → this.setState crashes." },
            { label: "`.bind` is faster than implicit binding", explanation: "Speed isn't the issue; correctness is." },
            { label: "The handler runs in a Web Worker", explanation: "It doesn't — handlers run on the main thread in the component's lifecycle." },
          ]}
        />
        <Quiz
          question="In modern React, why don't function components have this binding problem?"
          kind="Defend it"
          options={[
            { label: "React polyfills `this`", explanation: "React doesn't polyfill it — function components simply don't use `this`." },
            { label: "Function components don't reference `this` at all — they access state and props through closures over hook returns and parameters", correct: true, explanation: "Right. Closures handle what `this` used to handle. There's nothing to bind because nothing reads `this`." },
            { label: "Hooks bind `this` automatically", explanation: "There's no `this` to bind — hooks work on closures, not method dispatch." },
            { label: "Arrow functions are auto-injected", explanation: "Function components are written as regular or arrow functions — neither needs `this`." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second interview answer</h2>
        <Callout variant="insight" title="Say it out loud">
          <p className="m-0">
            &quot;<code>this</code> is decided at call time, not at write time, by one of four rules in priority order. If the function is called with <code>new</code>, <code>this</code> is the fresh instance. If it&apos;s called with <code>.call</code>, <code>.apply</code>, or it&apos;s a bound function, <code>this</code> is whatever was passed to those. If it&apos;s called as a method (<code>obj.fn()</code>), <code>this</code> is the object before the dot. Otherwise, default binding fires and <code>this</code> is undefined in strict mode. Arrow functions are the exception — they have no <code>this</code> of their own and inherit it lexically from the enclosing scope, the same way variables do. That&apos;s why arrow class properties replaced manual <code>.bind(this)</code> in React class components, and why function components sidestep the whole problem — they never read <code>this</code> at all.&quot;
          </p>
        </Callout>
      </section>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          Module 4 is <strong>prototypes and classes</strong>. With <code>this</code> and closures both internalized, you can finally take apart what <code>class</code>{" "}is actually doing — it&apos;s sugar over the prototype chain, which is sugar over plain objects with <code>__proto__</code>{" "}links. Implementing <code>new</code>{" "}by hand falls out as a 5-line exercise once you&apos;ve done these three modules.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
