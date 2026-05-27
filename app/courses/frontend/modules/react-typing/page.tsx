import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "react-typing";

const CHECKPOINTS = [
  { id: "cp-props-children", title: "Typing props and children correctly" },
  { id: "cp-events-refs", title: "Event handlers and refs" },
  { id: "cp-polymorphic", title: "forwardRef and the polymorphic `as` prop" },
];

export default function ReactTypingModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 2 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Typing React — props, children, refs, events, forwardRef
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Most React-TS pain is the same five patterns asked five different ways. Once you can write them cold, every interview problem in this space turns into a 30-second answer.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          A React component is a function whose argument is &quot;props&quot; and whose return value is &quot;JSX.&quot; Typing it is just typing that function — except React has its own vocabulary for what each kind of argument looks like.
        </p>
        <p>
          You need to know five nouns: <strong>props</strong>, <strong>children</strong>, <strong>events</strong>, <strong>refs</strong>, and <strong>polymorphism</strong>. That&apos;s the whole map. Everything else is variation.
        </p>
      </section>

      <section>
        <h2>Typing props — the baseline</h2>
        <pre><code>{`type ButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

function Button({ label, disabled, onClick }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
}`}</code></pre>
        <p>
          Three notes:
        </p>
        <ul>
          <li>Use a <code>type</code>{" "}or <code>interface</code>{" "}— either is fine. <code>interface</code>{" "}is mildly preferred for props because it supports declaration merging if a library extends your component.</li>
          <li>Optional fields use <code>?</code>. The value is then <code>T | undefined</code>, so handle it (default value or guard).</li>
          <li>Do <em>not</em>{" "}type the return — let TS infer <code>React.JSX.Element</code>. Explicitly typing it is noise.</li>
        </ul>
        <Callout variant="info" title="React.FC — skip it">
          You may see <code>React.FC&lt;Props&gt;</code>. It implicitly adds <code>children</code>{" "}(or used to), breaks generic components, and serves no real purpose. The community has moved off it. Just type the props directly.
        </Callout>
      </section>

      <section>
        <h2>Children — what you actually want</h2>
        <p>
          The right type for &quot;anything React can render&quot; is <code>React.ReactNode</code>. It covers strings, numbers, elements, fragments, arrays of those, and <code>null</code>/<code>undefined</code>.
        </p>
        <pre><code>{`type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return <div><h3>{title}</h3>{children}</div>;
}`}</code></pre>
        <p>
          Or use the helper:
        </p>
        <pre><code>{`import { type PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ title: string }>;
// = { title: string; children?: React.ReactNode }`}</code></pre>
        <Callout variant="warn" title="Don't type children as `JSX.Element`">
          <code>JSX.Element</code>{" "}rejects strings, arrays, fragments, and <code>null</code>. Users of your component will hit type errors for valid React content. Always use <code>React.ReactNode</code>.
        </Callout>
      </section>

      <Checkpoint id="cp-props-children" moduleSlug={MODULE_SLUG} title="Typing props and children correctly">
        <Quiz
          kind="Quick check"
          question="Which type should `children` be if you want to accept strings, fragments, and arrays of elements?"
          options={[
            { label: "JSX.Element", explanation: "Wrong — `JSX.Element` rejects strings and arrays." },
            { label: "React.ReactNode", correct: true, explanation: "Right — `ReactNode` is the union of everything React can render." },
            { label: "any", explanation: "Wrong — you'd lose all type safety for users of the component." },
            { label: "React.Component", explanation: "Wrong — `Component` is the class type, not a children type." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Event handlers — let React infer the event</h2>
        <p>
          React ships <code>React.MouseEvent</code>, <code>React.ChangeEvent</code>, <code>React.FormEvent</code>, etc., each parameterized by the element type. The lazy version: type the <em>handler</em>{" "}with React&apos;s <code>EventHandler</code>{" "}aliases instead.
        </p>
        <pre><code>{`// Verbose — works but tedious
function Field() {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  return <input onChange={onChange} />;
}

// Better — let JSX infer the event
function Field() {
  return (
    <input onChange={(e) => console.log(e.target.value)} />
    //               ^ e is React.ChangeEvent<HTMLInputElement>
  );
}`}</code></pre>
        <p>
          When the handler is passed in as a prop, type it from the element&apos;s perspective:
        </p>
        <pre><code>{`type SubmitProps = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};`}</code></pre>
        <Callout variant="insight" title="The rule">
          Inline handlers — let TS infer the event. Prop handlers — use <code>React.FooEventHandler&lt;ElementType&gt;</code>.
        </Callout>
      </section>

      <section>
        <h2>Refs — DOM and otherwise</h2>
        <p>
          A ref to a DOM node:
        </p>
        <pre><code>{`import { useRef, useEffect } from "react";

function Input() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return <input ref={ref} />;
}`}</code></pre>
        <p>
          Two things:
        </p>
        <ul>
          <li><code>useRef&lt;T&gt;(null)</code>{" "}— the type argument is the element. The initial value is <code>null</code>{" "}because the ref is empty until React attaches it.</li>
          <li><code>ref.current</code>{" "}is <code>T | null</code>{" "}— always guard or use optional chaining.</li>
        </ul>
        <p>
          A ref to a mutable value (not a DOM node):
        </p>
        <pre><code>{`const timer = useRef<number | null>(null);
timer.current = window.setTimeout(...);`}</code></pre>
      </section>

      <Checkpoint id="cp-events-refs" moduleSlug={MODULE_SLUG} title="Event handlers and refs">
        <Quiz
          kind="Scenario"
          question="Why is the initial value of `useRef<HTMLInputElement>(null)` `null` and not `undefined`?"
          options={[
            { label: "React requires `null` specifically for DOM refs.", correct: true, explanation: "Right — React's typings expect `null` (and the runtime stores `null` for unattached refs). Passing `undefined` breaks the overload that wires it to a DOM `ref` attribute." },
            { label: "Both work identically.", explanation: "Wrong — they take different overloads of `useRef` and the second one doesn't fit DOM refs." },
            { label: "TypeScript can't represent `undefined`.", explanation: "Wrong — `undefined` is a valid TS type. The issue is React's API design, not TS." },
            { label: "`null` is faster.", explanation: "Wrong — there's no performance difference. It's a typing convention." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2><code>forwardRef</code>{" "}— letting parents attach a ref to your component</h2>
        <p>
          If a parent wants to call <code>focus()</code>{" "}on your custom <code>Input</code>, your component has to forward the ref to the underlying <code>&lt;input&gt;</code>. <code>forwardRef</code>{" "}is how you say <em>&quot;pass refs through me.&quot;</em>
        </p>
        <pre><code>{`import { forwardRef } from "react";

type InputProps = {
  placeholder?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder }, ref) => {
    return <input ref={ref} placeholder={placeholder} />;
  }
);
Input.displayName = "Input";

// Parent:
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Input ref={inputRef} placeholder="Name" />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}`}</code></pre>
        <p>
          The generics are <code>forwardRef&lt;<em>RefType</em>, <em>PropsType</em>&gt;</code>. Order matters — ref type first, props second.
        </p>
        <Callout variant="warn" title="Set displayName">
          <code>forwardRef</code>{" "}components show up as &quot;ForwardRef&quot; in React DevTools by default. Set <code>Component.displayName = &quot;Input&quot;</code>{" "}so they&apos;re identifiable. The lint rule <code>react/display-name</code>{" "}flags this.
        </Callout>
      </section>

      <section>
        <h2>The polymorphic <code>as</code>{" "}prop — &quot;render me as anything&quot;</h2>
        <p>
          Many design-system components let the caller pick the underlying element: <code>{`<Button as="a" href="/" />`}</code>{" "}vs <code>{`<Button as="button" type="submit" />`}</code>. Typing this correctly so that <code>href</code>{" "}is only legal on the anchor variant is one of the classic interview questions.
        </p>
        <pre><code>{`import { type ElementType, type ComponentPropsWithoutRef } from "react";

type ButtonOwnProps<E extends ElementType> = {
  as?: E;
  variant?: "primary" | "ghost";
};

type ButtonProps<E extends ElementType> =
  ButtonOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>>;

function Button<E extends ElementType = "button">({
  as,
  variant = "primary",
  ...rest
}: ButtonProps<E>) {
  const Tag = as ?? "button";
  return <Tag {...rest} data-variant={variant} />;
}

// Usage — TS picks the right props per element:
<Button onClick={...} />                       // button — onClick ok
<Button as="a" href="/home" />                 // anchor — href ok
<Button as="button" href="/home" />            // ❌ href not on button`}</code></pre>
        <p>
          What&apos;s happening:
        </p>
        <ul>
          <li><code>E extends ElementType</code>{" "}— a generic constrained to anything React can render as a tag (string tags like <code>&quot;a&quot;</code>, or component refs).</li>
          <li><code>ComponentPropsWithoutRef&lt;E&gt;</code>{" "}— React&apos;s helper that returns the props of the chosen element.</li>
          <li><code>Omit&lt;…, keyof ButtonOwnProps&lt;E&gt;&gt;</code>{" "}— strip props that would collide with the component&apos;s own (so the user&apos;s <code>as</code>{" "}doesn&apos;t clash with the element&apos;s native <code>as</code>{" "}attribute, if any).</li>
        </ul>
      </section>

      <Checkpoint id="cp-polymorphic" moduleSlug={MODULE_SLUG} title="forwardRef and the polymorphic `as` prop">
        <Quiz
          kind="Scenario"
          question={"With the polymorphic `Button` above, why does `<Button as='button' href='/home' />` fail to compile?"}
          options={[
            { label: "Because `Button` doesn't accept any extra props.", explanation: "Wrong — the spread of `ComponentPropsWithoutRef<E>` accepts everything the element supports." },
            { label: "Because `href` isn't a valid prop on `<button>`, and the generic resolves `E` to `'button'`, so its props don't include `href`.", correct: true, explanation: "Right — TS infers `E = 'button'` and looks up `ComponentPropsWithoutRef<'button'>`, which has no `href`. The error is on the extra prop." },
            { label: "Because polymorphic components can't accept native HTML props.", explanation: "Wrong — they specifically can, that's the whole point." },
            { label: "Because the `as` prop is incompatible with TypeScript.", explanation: "Wrong — `as` is exactly the pattern TS was designed to type." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="What's the right type to forward a ref to a custom input wrapper, and in what order?"
          options={[
            { label: "`forwardRef<InputProps, HTMLInputElement>`", explanation: "Wrong — the order is ref first, props second." },
            { label: "`forwardRef<HTMLInputElement, InputProps>`", correct: true, explanation: "Right — the first generic is the element the ref points to; the second is the component's own props." },
            { label: "`forwardRef<InputProps>`", explanation: "Wrong — `forwardRef` takes two generics, not one." },
            { label: "`forwardRef<HTMLInputElement>` (no props)", explanation: "Wrong — even if your component has no extra props, the second generic is needed (use `Record<string, never>` or `{}`)." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>Props</strong>: type with a <code>type</code>{" "}or <code>interface</code>; skip <code>React.FC</code>; let TS infer the return.</li>
          <li><strong>Children</strong>: <code>React.ReactNode</code>{" "}is the right type — not <code>JSX.Element</code>.</li>
          <li><strong>Events</strong>: inline handlers — let TS infer. Prop handlers — <code>React.FooEventHandler&lt;ElementType&gt;</code>.</li>
          <li><strong>Refs</strong>: <code>useRef&lt;T&gt;(null)</code>{" "}for DOM nodes; <code>ref.current</code>{" "}is <code>T | null</code>, always guard.</li>
          <li><strong>forwardRef</strong>{" "}order is <code>&lt;ElementType, PropsType&gt;</code>. Always set <code>displayName</code>.</li>
          <li><strong>Polymorphic <code>as</code></strong>: use a generic <code>E extends ElementType</code>{" "}and spread <code>ComponentPropsWithoutRef&lt;E&gt;</code>. TS makes wrong-element props a compile error.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Build a <code>Button</code>{" "}component that is polymorphic (<code>{`as?: "a" | "button"`}</code>), forwards a ref, and accepts the right native props per element. Verify <code>{`<Button as="a" href="/" ref={anchorRef} />`}</code>{" "}compiles and <code>{`<Button as="button" href="/" />`}</code>{" "}doesn&apos;t.</li>
          <li>Type a <code>Form</code>{" "}component with <code>{`onSubmit: React.FormEventHandler<HTMLFormElement>`}</code>{" "}and an inline <code>onChange</code>{" "}on an input — hover to confirm TS inferred the event type for you.</li>
          <li>Wrap children in a <code>Card</code>{" "}with <code>PropsWithChildren&lt;{`{ title: string }`}&gt;</code>. Pass a string, an element, and a fragment as children — all three should type-check.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why typing <code>children</code>{" "}as <code>JSX.Element</code>{" "}breaks legitimate usage, and why <code>ReactNode</code>{" "}is the right answer.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
