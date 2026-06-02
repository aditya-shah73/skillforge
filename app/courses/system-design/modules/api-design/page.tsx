import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "rest", title: "REST done right" },
  { id: "contracts", title: "Pagination, idempotency, errors" },
  { id: "protocols", title: "REST vs gRPC vs GraphQL" },
];

const idempotencyFlow = `sequenceDiagram
  participant C as Client
  participant S as Server
  participant K as Idempotency store
  C->>S: POST /payments<br/>Idempotency-Key: abc-123
  S->>K: lookup(abc-123)
  K-->>S: miss
  S->>S: process payment
  S->>K: store(abc-123, response)
  S-->>C: 201 Created
  Note over C,S: Network blip — client retries
  C->>S: POST /payments<br/>Idempotency-Key: abc-123
  S->>K: lookup(abc-123)
  K-->>S: hit (cached response)
  S-->>C: 201 Created (same response)`;

export default function Page() {
  const mod = getModuleBySlug("api-design")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="api-design" />
        <ModuleProgress moduleSlug="api-design" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 p-6 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-green-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">📐</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          The senior version of REST. Not &quot;use the right HTTP verb&quot;, that&apos;s table stakes, but the contracts that make APIs survive scale: versioning, pagination, idempotency, and error shapes that don&apos;t lie. Plus the honest tradeoffs between REST, gRPC, and GraphQL.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>HTTP verb semantics that actually matter (safe vs idempotent vs neither)</li>
          <li>The status codes you&apos;ll defend in code review (and the 404-vs-403 judgment call)</li>
          <li>Cursor pagination, idempotency keys, structured error contracts, the production trio</li>
          <li>When gRPC earns its complexity and when GraphQL is a footgun</li>
        </ul>
      </section>

      <section>
        <h2>Most APIs aren&apos;t REST. They&apos;re HTTP-flavored RPC.</h2>
        <p>
          Look at any random &quot;REST API&quot; in production. <code>POST /createUser</code>. <code>GET /getUserById?id=42</code>. <code>POST /processPayment</code>. That&apos;s not REST, those are remote procedure calls dressed up in HTTP. They work fine, but the day you need pagination, retries, or versioning, the absence of REST&apos;s constraints starts to bite.
        </p>
        <p>
          REST gives you <strong>resources</strong>{" "}as the noun (<code>/users/42</code>, <code>/payments/abc-123</code>) and HTTP <strong>verbs</strong>{" "}as the action (<code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>DELETE</code>, <code>PATCH</code>). The verbs aren&apos;t arbitrary, they carry semantic guarantees that proxies, browsers, and clients rely on. Get those wrong and retries silently corrupt your data.
        </p>
      </section>

      <Checkpoint moduleSlug="api-design" id="rest" title="Part 1 · REST done right" xp={25}>
        <h2>The HTTP verb contract</h2>
        <p>
          Every HTTP verb has two properties that matter for distributed systems: <strong>safe</strong> (no side effects) and <strong>idempotent</strong> (calling it N times has the same effect as calling it once). These aren&apos;t suggestions, load balancers, browser caches, and retry middleware act on them.
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Verb</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Safe?</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Idempotent?</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Typical use</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>GET</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Read a resource</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>HEAD</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Read just the headers</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>OPTIONS</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Discover allowed verbs / CORS preflight</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>POST</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Create, or non-idempotent action</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>PUT</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Replace a resource entirely</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>DELETE</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Remove a resource</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>PATCH</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Usually no</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Partial update</td></tr>
            </tbody>
          </table>
        </div>

        <p>
          The non-obvious one is <code>PUT</code>. <code>PUT /users/42</code> with the same body twice should leave the resource in the same state, that&apos;s idempotency. <code>POST /users</code> creates a new resource each time, that&apos;s why retrying a flaky <code>POST</code> can give you two charges, two users, two of whatever. The fix isn&apos;t &quot;don&apos;t retry&quot;, it&apos;s idempotency keys, which we&apos;ll cover in Part 2.
        </p>
        <p>
          <code>PATCH</code> is &quot;usually not idempotent&quot; because it depends on what your patch does. <code>PATCH {`{"name": "Alice"}`}</code> is idempotent. <code>PATCH {`{"counter": "+1"}`}</code> is not, applying it twice double-increments. The verb doesn&apos;t enforce idempotency for you; it&apos;s just labeling.
        </p>

        <Callout variant="warn" title="The retry trap nobody warns you about">
          <p className="m-0">A misbehaving load balancer or service mesh will retry idempotent requests on transient failures, that&apos;s the point of marking them idempotent. If you implement <code>DELETE</code> non-idempotently (e.g., it returns 404 the second time, or it does extra cleanup), retries will surface bugs that pass single-call tests. Idempotency for verbs labeled idempotent is a contract, not a hint.</p>
        </Callout>

        <h3>Status codes: the ones worth knowing cold</h3>
        <p>
          You don&apos;t need to memorize 50 status codes. You need a precise mental model of the dozen that show up in real APIs. The categories matter, 2xx is success, 3xx is redirect, 4xx is &quot;you screwed up,&quot; 5xx is &quot;we screwed up.&quot;
        </p>

        <ul>
          <li><strong>200 OK</strong>, success, response body has the result.</li>
          <li><strong>201 Created</strong>, resource created. Include a <code>Location</code> header pointing at it.</li>
          <li><strong>202 Accepted</strong>, accepted for async processing; not done yet. Include a way to check status.</li>
          <li><strong>204 No Content</strong>, success, no response body. Common for <code>DELETE</code>.</li>
          <li><strong>400 Bad Request</strong>, request is malformed (bad JSON, missing required field).</li>
          <li><strong>401 Unauthorized</strong>, you didn&apos;t prove who you are. Authentication failed or missing.</li>
          <li><strong>403 Forbidden</strong>, we know who you are, you&apos;re not allowed to do this.</li>
          <li><strong>404 Not Found</strong>, the resource doesn&apos;t exist (or we&apos;re hiding it from you, see callout).</li>
          <li><strong>409 Conflict</strong>, your request conflicts with current state (e.g., version mismatch, duplicate).</li>
          <li><strong>422 Unprocessable Entity</strong>, request was well-formed but semantically invalid (validation failed).</li>
          <li><strong>429 Too Many Requests</strong>, you&apos;re rate-limited. Include a <code>Retry-After</code> header.</li>
          <li><strong>500 Internal Server Error</strong>, something on our side blew up. Generic catch-all.</li>
          <li><strong>502 Bad Gateway</strong>, we proxied to something downstream and it failed.</li>
          <li><strong>503 Service Unavailable</strong>, we&apos;re overloaded or in maintenance. Often temporary.</li>
          <li><strong>504 Gateway Timeout</strong>, downstream took too long.</li>
        </ul>

        <Callout variant="insight" title="The 404 vs 403 judgment call">
          <p className="m-0">Resource <code>/users/42</code> exists, but you&apos;re not allowed to see it, what do you return? The textbook answer is 403. The security-conscious answer is 404, because 403 leaks the information that user 42 exists. GitHub famously returns 404 for private repos to authenticated non-collaborators. Pick one rule and apply it consistently, flipping between them is what leaks information.</p>
        </Callout>

        <h3>400 vs 422: the validation distinction</h3>
        <p>
          A common code-review fight: when do you use 400, when do you use 422? The cleanest reading: <strong>400 is &quot;I can&apos;t even parse this&quot;</strong> (malformed JSON, missing <code>Content-Type</code>, syntactically broken). <strong>422 is &quot;I parsed it fine but the values are wrong&quot;</strong> (email is missing the @, age is negative, foreign key doesn&apos;t exist). 422 lets your client reliably tell &quot;the user typed something wrong&quot; from &quot;our serializer is broken.&quot;
        </p>

        <h3>Versioning: not optional, just postponed</h3>
        <p>
          Every public API gets versioned eventually. The question is whether you build it in from day one or retrofit it during a breaking change later, and retrofitting is always more painful. Three common approaches:
        </p>
        <ul>
          <li><strong>URI versioning:</strong> <code>/v1/users</code>, <code>/v2/users</code>. Most common. Easy to route, easy to debug, painfully visible to clients. Stripe and most public APIs use this.</li>
          <li><strong>Header versioning:</strong> <code>API-Version: 2</code> or <code>Accept: application/vnd.api+json;version=2</code>. Clean URIs but harder to debug (you can&apos;t just paste a URL and try it). Used by GitHub, AWS.</li>
          <li><strong>Date-based versioning:</strong> <code>API-Version: 2024-11-15</code>. Stripe&apos;s actual approach (under the URI <code>/v1/</code>). Each request pins a date; the server runs that date&apos;s schema. Adds complexity but lets you ship breaking changes weekly.</li>
        </ul>
        <p>
          What you don&apos;t want is the &quot;version in the body&quot; pattern (<code>{`{"version": 2, "data": ...}`}</code>), it forces every request to be parsed before it can be routed. Pick something the gateway can route on without reading the body.
        </p>

        <Callout variant="info" title="Stripe's date-based approach is genuinely clever">
          <p className="m-0">Every request pins to an API version date. The server has versioned transformers between schemas, so a 2018 request gets routed through a chain of upgraders to today&apos;s internal format and back. It means Stripe can deprecate old shapes on a long timeline without breaking any client that pinned a date, clients explicitly opt into newer behavior by bumping the date. Heavy machinery but the right answer for an API that&apos;s been live for 15 years.</p>
        </Callout>

        <Quiz
          question="Your team ships a new endpoint: POST /users/42/promote. The body is empty. The first deploy works fine; the second deploy creates duplicate promotion records when a load balancer retries on a 5xx. What's the root cause?"
          options={[
            { label: "POST is not idempotent. The retry created a second promotion. Either give the endpoint an idempotency key or rebuild it as PUT /users/42/role with the desired state in the body.", correct: true, explanation: "Right. POST has no idempotency contract, retries are unsafe by design. The fix is either explicit idempotency keys (Part 2) or moving to a verb whose contract matches: PUT /users/42/role with body {role: 'manager'} is idempotent because applying it twice leaves the user as a manager either way." },
            { label: "5xx errors should never trigger retries. The fix is to disable retries.", explanation: "Disabling retries is throwing away resilience for a verb-choice problem. The retry behavior is correct; the verb is wrong." },
            { label: "POST should never have an empty body. Add a request ID to the body.", explanation: "An ID in the body is roughly the right shape but the wrong place, it should be a header (Idempotency-Key) so the gateway can dedupe before hitting the handler." },
            { label: "Use 202 Accepted instead of 200 to indicate retries are safe.", explanation: "Status code doesn't grant idempotency. 202 says 'I'll process it later', it doesn't make the operation safe to retry." },
          ]}
          hint="Which HTTP verbs carry an idempotency guarantee, and which don't?"
          xp={7}
        />

        <Quiz
          question="A frontend developer files a bug: 'The API returns 500 when I send a malformed JSON body. That looks like a server bug.' What's the right server fix?"
          options={[
            { label: "Return 400 Bad Request, the client sent something the server couldn't parse. 500 is for server-side faults; 400 is for 'your request is malformed.'", correct: true, explanation: "Right. 4xx is 'client problem,' 5xx is 'server problem.' Malformed JSON is the client's problem, so the server should return 400, frequently 400 with a structured error explaining which field broke the parse." },
            { label: "Return 422 Unprocessable Entity, semantic validation failed.", explanation: "422 is for well-formed-but-wrong (email missing @, age negative). Malformed JSON didn't even parse, that's 400 territory." },
            { label: "Keep returning 500, the parser threw an exception, that's a server-side fault.", explanation: "An unhandled exception is a server bug, but the failure class is 'client sent garbage,' not 'server is broken.' Catching the parse error and returning 400 is the contract." },
            { label: "Return 200 with an error object in the body so retries don't trigger.", explanation: "Lying about success in the status code breaks every middleware that watches for 2xx vs 4xx. Status codes are the API; don't smuggle errors through 200." },
          ]}
          hint="Whose fault is malformed JSON?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="REST gives you resources as nouns and verbs as actions, with safety/idempotency contracts that retry middleware actually relies on. Status codes and versioning are part of the contract too."
          points={[
            { takeaway: "Idempotency is per-verb and per-implementation", detail: "GET, PUT, DELETE are idempotent by spec. POST is not. PATCH depends on what your patch does. Retry safety lives at this layer." },
            { takeaway: "Know the dozen status codes that appear in real APIs", detail: "200/201/204 success. 400/401/403/404/409/422/429 client. 500/502/503/504 server. The 404-vs-403 call is a security-vs-clarity tradeoff, pick one rule and stick to it." },
            { takeaway: "400 vs 422 separates parse failure from validation failure", detail: "400 = couldn't parse. 422 = parsed but invalid. Lets clients distinguish 'user typed wrong' from 'serializer is broken.'" },
            { takeaway: "Pick a versioning strategy on day one", detail: "URI versioning (/v1/) is simplest. Header or date-based versioning is cleaner but harder to debug. Body-based versioning is the wrong answer because the gateway can't route on it." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="api-design" id="contracts" title="Part 2 · Pagination, idempotency, errors" xp={30}>
        <h2>Three contracts that show up in every serious API</h2>
        <p>
          Verbs and status codes are the surface. The contracts that decide whether your API survives at scale are pagination, idempotency, and error shapes. Get any of these wrong and the bugs are subtle, late, and expensive.
        </p>

        <h3>Offset pagination dies at scale</h3>
        <p>
          The naive paginated query, <code>SELECT ... ORDER BY id LIMIT 20 OFFSET 10000</code>, has a quiet performance trap. The database has to walk past the first 10,000 rows to start your page. At <code>OFFSET 1000000</code>, your &quot;fast list endpoint&quot; takes seconds. Worse, if rows are inserted while a user paginates, page 5 might re-show items from page 4, or skip items entirely.
        </p>
        <p>
          The replacement is <strong>cursor pagination</strong>. The server returns an opaque cursor (a base64-encoded string the client doesn&apos;t parse), and the client passes it back to get the next page. Internally the cursor encodes the &quot;last seen&quot; sort key, but the client never knows that, so the server can change it without breaking clients.
        </p>

        <CodeBlock lang="plain" caption="Cursor pagination: the wire format">{`GET /v1/orders?limit=20

{
  "data": [ ... 20 orders ... ],
  "page_info": {
    "has_next": true,
    "next_cursor": "eyJpZCI6MTIzLCJjcmVhdGVkX2F0IjoiMjAyNi0wNC0yOSJ9"
  }
}

GET /v1/orders?limit=20&cursor=eyJpZCI6MTIzLCJjcmVhdGVkX2F0IjoiMjAyNi0wNC0yOSJ9

{
  "data": [ ... next 20 ... ],
  "page_info": {
    "has_next": false,
    "next_cursor": null
  }
}`}</CodeBlock>

        <p>
          The contract is: the cursor is opaque (clients must not parse it), pagination is forward-only unless you explicitly support backward, and ordering is stable (typically by an immutable field plus a tie-breaker like <code>(created_at, id)</code>). If you sort by <code>updated_at</code>, rows can appear and disappear as they&apos;re modified, that&apos;s a data consistency bug that looks like a pagination bug.
        </p>

        <Callout variant="warn" title="When offset pagination is fine">
          <p className="m-0">Cursor pagination is the production answer, but offset pagination is genuinely fine for small, bounded data, admin tools, internal dashboards, anything that won&apos;t cross a few thousand rows. The cost of cursor pagination is real (more complex client code, no &quot;jump to page 47&quot;). Don&apos;t cargo-cult cursors onto a 200-row admin list.</p>
        </Callout>

        <h3>Idempotency keys: making POST safe to retry</h3>
        <p>
          POST is non-idempotent by spec, but real systems must retry POST, networks fail mid-request all the time, and the client doesn&apos;t know whether the server saw it. The standard pattern, popularized by Stripe: the client generates a unique <strong>idempotency key</strong> (a UUID, typically) and sends it as a header. The server stores the response keyed by that header. If the same key arrives again, the server returns the cached response without re-running the operation.
        </p>

        <Mermaid chart={idempotencyFlow} />

        <p>The contract has four parts:</p>
        <ol>
          <li><strong>Client-generated key.</strong>{" "}The client creates the UUID before sending. If the request fails, the client retries with the same key. The server never generates the key, that defeats the point.</li>
          <li><strong>Server-side storage with TTL.</strong>{" "}Store <code>(key, request_hash, response)</code>. TTL is typically 24h to a few days, long enough that any reasonable retry window is covered.</li>
          <li><strong>Validate the request hash.</strong>{" "}If the same key arrives with a <em>different</em>{" "}body, that&apos;s a client bug, return 422 with &quot;idempotency key reused with different request.&quot; Don&apos;t silently overwrite.</li>
          <li><strong>Return the cached response.</strong>{" "}Same status code, same body. The client can&apos;t tell whether the original or the retry was the &quot;real&quot; call, and that&apos;s the point.</li>
        </ol>

        <CodeBlock lang="java" caption="Idempotency middleware in Spring (sketch)">{`@Component
public class IdempotencyFilter extends OncePerRequestFilter {

  private final IdempotencyStore store; // typically Redis-backed

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    String key = req.getHeader("Idempotency-Key");
    if (key == null || !"POST".equalsIgnoreCase(req.getMethod())) {
      chain.doFilter(req, res);
      return;
    }

    // Hash the request body to detect key reuse with a different payload.
    CachedBodyHttpServletRequest cached = new CachedBodyHttpServletRequest(req);
    String bodyHash = sha256(cached.getBody());

    Optional<StoredResponse> hit = store.get(key);
    if (hit.isPresent()) {
      StoredResponse stored = hit.get();
      if (!stored.bodyHash().equals(bodyHash)) {
        res.setStatus(422);
        res.getWriter().write("{\\"code\\":\\"idempotency_key_reused\\"," +
                              "\\"message\\":\\"Same key, different request body\\"}");
        return;
      }
      // Replay the original response.
      res.setStatus(stored.status());
      res.getWriter().write(stored.body());
      return;
    }

    // Capture the response so we can store it.
    ContentCachingResponseWrapper wrapper = new ContentCachingResponseWrapper(res);
    chain.doFilter(cached, wrapper);

    // Only cache 2xx responses — don't cache 5xx, the client should retry those.
    if (wrapper.getStatus() >= 200 && wrapper.getStatus() < 300) {
      store.put(key, new StoredResponse(
          wrapper.getStatus(),
          new String(wrapper.getContentAsByteArray()),
          bodyHash
      ), Duration.ofHours(24));
    }
    wrapper.copyBodyToResponse();
  }
}`}</CodeBlock>

        <Callout variant="spring" title="Where this lives in a real Spring app">
          <p className="m-0">This is a servlet filter, not a controller advice, it has to capture the response body before it goes out, which means wrapping the response. <code>ContentCachingResponseWrapper</code> is Spring&apos;s built-in wrapper for exactly this. Back the store with Redis (atomic SETNX + TTL) so the dedup works across all gateway pods. Idempotency is covered in detail in the dedicated module (Phase 4), this is the API-contract view.</p>
        </Callout>

        <h3>Error responses: structure, not strings</h3>
        <p>
          The bad pattern: <code>{`{"error": "User already exists"}`}</code>. The client tries to do something useful and ends up string-matching on the message. You change the wording for an i18n update; clients break.
        </p>
        <p>
          The good pattern: a structured error envelope with a stable machine-readable code, a human message, and optional field-level details.
        </p>

        <CodeBlock lang="plain" caption="A structured error response">{`{
  "error": {
    "code": "validation_failed",
    "message": "One or more fields failed validation.",
    "request_id": "req_a1b2c3d4",
    "details": [
      { "field": "email", "code": "invalid_format", "message": "Must be a valid email address." },
      { "field": "age", "code": "out_of_range", "message": "Must be between 0 and 150." }
    ]
  }
}`}</CodeBlock>

        <p>
          The fields that earn their place: <code>code</code> (stable, machine-readable, never changes), <code>message</code> (human-readable, can change), <code>request_id</code> (so support can find the failure in logs), and <code>details</code> (per-field for validation errors). RFC 7807 (&quot;Problem Details for HTTP APIs&quot;) is one standardized version of this, Spring Boot has built-in support via <code>ProblemDetail</code> as of Spring 6.
        </p>

        <CodeBlock lang="java" caption="Centralizing errors with @RestControllerAdvice">{`@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorEnvelope> handleValidation(MethodArgumentNotValidException ex,
                                                       HttpServletRequest req) {
    List<FieldError> details = ex.getBindingResult().getFieldErrors().stream()
        .map(fe -> new FieldError(fe.getField(), "invalid_value", fe.getDefaultMessage()))
        .toList();

    ErrorEnvelope body = new ErrorEnvelope(
        "validation_failed",
        "One or more fields failed validation.",
        MDC.get("requestId"),
        details
    );
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorEnvelope> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorEnvelope("not_found", ex.getMessage(), MDC.get("requestId"), List.of()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorEnvelope> handleAny(Exception ex) {
    log.error("unexpected error", ex);
    // Don't leak stack traces — generic message + request_id for support to look up.
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorEnvelope("internal_error",
                                "Something went wrong. Reach out with the request ID.",
                                MDC.get("requestId"), List.of()));
  }
}`}</CodeBlock>

        <Callout variant="insight" title="The request_id is non-negotiable">
          <p className="m-0">Every error response should include a request_id that ties to your logs. When a customer pastes &quot;your API is broken, here&apos;s the response&quot; into a support ticket, that ID is how on-call goes from &quot;something happened somewhere&quot; to the actual log line. Generate it in a filter at request-entry, put it in MDC for log correlation, surface it in errors. Pair it with the <code>X-Request-ID</code> response header so successful responses carry it too.</p>
        </Callout>

        <Quiz
          question="A client reports: 'When I paginate through orders, occasionally an order shows up twice on consecutive pages.' Your endpoint sorts by updated_at and uses offset pagination. What's the most likely cause?"
          options={[
            { label: "Sorting by a mutable field (updated_at) means rows shift between pages as they're modified, an order updated between page fetches can reappear. Switch to a stable sort key like (created_at, id) and move to cursor pagination.", correct: true, explanation: "Right. updated_at changes; pagination needs a stable ordering. Combined with offset pagination's row-shift problem during inserts, you get duplicates and skips. Cursor pagination on a stable key is the fix." },
            { label: "Offset pagination is broken in PostgreSQL.", explanation: "Offset pagination has performance problems at scale, but the duplicate-row bug here is specifically about sorting on a mutable field. Cursor pagination on the same mutable field would have the same bug." },
            { label: "The client is calling the endpoint twice.", explanation: "Possible but the symptom 'orders show up twice on consecutive pages' is a server-side ordering issue, not a double-call. Check the SQL ordering first." },
            { label: "Add ORDER BY with DESC NULLS LAST.", explanation: "NULLS handling can cause issues but the core bug is the mutable sort key, not null ordering." },
          ]}
          hint="What property must your sort key have for pagination to be stable?"
          xp={8}
        />

        <Quiz
          question="A team adds idempotency keys but the bug they were trying to fix, duplicate charges on retry, still happens occasionally. The implementation: client sends Idempotency-Key, server checks Redis, if miss it processes the charge then stores the response. What's the race?"
          options={[
            { label: "Two retries arrive in parallel; both check Redis, both miss, both process the charge, then both write. The check-then-process needs to be atomic, use SETNX (or Redis transaction) to claim the key first, before processing.", correct: true, explanation: "Right. The classic check-then-act race. The fix is to atomically claim the key with SETNX (set-if-not-exists) before processing. If the claim fails, another request is in-flight, return 409 Conflict or wait-and-poll until the original completes." },
            { label: "Redis lost the key, TTL was too short.", explanation: "Possible operationally, but the described bug pattern (concurrent retries) is the textbook race condition for non-atomic claim-and-process." },
            { label: "The client is generating different keys per retry.", explanation: "If the client did that, the server couldn't dedupe at all, duplicates would always happen. The bug is intermittent, suggesting concurrency, not key generation." },
            { label: "Switching to PUT would fix it.", explanation: "PUT is idempotent for replacement semantics, not for create-charge semantics. Charging is inherently a creation; idempotency keys are the right tool, just implemented with a race." },
          ]}
          hint="What two operations are happening in the wrong order?"
          xp={8}
        />

        <PartRecap
          title="Part 2 recap"
          gist="The contracts that scale: cursor pagination over a stable sort key, idempotency keys with atomic claim, and structured error envelopes with request IDs."
          points={[
            { takeaway: "Cursor pagination on a stable sort key", detail: "Offset pagination dies at scale (slow queries) and shifts rows under inserts (duplicates/skips). Sort by (immutable_field, id), encode the cursor opaquely." },
            { takeaway: "Idempotency keys must be atomic", detail: "Client-generated UUID, server stores (key, body_hash, response) with TTL. Use SETNX or a transaction to claim the key, not a check-then-act, which races." },
            { takeaway: "Structured errors with stable codes", detail: "Always include code (machine-readable, never changes), message (human, can change), request_id (for support), and field-level details for validation. Spring's @RestControllerAdvice is the right place." },
            { takeaway: "request_id ties errors to logs", detail: "Generate at the gateway, propagate through MDC, surface in every error response. It's the difference between 'something happened' and 'here's the actual log line.'" },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="api-design" id="protocols" title="Part 3 · REST vs gRPC vs GraphQL" xp={25}>
        <h2>Three protocols, three different pain profiles</h2>
        <p>
          REST isn&apos;t the only choice and hasn&apos;t been for years. The honest answer for senior interviews and production decisions: each of REST, gRPC, and GraphQL has workloads where it&apos;s the right tool and workloads where it&apos;s a footgun. Knowing why is more useful than picking a favorite.
        </p>

        <h3>REST: the lingua franca</h3>
        <p>
          REST&apos;s superpower is debuggability. Every browser, every curl, every proxy understands it. You can paste a URL into a tab and see the response. Every CDN caches GETs out of the box. Public APIs (Stripe, GitHub, Twilio) are REST because the entire internet knows how to talk to them.
        </p>
        <p>The cost: it&apos;s text-heavy (JSON), under-typed (the schema lives in docs, not the wire), and chatty (one request per resource means N+1 calls for related data, the client either over-fetches or makes too many calls).</p>

        <h3>gRPC: the internal-services choice</h3>
        <p>
          gRPC is HTTP/2 + Protocol Buffers + a code-gen toolchain. You write a <code>.proto</code> file describing services and messages, generate strongly-typed clients and servers in any language, and the wire format is binary and tiny. Streaming (server-streaming, client-streaming, bidirectional) is built in.
        </p>
        <p>
          gRPC shines for service-to-service traffic inside a system: low latency, strict types, easy multi-language support. Google, Square, Netflix run their internal RPC on it. The cost is real: binary wire format means you can&apos;t curl it, browsers need <code>grpc-web</code> as a translation layer, debugging requires tooling, and the toolchain (protoc, code-gen, build integration) is non-trivial.
        </p>

        <CodeBlock lang="plain" caption="A gRPC service definition">{`syntax = "proto3";

package payments.v1;

service PaymentService {
  rpc CreatePayment(CreatePaymentRequest) returns (Payment);
  rpc GetPayment(GetPaymentRequest) returns (Payment);
  rpc StreamPaymentEvents(StreamRequest) returns (stream PaymentEvent);
}

message CreatePaymentRequest {
  string idempotency_key = 1;
  int64 amount_cents = 2;
  string currency = 3;
  string customer_id = 4;
}

message Payment {
  string id = 1;
  Status status = 2;
  int64 amount_cents = 3;
  string currency = 4;
  google.protobuf.Timestamp created_at = 5;

  enum Status {
    STATUS_UNSPECIFIED = 0;
    PENDING = 1;
    SUCCEEDED = 2;
    FAILED = 3;
  }
}`}</CodeBlock>

        <p>
          Note the explicit version in the package (<code>payments.v1</code>) and the explicit field numbers, these are how Protobuf does versioning. Renaming a field is fine; changing its number is breaking. This forces you to think about backward compatibility every time you touch a schema, which is either a feature or a tax depending on your perspective.
        </p>

        <h3>GraphQL: the client-driven choice</h3>
        <p>
          GraphQL inverts the model: instead of the server defining endpoints, the client sends a query specifying exactly the fields it needs. One endpoint (<code>/graphql</code>), arbitrary queries, strongly-typed schema. The pitch: no over-fetching, no N+1 round trips, frontend teams ship without backend changes.
        </p>
        <p>
          That&apos;s the pitch. The reality has sharper edges. The famous <strong>N+1 trap</strong>: a client requests <code>posts {`{ author { name } }`}</code>, and a naive resolver fetches each author one at a time, 100 posts becomes 101 database queries. The fix is DataLoader (a per-request batching layer), but you have to know to do it. Authorization gets weird because every field is independently resolvable. Caching is hard because every query is unique. Rate-limiting needs query complexity analysis, not just request counts.
        </p>

        <Callout variant="warn" title="GraphQL is great for a specific shape, mediocre for others">
          <p className="m-0">GraphQL pays off when you have many client surfaces (web, iOS, Android, third parties) with very different data needs hitting the same backend. It&apos;s a bad fit for &quot;one frontend, one backend, mostly straightforward queries&quot;, you&apos;ve added a query language, a resolver layer, and a batching system to solve a problem you didn&apos;t have. Look at the team shape, not just the tech. If your backend team is two people and they have to maintain a GraphQL gateway plus the underlying services, that&apos;s a tax for client-team flexibility you&apos;re paying.</p>
        </Callout>

        <h3>The honest comparison</h3>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Dimension</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">REST</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">gRPC</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">GraphQL</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Wire format</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">JSON (text)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Protobuf (binary)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">JSON (text)</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Schema</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Out-of-band (OpenAPI)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">In-band (.proto)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">In-band (SDL)</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Browser support</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Native</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">grpc-web bridge</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Native (it&apos;s HTTP)</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Streaming</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">SSE / WebSockets bolt-on</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">First-class</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Subscriptions (often WS)</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">CDN cache</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Free for GET</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Hard (POST + binary)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Hard (POST, queries vary)</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Debuggability</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">curl, paste in browser</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">grpcurl, BloomRPC</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">GraphiQL, Apollo Studio</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Where it shines</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Public APIs, cacheable reads</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Internal RPC, low latency</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Many clients, varied needs</td></tr>
            </tbody>
          </table>
        </div>

        <h3>The decision rubric</h3>
        <p>
          If you&apos;re building a public API for third parties: <strong>REST</strong>. Lower friction, every client library generator works, every developer knows it. If you&apos;re building service-to-service communication inside your own system: <strong>gRPC</strong>. The strict types, binary efficiency, and streaming pay off when the consumer is your own code in the next pod over. If you have a many-clients-many-needs frontend story (web, iOS, Android, partner integrations): <strong>GraphQL</strong>{" "}can be the right call, but commit to the operational complexity (DataLoader, query complexity limits, schema federation if you have many backends).
        </p>

        <ClassifyChallenge
          title="Match the workload to the protocol"
          prompt="For each scenario, pick the protocol whose strengths most directly fit the workload. There's sometimes more than one defensible answer, go with the most natural match."
          buckets={[
            { id: "rest", label: "REST", color: "emerald" },
            { id: "grpc", label: "gRPC", color: "indigo" },
            { id: "graphql", label: "GraphQL", color: "violet" },
          ]}
          items={[
            { id: "stripe", label: "Public payments API for thousands of third-party developers in dozens of languages.", answer: "rest", explanation: "Public APIs live and die on debuggability and language support. REST wins by a mile, it's why Stripe, Twilio, and every other major public API picks it." },
            { id: "internal", label: "Two internal microservices (order service and inventory service) talking 50k req/s with strict latency SLOs.", answer: "grpc", explanation: "Internal, high-throughput, latency-sensitive. gRPC's binary wire format and strong typing pay off here, and you control both ends, so the toolchain cost is acceptable." },
            { id: "manyclients", label: "A platform with web, iOS, Android, and partner clients each needing different slices of user/post/comment data.", answer: "graphql", explanation: "Many client surfaces with varied data shapes is exactly GraphQL's sweet spot. One schema, each client queries what it needs, no version proliferation." },
            { id: "stream", label: "A trading system that needs server-streamed price updates with sub-millisecond serialization overhead.", answer: "grpc", explanation: "First-class server streaming + binary serialization is exactly what gRPC was built for. REST with SSE works but loses to gRPC on latency and type safety." },
            { id: "cdn", label: "A content read API where most responses can be cached at the CDN edge with cache-control headers.", answer: "rest", explanation: "GET-able URLs with cache-control headers is REST's caching superpower, every CDN handles it natively. POST-based protocols (gRPC, GraphQL) make CDN caching painful." },
            { id: "mobile", label: "A mobile app where bandwidth matters and the team wants to avoid over-fetching nested user/profile/feed data on slow networks.", answer: "graphql", explanation: "Bandwidth-sensitive client picking exactly what it needs is the original GraphQL pitch, client-driven queries cut payload size on slow networks." },
          ]}
        />

        <Callout variant="insight" title="The senior take">
          <p className="m-0">Most production systems end up running all three. REST at the edge for the public API. gRPC between services internally. GraphQL as a BFF (backend-for-frontend) gateway when the client teams need it. The wrong question is &quot;which is best.&quot; The right question is &quot;which is best for this specific traffic boundary&quot;, and the answer changes per boundary in the same architecture.</p>
        </Callout>

        <Quiz
          question="A team is debating gRPC vs REST for their public-facing API. Their core argument for gRPC is 'it's faster and strongly typed.' What's the senior counter?"
          options={[
            { label: "Public APIs trade speed for reach. gRPC's binary format breaks every browser-based developer tool, requires grpc-web bridges for web clients, and forces every consumer to set up a protoc toolchain. The latency win rarely justifies the developer-experience cost on a public API.", correct: true, explanation: "Right. gRPC is excellent, for internal traffic. On a public API the consumers are people you don't control and tools you can't standardize. They want to curl an endpoint. They want to paste a URL into a browser. They want to use the language client they prefer. REST hands them all of that for free; gRPC charges per-step." },
            { label: "gRPC isn't faster than REST in practice.", explanation: "gRPC genuinely is lower-latency and lower-bandwidth than REST/JSON. The argument against it for public APIs isn't speed, it's reach and developer experience." },
            { label: "Strong typing is overrated; runtime validation is enough.", explanation: "Strong typing is real value; the issue isn't the typing, it's that the typing comes with toolchain costs that public-API consumers shouldn't have to absorb." },
            { label: "gRPC doesn't support all programming languages.", explanation: "gRPC has client libraries in most major languages, that's not the issue. The issue is browser-native debuggability and zero-toolchain consumption." },
          ]}
          hint="Who consumes a public API, and what tools do they bring?"
          xp={7}
        />

        <Quiz
          question="A team adopted GraphQL for their internal admin tool. Six months in, the backend team complains about authorization complexity, runaway query costs, and difficulty caching. The frontend team says they barely use the field-selection feature. What's the diagnosis?"
          options={[
            { label: "GraphQL was the wrong tool for this shape, one client, one backend, mostly straightforward queries. The flexibility GraphQL provides is paying ongoing complexity costs (per-field auth, query complexity limits, no CDN cache) for a benefit (client-driven queries) that the team doesn't use. REST with explicit endpoints would have been cheaper.", correct: true, explanation: "Exactly. GraphQL pays off when you have many client surfaces with varied data needs. With one frontend that doesn't even use the flexibility, the complexity tax has no return. The senior fix isn't to optimize the GraphQL setup, it's to ask whether GraphQL is the right protocol for this workload at all." },
            { label: "Add DataLoader to fix the N+1 issue.", explanation: "DataLoader is necessary regardless, but it doesn't address the underlying mismatch, they're paying complexity costs for benefits they aren't using." },
            { label: "Switch to gRPC for the admin tool backend.", explanation: "gRPC introduces different complexity (browser support, toolchain) for a workload that's bog-standard CRUD. REST is the simpler match." },
            { label: "Add caching at the GraphQL gateway.", explanation: "Caching POST GraphQL queries is genuinely hard, every query is unique. The deeper issue is whether GraphQL's flexibility is worth the cost for this team and workload." },
          ]}
          hint="What problem does GraphQL solve that this team actually has?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="REST, gRPC, and GraphQL each have specific workloads where they win. The senior decision is matching the protocol to the traffic boundary, not picking a favorite."
          points={[
            { takeaway: "REST wins on reach and debuggability", detail: "Every browser, every curl, every CDN. Public APIs go REST because the consumer is the entire internet and you can't ship a toolchain to them." },
            { takeaway: "gRPC wins for internal service-to-service", detail: "Binary wire, strong typing, first-class streaming. Toolchain cost is acceptable when you control both ends. Browsers need grpc-web." },
            { takeaway: "GraphQL wins for many-client variety", detail: "One schema, clients query what they need. Pays off only when you genuinely have many client surfaces with different data needs, not for one-frontend-one-backend." },
            { takeaway: "Most real systems use all three", detail: "REST at the public edge, gRPC between services, GraphQL as a BFF when client teams need it. The right question is per-boundary, not system-wide." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Part 4 · API design from the client&apos;s seat</h2>
        <p>
          Everything so far has been the server&apos;s view: verbs, status codes, contracts, protocol choice. But the people consuming your API every day are usually frontend developers, and their constraints are different. Round trips cost real time on a phone over LTE. Optimistic updates need cooperative API shapes. Pagination for an infinite-scrolling list has different requirements than pagination for an admin table. Senior backend engineers who&apos;ve never sat next to a frontend dev tend to ship APIs that are technically correct and operationally annoying, this part is about closing that gap.
        </p>

        <h3>REST vs GraphQL vs tRPC, through the client&apos;s eyes</h3>
        <p>
          Part 3 compared protocols from the architecture seat. Now look at the same three (well, two of them plus tRPC) from the seat of someone trying to render a screen on a phone over a flaky network. The tradeoffs shift.
        </p>
        <p>
          <strong>REST from the client.</strong>{" "}Every screen typically needs data from multiple resources. A user-profile page wants the user, their last 10 posts, the comment count on each post, and the current viewer&apos;s follow status. With REST that&apos;s frequently 4+ round trips, or one over-fetching aggregate endpoint that returns 80% data the screen doesn&apos;t use. The win: HTTP caching works for free. Set <code>Cache-Control: max-age=300</code> on the user endpoint and every CDN, every browser, every service worker caches it without you doing anything. That&apos;s a genuine superpower the alternatives don&apos;t replicate.
        </p>
        <p>
          <strong>GraphQL from the client.</strong>{" "}One round trip, exactly the fields the screen needs. The N+1 problem moves from the wire to the server (where DataLoader handles it) instead of leaking onto the client&apos;s network tab. The cost is real and the sharpest edge is caching: every query is a POST with a unique body, so HTTP caching doesn&apos;t apply for free. The industry workaround is <strong>persisted queries</strong>, the client ships a hash, the server has the query stored, which lets you GET-cache by hash and also lets you lock down the query surface so a hostile client can&apos;t send <code>{`{ users { posts { author { posts { ... } } } } }`}</code> and DOS the resolver. This is also why Meta built Relay: client-side normalized cache plus persisted queries plus declarative data requirements per component. GraphQL without that machinery is GraphQL on hard mode.
        </p>
        <p>
          <strong>tRPC from the client.</strong>{" "}tRPC isn&apos;t really a protocol, it&apos;s a TypeScript pattern that takes server function signatures and surfaces them on the client as typed function calls, with no schema language in between. If your stack is Next.js front, Node.js back, monorepo, one team, then tRPC is genuinely magical: rename a server function and the client gets a type error in your IDE before you save. Zero schema drift, zero codegen step, zero runtime version negotiation. The catch: it&apos;s only useful when both ends are TypeScript. The moment your backend is Java/Spring (which, in this course, it is), tRPC stops applying, there&apos;s no Java sibling that gives you the same shape, and even if there were, you&apos;d be back to needing a schema layer to bridge the languages, which is exactly what tRPC&apos;s pitch is &quot;you don&apos;t need.&quot;
        </p>

        <Callout variant="insight" title="The decision in one paragraph">
          <p className="m-0">REST when your API is public or your reads are heavily cached at the edge, HTTP caching pays for the chattiness. GraphQL when you have multiple client surfaces (web, iOS, Android) hitting the same backend with different data needs, and you&apos;re willing to invest in persisted queries + DataLoader + a normalized client cache. tRPC when you&apos;re a TS-only monorepo and want the fewest possible moving parts. Notice none of these say &quot;the best one&quot;, they say &quot;the one whose strengths line up with your shape.&quot;</p>
        </Callout>

        <h3>Pagination, what the client actually needs</h3>
        <p>
          Part 2 covered pagination from the database&apos;s seat: offset gets slow, cursors solve it. The client view adds a second failure mode that doesn&apos;t care about query plans: <strong>infinite scroll</strong>. A user scrolls a feed; new posts are inserted at the top while they scroll. With offset pagination, the next page query says &quot;skip 20, take 20,&quot; but those 20 just got pushed down by 3 inserts, so page 2 re-shows three rows from page 1, and skips three rows that should have been on page 2. The user doesn&apos;t see &quot;a pagination bug.&quot; They see duplicates and missing posts and assume your app is broken.
        </p>
        <p>
          Cursor pagination fixes this because the cursor pins to a specific row, not a position. <code>?cursor=eyJpZCI6MTIzfQ</code> means &quot;give me rows that come after row 123 in the sort order.&quot; Inserts above row 123 don&apos;t affect the answer. That&apos;s why every infinite-scroll feed in production, Twitter/X, Instagram, Reddit, LinkedIn, uses cursors. There is no offset-pagination feed that survives contact with a real user base.
        </p>
        <p>
          The client contract for cursor pagination has three pieces: a <code>nextCursor</code> field (opaque string), a <code>hasMore</code> boolean (so the client knows when to stop), and crucially <em>not</em>{" "}a total count. Total counts are how naive APIs leak performance. <code>SELECT COUNT(*) FROM posts WHERE feed_id = ?</code> on a billion-row table is a multi-second query, and you&apos;re running it on every single page fetch. The user doesn&apos;t need it. Show them &quot;1,234+ posts&quot; or just nothing. Reserve the total for screens where you genuinely have one (a settled admin report) and pre-compute it.
        </p>

        <CodeBlock lang="java" caption="A cursor-paginated feed endpoint in Spring">{`@RestController
@RequestMapping("/v1/feeds")
public class FeedController {

  private final JdbcTemplate jdbc;

  @GetMapping("/{feedId}/posts")
  public PageResponse<PostDto> listPosts(
      @PathVariable String feedId,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "20") int limit) {

    if (limit > 100) limit = 100; // cap so a hostile client can't ask for 10M rows

    // Decode the cursor to (createdAt, id). First page: cursor is null, no WHERE.
    Cursor c = cursor == null ? null : Cursor.decode(cursor);

    String sql = """
        SELECT id, feed_id, body, created_at
          FROM posts
         WHERE feed_id = ?
           AND (? IS NULL OR (created_at, id) < (?, ?))
         ORDER BY created_at DESC, id DESC
         LIMIT ?
        """;

    // Fetch limit+1 so we can tell if there's a next page without a COUNT(*).
    List<PostDto> rows = jdbc.query(sql,
        new Object[]{ feedId, c, c == null ? null : c.createdAt(), c == null ? null : c.id(), limit + 1 },
        (rs, i) -> new PostDto(
            rs.getString("id"),
            rs.getString("feed_id"),
            rs.getString("body"),
            rs.getTimestamp("created_at").toInstant()));

    boolean hasMore = rows.size() > limit;
    if (hasMore) rows = rows.subList(0, limit);

    String nextCursor = null;
    if (hasMore && !rows.isEmpty()) {
      PostDto last = rows.get(rows.size() - 1);
      nextCursor = Cursor.encode(new Cursor(last.createdAt(), last.id()));
    }

    return new PageResponse<>(rows, nextCursor, hasMore);
  }
}

public record Cursor(Instant createdAt, String id) {
  public static String encode(Cursor c) {
    String json = "{\\"t\\":\\"" + c.createdAt + "\\",\\"i\\":\\"" + c.id + "\\"}";
    return Base64.getUrlEncoder().withoutPadding()
        .encodeToString(json.getBytes(StandardCharsets.UTF_8));
  }
  public static Cursor decode(String s) { /* base64-decode + parse JSON */ }
}

public record PageResponse<T>(List<T> data, String nextCursor, boolean hasMore) {}`}</CodeBlock>

        <p>
          Two non-obvious tricks in there. First, <strong>fetch <code>limit + 1</code></strong>: if you get back more than the user asked for, there&apos;s a next page; trim the extra row before returning. This costs almost nothing and saves you from a separate count query. Second, the WHERE clause <code>(created_at, id) &lt; (?, ?)</code> uses tuple comparison so the index on <code>(feed_id, created_at, id)</code> serves the query without sorting. The <code>id</code> in the cursor is the tie-breaker for posts created in the same millisecond, without it, two posts at the exact same timestamp can be skipped or duplicated.
        </p>

        <Callout variant="warn" title="Don't ship total counts you don't need">
          <p className="m-0">A client asking for <code>?include_total=true</code> is a smell. If the design genuinely needs &quot;page 47 of 312,&quot; revisit the design, that pattern is for desktop tables, not modern mobile feeds. If it&apos;s truly necessary, pre-compute the count in a materialized view or a counter table updated on insert/delete, never as a side-effect of pagination requests. <code>COUNT(*)</code> on every page request is one of the most reliable ways to take down a feed service under load.</p>
        </Callout>

        <h3>Optimistic updates, the API contract that makes them work</h3>
        <p>
          Optimistic updates are why a modern app feels instant. The user taps Like; the heart fills in immediately; the network request goes out in the background; if the server rejects the request, the heart un-fills with a small error toast. The latency disappears from the user&apos;s perception. Every product app of any quality does this for any frequently-tapped action.
        </p>
        <p>
          The API needs to cooperate, and most APIs don&apos;t. The contract has four pieces:
        </p>
        <ol>
          <li><strong>Idempotent mutations.</strong>{" "}The client predicted &quot;like succeeded.&quot; The network burped; the client retries. If the second call double-likes the post, optimism becomes a bug. This is exactly what idempotency keys (Module 23, also Part 2 above) solve, the client generates a key per logical action, retries are safe.</li>
          <li><strong>Client-generated IDs.</strong>{" "}If the user creates a comment optimistically, the client renders it with some ID immediately. If the server then assigns its own ID on creation, the client now has a temporary ID it has to reconcile with the real one, and any in-flight updates to that comment (edits, deletes) referencing the temporary ID need to be remapped. The cleaner contract: the client generates a UUID, sends it in the create request, the server uses it. Now the optimistic record and the server record have the same ID; no reconciliation.</li>
          <li><strong>Deterministic response shapes.</strong>{" "}The optimistic UI predicted what the server would return. If the server&apos;s response shape varies (sometimes <code>updatedAt</code>, sometimes <code>updated_at</code>, sometimes a different nested structure), the client&apos;s prediction is always wrong on some field, and optimism leaks &quot;flicker&quot; bugs as the predicted state gets replaced by the actual state. Pick a shape and stick to it byte-for-byte.</li>
          <li><strong>Server returns the canonical entity.</strong>{" "}Don&apos;t return <code>{`{"success": true}`}</code>. Return the full entity as it now exists on the server. The client diffs against its optimistic guess and fixes any drift silently.</li>
        </ol>

        <CodeBlock lang="java" caption="A create endpoint that supports optimistic UI">{`@PostMapping("/v1/comments")
public ResponseEntity<CommentDto> createComment(
    @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
    @RequestBody CreateCommentRequest req) {

  // Client generated the ID — we honor it instead of generating our own.
  // This is what makes optimistic UI clean: the client's optimistic
  // record and the server's canonical record have the same ID.
  if (req.id() == null || !isValidUuid(req.id())) {
    throw new ValidationException("id is required and must be a UUID");
  }

  Comment saved = service.create(
      req.id(),
      req.postId(),
      req.body(),
      currentUser(),
      idempotencyKey
  );

  // Return the canonical entity, not just {"success": true}.
  // The client uses this to reconcile against its optimistic prediction.
  return ResponseEntity.status(HttpStatus.CREATED).body(CommentDto.from(saved));
}`}</CodeBlock>

        <p>
          When optimistic updates <em>don&apos;t</em>{" "}work: anything where the client can&apos;t predict the result. &quot;Submit payment&quot;, the client doesn&apos;t know if the card will be approved. &quot;Reserve the last seat&quot;, the client doesn&apos;t know if someone else just reserved it. &quot;Apply discount code&quot;, the client doesn&apos;t know if the code is valid. Anything with <strong>cross-entity invariants</strong> (uniqueness checks, balance checks, inventory) needs the server&apos;s real answer before the UI commits. The fix is the opposite of optimism: show a spinner, await the server, then commit. Trying to predict these and rolling back creates worse UX than just showing the spinner, the user sees their action &quot;succeed&quot; then visibly fail, which feels broken in a way that a one-second spinner doesn&apos;t.
        </p>

        <Callout variant="info" title="The simple test">
          <p className="m-0">Can the client compute the result without talking to anyone else? If yes, optimistic update is fine (likes, follows, marking-as-read, edits to your own content). If the result depends on something the client doesn&apos;t have (other users, inventory, payment networks), do not be optimistic, show a spinner and wait. The product manager will push back; show them the alternative (an action that &quot;succeeds&quot; then visibly reverses) and they&apos;ll change their mind.</p>
        </Callout>

        <h3>BFF, Backend for Frontend</h3>
        <p>
          The shape of the problem: you have N clients (web, iOS, Android, watchOS, partner SDK) talking to M backend services (user, post, comment, notification, recommendation, payment). Every client needs a different blend of data per screen. The naive answer is &quot;each client calls each service directly and aggregates client-side.&quot; That works briefly, then breaks down: every client team has to know the full service topology, every service version bump risks breaking some client, mobile clients pay for chatty round trips on slow networks, and authentication/authorization gets re-implemented in each client.
        </p>
        <p>
          The <strong>Backend for Frontend</strong>{" "}pattern puts a thin aggregating service in front of the backend, one per client family. The web BFF returns shapes optimized for the web app; the iOS BFF returns shapes optimized for the iOS app. Each BFF is owned by the same team that owns the client, that&apos;s the &quot;for frontend&quot; part. The frontend team can ship a screen change without coordinating with backend service teams; they just change their BFF.
        </p>

        <CodeBlock lang="plain" caption="The shape of a BFF deployment">{`Without BFF:                          With BFF (one per client family):

[Web]   ─┐                            [Web]    → [Web BFF]    ─┐
[iOS]   ─┼─→ [User svc]               [iOS]    → [iOS BFF]    ─┼─→ [User svc]
[Andr.] ─┘   [Post svc]               [Andr.]  → [Andr. BFF]  ─┘   [Post svc]
              [Comment svc]                                          [Comment svc]
              [Notif svc]                                            [Notif svc]

Every client knows                    Each client talks to one shape-
about every service.                  matched gateway. Backend services
N×M coupling.                         are decoupled from clients.`}</CodeBlock>

        <p>
          The non-obvious decision is <strong>fat BFF vs thin BFF</strong>. A thin BFF is just shape transformation: it calls 3 backend services in parallel, merges the results, drops fields the client doesn&apos;t need, returns a shape tuned for the screen. A fat BFF starts adding business logic, &quot;if user is in experiment group X, swap field Y for field Z,&quot; &quot;compute this aggregate from those service responses,&quot; &quot;cache this expensive query specifically for the iOS feed.&quot; Fat BFFs are seductive: the frontend team can ship anything they want without waiting on a backend team.
        </p>
        <p>
          The senior take: <strong>keep BFFs thin.</strong>{" "}Once a BFF has business logic, it&apos;s a service in disguise, it has its own domain knowledge, its own bugs, its own ownership conflicts (the &quot;frontend team&quot; doesn&apos;t actually want to be on call for a backend service). The right home for business logic is the underlying service. The BFF&apos;s job is shape-shifting and request fan-out, full stop. When you find yourself reaching for a database in the BFF or computing something non-trivial, that&apos;s a signal the backend service should expose the missing capability instead.
        </p>

        <Callout variant="insight" title="GraphQL gateways are BFFs at scale">
          <p className="m-0">Meta&apos;s Relay/GraphQL setup is, architecturally, a BFF, clients talk GraphQL to a gateway that fans out to internal services. The difference is that instead of a hand-coded BFF per client, the gateway is generic: each client describes its data needs declaratively (the GraphQL query) and the gateway resolves them. That&apos;s why GraphQL pays off when you have many client surfaces, it&apos;s a generic BFF that scales to a new client by writing queries instead of writing a new service. If you have one or two clients, a hand-coded BFF in Spring is simpler. If you have ten, GraphQL federation starts to win.</p>
        </Callout>

        <Callout variant="spring" title="Where the BFF lives in a Java/Spring shop">
          <p className="m-0">Spring Cloud Gateway can host BFF logic, it has filter chains, request aggregation, and reactive composition built in. The temptation is to put all BFF logic in the gateway because &quot;it&apos;s already there.&quot; Resist it: the gateway is shared infrastructure, owned by a platform team, and putting client-specific shape logic in it creates a permanent coordination tax between the platform team and every client team. The cleaner deployment is a separate Spring Boot service per client family (web-bff, mobile-bff), each owned by the corresponding client team, with the gateway just routing to them. The next module on Spring Cloud Gateway covers this distinction in detail.</p>
        </Callout>

        <ClassifyChallenge
          title="Pick the right tool for each client-side problem"
          prompt="Each scenario hits one of the patterns from this part. Drop it into the bucket whose strengths line up with the problem."
          buckets={[
            { id: "rest", label: "REST + HTTP cache", color: "emerald" },
            { id: "graphql", label: "GraphQL", color: "violet" },
            { id: "trpc", label: "tRPC", color: "sky" },
            { id: "cursor", label: "Cursor pagination", color: "indigo" },
            { id: "optimistic", label: "Optimistic update", color: "amber" },
            { id: "bff", label: "BFF (thin)", color: "rose" },
          ]}
          items={[
            { id: "feed", label: "An infinite-scroll social feed where new posts arrive at the top while users scroll.", answer: "cursor", explanation: "Inserts above the user's current position would cause offset pagination to duplicate or skip rows. Cursors pin to a specific row so inserts don't shift the answer." },
            { id: "like", label: "A 'like' button that should fill in instantly when tapped, before the network call completes.", answer: "optimistic", explanation: "Likes are predictable (the client knows whether the user is allowed to like) and the action is idempotent. Classic optimistic-update territory, show the result immediately, reconcile if the server rejects." },
            { id: "monorepo", label: "A Next.js app and a Node.js backend in a single TypeScript monorepo, one team, no other consumers.", answer: "trpc", explanation: "Single language, single team, monorepo, exactly the shape tRPC was built for. No schema layer, end-to-end types from server function signatures. The moment you add a non-TS client this stops being the right answer." },
            { id: "manyclients", label: "A platform with web, iOS, Android, and partner SDK each fetching different blends of user/post/comment data per screen.", answer: "graphql", explanation: "Many client surfaces, varied data needs, same backend services. GraphQL's query-per-client model pays for its complexity here, each client asks for exactly its screen's shape." },
            { id: "blog", label: "A public blog API where most reads can be cached at the CDN edge for 5 minutes.", answer: "rest", explanation: "GET-able URLs + Cache-Control headers is REST's caching superpower. Every CDN handles it natively. POST-based protocols (GraphQL, gRPC) make CDN caching painful." },
            { id: "screenshape", label: "A web app where the home screen needs data from 4 backend services in a specific aggregated shape, and the iOS app needs the same data in a different shape.", answer: "bff", explanation: "Two client surfaces wanting different shapes of overlapping data is the textbook BFF case. One BFF per client family, each does fan-out + shape transformation, business logic stays in the underlying services." },
          ]}
        />

        <Quiz
          question={`A frontend team complains: "Your list endpoint returns a 'totalCount' field, and pagination works fine on staging, but in production it takes 8 seconds per page on the largest tenant." The backend uses cursor pagination with a separate COUNT(*) query for totalCount. What's the senior fix?`}
          options={[
            { label: "Drop totalCount from the response. Most clients don't actually need it; the COUNT(*) is what's slow at scale. Return nextCursor + hasMore and let the client render '1,000+' or nothing.", correct: true, explanation: "Right. COUNT(*) on a large filtered table is the classic 'scales to a wall' query, fine at staging volumes, multi-second in production. The client almost never needs an exact total; nextCursor + hasMore is sufficient for every infinite-scroll UI. If the product really needs a total, pre-compute it, don't recompute it per page request." },
            { label: "Add an index to speed up COUNT(*).", explanation: "Indexes can help bounded counts but COUNT(*) on a filtered set still has to traverse all matching rows. The deeper question is whether you need the count at all, for cursor pagination on a feed, you don't." },
            { label: "Cache the totalCount in Redis with a 30-second TTL.", explanation: "This masks the symptom but you'll pay the COUNT query on every cache miss, and stale counts can cause off-by-one UI bugs ('1,234 results' but only 1,233 actually return). The right answer is to question whether the client needs the total at all." },
            { label: "Switch from cursor pagination to offset pagination so you can compute totals more cheaply.", explanation: "Offset pagination is slower, not faster, at large offsets, and it has correctness bugs under inserts that cursor pagination avoids. The total is the problem, not the pagination strategy." },
          ]}
          hint="Which part of the response is actually expensive, the page or the count?"
          xp={8}
        />

        <Quiz
          question={`A team building a mobile app wants optimistic updates for "create a comment." The current API generates the comment ID server-side and returns it in the create response. The mobile team says optimistic UI is "really hard" with this API. What's the API change that makes it easy?`}
          options={[
            { label: "Accept a client-generated UUID as the comment ID in the create request. The client renders the optimistic comment with that UUID immediately, and when the server responds, the IDs already match, no reconciliation needed.", correct: true, explanation: "Right. Server-generated IDs force the client to reconcile its optimistic record (with a temporary ID) against the server record (with the real ID). Any in-flight edits or deletes referencing the temp ID then need remapping, that's the 'really hard' part. Letting the client generate the ID makes the optimistic record and the canonical record share an ID from the start. Pair this with idempotency keys so retries don't create duplicates." },
            { label: "Return success: true immediately and let the server process the comment in the background.", explanation: "This is fire-and-forget, not optimistic UI, and it's a strictly worse UX because the client has no way to surface a real failure. Optimistic UI needs the canonical entity back so it can reconcile against its prediction." },
            { label: "Move the create endpoint from POST to PUT so it's idempotent.", explanation: "PUT to a server-chosen URL still gives you a server-chosen ID. The fix is letting the client choose the ID (and adding an idempotency key for retry safety), not changing the verb." },
            { label: "Use WebSockets so the client gets the canonical ID in real time.", explanation: "WebSockets don't solve the underlying ID-mismatch problem, the client still has to render the comment optimistically before any server round trip completes. The cleaner answer is making the IDs match by construction, not by faster delivery." },
          ]}
          hint="What gets harder when the client's optimistic ID doesn't match the server's real ID?"
          xp={8}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Server-shaped APIs and client-shaped APIs aren't the same. Picking REST/GraphQL/tRPC, paginating for infinite scroll, supporting optimistic updates, and shaping a thin BFF are all calls that look different from the client's seat than from the server's."
          points={[
            { takeaway: "Protocol choice depends on cache shape and team shape", detail: "REST when reads are heavily edge-cacheable. GraphQL when many clients share a backend with varied data needs (commit to persisted queries + DataLoader). tRPC for TS-only monorepos. None is universally best." },
            { takeaway: "Cursor pagination is the only sane answer for infinite scroll", detail: "Inserts shift offset-based queries; cursors pin to a row. Return nextCursor + hasMore, drop totalCount unless you've pre-computed it, COUNT(*) per page is how feeds fall over at scale." },
            { takeaway: "Optimistic UI needs API cooperation", detail: "Idempotent mutations + client-generated IDs + deterministic response shapes + canonical entity in the response. Don't be optimistic for cross-entity invariants (payments, inventory, uniqueness), show a spinner instead." },
            { takeaway: "Keep BFFs thin", detail: "One BFF per client family does fan-out + shape transformation. Business logic belongs in underlying services. GraphQL gateways are generic BFFs that pay off at many-client scale; hand-coded BFFs are simpler at small scale." },
          ]}
        />
      </section>

      <section>
        <h2>Wrapping up</h2>
        <p>
          API design is the contract layer between teams. Get the verbs right so retries are safe. Get pagination, idempotency, and errors right so the API survives scale. Pick the protocol that matches the boundary, public, internal, or many-client. Shape the response for the client doing the calling, not the database underneath. The next module zooms in on one of those boundaries: the gateway that sits at the edge of your system handling routing, auth, and rate limiting before traffic reaches your services.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Spring Cloud Gateway, the actual edge gateway in Java. Routing, filters, edge rate-limiting, JWT auth offload, and how Spring&apos;s reactive gateway handles all of it without putting business logic in the wrong place.
        </p>
        <Link
          href="/courses/system-design/modules/spring-cloud-gateway"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-cyan-600 hover:to-blue-600 hover:shadow-md"
        >
          Continue to Spring Cloud Gateway →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="api-design" />
    </article>
  );
}
