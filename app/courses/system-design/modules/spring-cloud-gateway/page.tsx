import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";

const CHECKPOINTS = [
  { id: "why", title: "Why a gateway exists" },
  { id: "routing", title: "Routing, predicates, filters" },
  { id: "production", title: "Rate limit, JWT, resilience" },
];

const filterLifecycle = `sequenceDiagram
  participant C as Client
  participant G as Gateway
  participant F as Filters
  participant S as Downstream service
  C->>G: HTTP request
  G->>F: pre filters (auth, rate-limit, headers)
  F->>S: forward request
  S-->>F: HTTP response
  F-->>G: post filters (CORS, logging, timing)
  G-->>C: HTTP response`;

export default function Page() {
  const mod = getModuleBySlug("spring-cloud-gateway")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <ModuleProgress moduleSlug="spring-cloud-gateway" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚪</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Spring Cloud Gateway is the front door for most Spring-based microservice fleets. By the end you&apos;ll know what belongs in the gateway, what doesn’t, and how to wire the production-grade features — Redis rate limiting, JWT offload, circuit breakers — without turning the gateway into a distributed monolith.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Predicates + filters + routes — the three primitives, and why everything is built from them</li>
          <li>Pre-filter vs post-filter lifecycle (and where to NOT put business logic)</li>
          <li>Building a custom <code>GatewayFilterFactory</code> in Java (real, working code)</li>
          <li>Redis-backed token bucket rate limiting with a <code>KeyResolver</code></li>
          <li>JWT validation at the edge, then identity propagation downstream</li>
        </ul>
      </section>

      <section>
        <h2>The gateway is a controlled chokepoint, not a smart layer.</h2>
        <p>
          The temptation, every time, is to start putting things in the gateway. &quot;It sees every request — let&apos;s do enrichment here.&quot; &quot;Let&apos;s call the user service to add full profile data.&quot; &quot;Let&apos;s aggregate three downstream calls into one response.&quot; Six months later your gateway is a distributed monolith with its own deploy schedule, and every service team is blocked on the gateway team.
        </p>
        <p>
          The right mental model: a gateway is a <strong>controlled chokepoint</strong>. It does the things that are easier to do once, at the edge, than N times in N services — auth, rate limiting, CORS, request shaping, observability. Everything else belongs downstream.
        </p>
      </section>

      <Checkpoint moduleSlug="spring-cloud-gateway" id="why" title="Part 1 · Why a gateway exists" xp={25}>
        <h3>What belongs in the gateway</h3>
        <ul>
          <li><strong>Authentication offload.</strong> Validate JWTs once, propagate a trusted identity header downstream. Internal services trust the header; they don&apos;t re-validate the token.</li>
          <li><strong>Rate limiting.</strong> Per-user and per-API-key throttling. Cheaper to drop at the edge than to drop in service N after wasting hops.</li>
          <li><strong>Routing.</strong> Path → service mapping. <code>/api/payments/**</code> → <code>payments-svc</code>. Route changes are config, not deploys.</li>
          <li><strong>Cross-cutting headers.</strong> Correlation IDs, request IDs, tenant headers, security headers. Stamp once at the edge.</li>
          <li><strong>Circuit breakers / retries.</strong> Coarse-grained, edge-level fallback. Fine-grained per-call resilience still belongs in service-to-service code.</li>
          <li><strong>TLS termination.</strong> Often, though increasingly this is handled by the load balancer or service mesh in front of the gateway.</li>
        </ul>

        <h3>What doesn’t belong</h3>
        <ul>
          <li><strong>Business logic.</strong> If the gateway has to know that &quot;a refund over $1000 needs manager approval,&quot; you&apos;ve put domain logic at the edge. Don’t.</li>
          <li><strong>Data aggregation.</strong> The gateway calling three services to merge a response is a tempting shortcut. It&apos;s also a coupling nightmare. That&apos;s a Backend-for-Frontend (BFF) job — a separate aggregator service.</li>
          <li><strong>Long-lived state.</strong> Sessions, caches with business meaning, anything stateful. The gateway should be horizontally trivial to scale — stateless or near-stateless.</li>
          <li><strong>Heavy transformation.</strong> Light header rewrites, sure. Full payload reshaping for every request? That&apos;s logic that should live somewhere it can be tested and owned.</li>
        </ul>

        <Callout variant="warn" title="The aggregator trap">
          <p className="m-0">
            Every gateway team eventually fields a request: &quot;Can the gateway just call /user and /preferences and merge the response?&quot; Say no, or build a separate BFF service. Once one team gets aggregation in the gateway, twelve more will follow, and now your gateway deploys are blocked by twelve teams&apos; release cycles.
          </p>
        </Callout>

        <h3>Why Spring Cloud Gateway specifically</h3>
        <p>
          Spring Cloud Gateway is built on <strong>Spring WebFlux</strong> — reactive, non-blocking, Netty-based. That matters because a gateway sees every request, and the per-request overhead of a thread-per-request model (Tomcat-style) starts to dominate at scale. With WebFlux, a small pool of event-loop threads handles thousands of concurrent in-flight requests. The cost is a different programming model: <code>Mono</code>/<code>Flux</code> instead of plain return values, no <code>ThreadLocal</code> shenanigans, no blocking calls in filters.
        </p>
        <p>
          Compared to Netflix Zuul 1 (servlet, blocking, deprecated), Zuul 2 (Netty but Netflix-internal), or just hand-rolling a gateway in Express or Go — Spring Cloud Gateway hits the sweet spot for Spring shops: idiomatic Spring config, deep ecosystem integration (Spring Security, Resilience4j, Micrometer), and reactive performance.
        </p>

        <h3>The three primitives</h3>
        <p>
          Everything in Spring Cloud Gateway is a <strong>route</strong>. A route has three parts:
        </p>
        <ul>
          <li><strong>ID</strong> — a label for logs and metrics.</li>
          <li><strong>URI</strong> — where to forward to (e.g. <code>http://payments-svc:8080</code> or <code>lb://payments-svc</code> for service-discovery integration).</li>
          <li><strong>Predicates</strong> — conditions the request must match (path, header, method, host, time-of-day, cookie). All predicates AND together.</li>
          <li><strong>Filters</strong> — transformations applied before forwarding and after the response comes back.</li>
        </ul>

        <h3>The simplest possible route, in YAML</h3>
        <CodeBlock lang="plain">{`# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: payments-route
          uri: lb://payments-svc        # load-balanced via service discovery
          predicates:
            - Path=/api/payments/**     # match these paths
          filters:
            - StripPrefix=2             # strip /api/payments before forwarding
            - AddRequestHeader=X-Source, gateway`}</CodeBlock>

        <p>
          That&apos;s a complete, working gateway route. Drop it in <code>application.yml</code>, hit <code>/api/payments/123</code>, and the request gets forwarded to <code>payments-svc</code> as <code>/123</code> with an extra header.
        </p>

        <h3>The same route, in Java DSL</h3>
        <p>
          YAML is great for static routing. Once predicates or filters need conditional logic — &quot;use this filter only in staging,&quot; &quot;build the URI from a config bean&quot; — switch to the Java DSL.
        </p>
        <CodeBlock lang="plain">{`@Configuration
public class GatewayConfig {

  @Bean
  public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
      .route("payments-route", r -> r
        .path("/api/payments/**")
        .filters(f -> f
          .stripPrefix(2)
          .addRequestHeader("X-Source", "gateway")
          .circuitBreaker(c -> c.setName("payments-cb")
            .setFallbackUri("forward:/fallback/payments"))
        )
        .uri("lb://payments-svc"))
      .route("orders-route", r -> r
        .path("/api/orders/**")
        .and()
        .header("X-Tenant", "[a-z]+")        // require tenant header
        .filters(f -> f.stripPrefix(2))
        .uri("lb://orders-svc"))
      .build();
  }
}`}</CodeBlock>

        <Callout variant="spring" title="lb:// vs http://">
          <p className="m-0">
            <code>lb://payments-svc</code> means &quot;look up <code>payments-svc</code> in the registry (Eureka, Consul, Kubernetes) and load-balance across instances.&quot; <code>http://payments-svc:8080</code> trusts DNS to do the right thing — fine in Kubernetes where headless services already round-robin, less fine in a VM-based world. Pick one and stick with it across routes; mixing causes confusion in incident reviews.
          </p>
        </Callout>

        <Quiz
          question="A junior engineer wants to add a feature: the gateway should call /user-profile and merge it into every /api/orders/** response so clients don't have to. Should you accept the PR?"
          options={[
            { label: "Yes — the gateway already sees every request, this is the right place.", explanation: "This is the aggregator trap. The gateway becomes coupled to user-profile's contract, deploys are now joint, and other teams will pile on the same pattern until the gateway is a distributed monolith." },
            { label: "Yes, but only if it’s behind a feature flag.", explanation: "A feature flag doesn't fix the architectural problem. The coupling exists either way — flags just delay the pain." },
            { label: "No — that’s aggregation. It belongs in a BFF service or in the orders service itself.", correct: true, explanation: "Right. Aggregation creates cross-team coupling at the gateway. A dedicated BFF (or orders-svc owning its own enrichment) keeps the gateway focused on cross-cutting edge concerns." },
            { label: "No — the gateway is reactive, you can’t make outbound HTTP calls from it.", explanation: "You absolutely can — WebClient is reactive and works fine in WebFlux. The reason to say no is architectural, not technical." },
          ]}
        />

        <Quiz
          question="What's the practical difference between Spring Cloud Gateway and Zuul 1 that matters for a high-traffic gateway?"
          options={[
            { label: "Gateway uses YAML, Zuul uses Groovy.", explanation: "Both can use config files. The deeper difference is the threading model." },
            { label: "Gateway is reactive (WebFlux/Netty, non-blocking), Zuul 1 is servlet-based and thread-per-request.", correct: true, explanation: "Exactly. Under heavy concurrency the per-request thread model in Zuul 1 hits memory and context-switch limits much sooner than Gateway's event-loop model." },
            { label: "Gateway supports JWTs, Zuul doesn’t.", explanation: "Both can validate JWTs — that's a Spring Security feature, not a gateway feature." },
            { label: "Gateway has no service discovery integration.", explanation: "Backwards — Gateway integrates with Eureka, Consul, and Kubernetes via lb:// URIs." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="The gateway is a stateless edge chokepoint for cross-cutting concerns. Routing + predicates + filters is the entire mental model."
          points={[
            { takeaway: "Auth, rate-limit, routing, headers, coarse circuit breakers — yes. Business logic, aggregation, state — no.", detail: "Anything domain-shaped at the edge becomes coupling between teams. The gateway should be deployable independently of every service behind it." },
            { takeaway: "WebFlux/Netty is why Spring Cloud Gateway scales — but it changes how you write filters.", detail: "No blocking calls, no ThreadLocal-based context, return Mono/Flux. If you need blocking work, schedule it onto a bounded scheduler or do it in a downstream service." },
            { takeaway: "A route is ID + URI + predicates + filters. That’s all there is.", detail: "Predicates are AND-ed together to gate when the route applies. Filters transform the request on the way in and the response on the way out." },
            { takeaway: "YAML for static routes, Java DSL when you need logic.", detail: "Use YAML 80% of the time — it’s declarative and reviewable. Reach for the Java DSL when filters or URIs depend on runtime config or beans." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="spring-cloud-gateway" id="routing" title="Part 2 · Routing, predicates, filters" xp={30}>
        <h3>Predicates: when does this route apply?</h3>
        <p>
          A predicate is a function that says &quot;yes, this route matches this request&quot; or &quot;no, try the next one.&quot; Routes are evaluated in order; the first match wins. The built-in predicates cover most needs:
        </p>
        <ul>
          <li><code>Path=/api/payments/**</code> — Ant-style path matching.</li>
          <li><code>Method=GET,POST</code> — only these HTTP methods.</li>
          <li><code>Header=X-Tenant, [a-z]+</code> — header present and matches regex.</li>
          <li><code>Host=**.example.com</code> — Host header pattern.</li>
          <li><code>Query=debug, true</code> — query param present and matches.</li>
          <li><code>Cookie=session, .*</code> — cookie present.</li>
          <li><code>After=2026-01-01T00:00:00Z[UTC]</code> — only after this timestamp. Useful for staged cutovers.</li>
          <li><code>Weight=group1, 8</code> — weighted routing for canary rollouts.</li>
        </ul>

        <h3>Filters: pre and post</h3>
        <p>
          A filter has two halves: code that runs <em>before</em> the request is forwarded (pre-filter) and code that runs <em>after</em> the response comes back (post-filter). Most built-ins do one or the other; custom filters frequently do both.
        </p>

        <Mermaid chart={filterLifecycle} />

        <h3>Built-in filters that earn their keep</h3>
        <ul>
          <li><code>StripPrefix=N</code> / <code>PrefixPath=/foo</code> — path rewriting.</li>
          <li><code>AddRequestHeader</code> / <code>RemoveRequestHeader</code> / <code>SetRequestHeader</code> — header surgery.</li>
          <li><code>{`RewritePath=/api/(?<segment>.*), /\${segment}`}</code> — regex path rewrite.</li>
          <li><code>RequestRateLimiter</code> — Redis-backed token bucket (covered in Part 3).</li>
          <li><code>CircuitBreaker</code> — wraps the downstream call in a Resilience4j circuit breaker.</li>
          <li><code>Retry</code> — retry on configured statuses. Watch interactions with idempotency.</li>
          <li><code>TokenRelay</code> — propagates the OAuth2 access token downstream.</li>
          <li><code>SaveSession</code> — forces session save before forwarding (Spring Session integration).</li>
        </ul>

        <Callout variant="warn" title="Retry + non-idempotent verbs = bug factory">
          <p className="m-0">
            The default <code>Retry</code> filter retries on 5xx responses. If you slap it on a route that includes <code>POST /payments</code>, a transient 502 from the downstream can produce two payments. Always scope <code>Retry</code> to safe methods (GET, HEAD) or pair it with idempotency keys end-to-end.
          </p>
        </Callout>

        <h3>Filter ordering matters</h3>
        <p>
          Filters run in a specific order — Spring assigns each built-in a numeric order, and you can override with <code>OrderedGatewayFilter</code>. The mental model: pre-filters run low-order-first on the way in, post-filters run high-order-first on the way back out.
        </p>
        <p>
          Common ordering bugs: rate-limiter running <em>after</em> the auth filter (so unauth&apos;d traffic still consumes tokens), or correlation-ID added <em>after</em> the access log filter (so logs have empty correlation IDs). When debugging weird filter behavior, dump the route&apos;s filter chain at startup — it’s the fastest way to see what&apos;s actually wired up.
        </p>

        <h3>Building a custom filter (the right way)</h3>
        <p>
          Built-ins cover 80% of cases. The remaining 20% — propagating a tenant ID, normalizing a deprecated header, redacting a field from logs — needs a custom filter. The pattern: extend <code>AbstractGatewayFilterFactory</code>, define a <code>Config</code> inner class for parameters, return a <code>GatewayFilter</code> as a lambda.
        </p>
        <CodeBlock lang="java">{`@Component
public class CorrelationIdFilterFactory
    extends AbstractGatewayFilterFactory<CorrelationIdFilterFactory.Config> {

  public static final String HEADER = "X-Correlation-Id";

  public CorrelationIdFilterFactory() {
    super(Config.class);
  }

  @Override
  public GatewayFilter apply(Config config) {
    return (exchange, chain) -> {
      ServerHttpRequest req = exchange.getRequest();
      String existing = req.getHeaders().getFirst(HEADER);
      String correlationId = (existing != null && !existing.isBlank())
          ? existing
          : UUID.randomUUID().toString();

      // Mutate the inbound request: stamp the header for downstream
      ServerHttpRequest mutated = req.mutate()
          .header(HEADER, correlationId)
          .build();
      ServerWebExchange mutatedExchange = exchange.mutate().request(mutated).build();

      // Pre-filter: log inbound
      log.info("inbound path={} correlation={}", req.getPath(), correlationId);

      return chain.filter(mutatedExchange).then(Mono.fromRunnable(() -> {
        // Post-filter: stamp on response, log outbound
        exchange.getResponse().getHeaders().add(HEADER, correlationId);
        log.info("outbound status={} correlation={}",
            exchange.getResponse().getStatusCode(), correlationId);
      }));
    };
  }

  public static class Config {
    // No fields needed for this filter; required by the factory contract.
  }
}`}</CodeBlock>

        <p>
          Wire it into a route by referencing the bean name minus the <code>FilterFactory</code> suffix:
        </p>
        <CodeBlock lang="java">{`spring:
  cloud:
    gateway:
      routes:
        - id: payments-route
          uri: lb://payments-svc
          predicates:
            - Path=/api/payments/**
          filters:
            - StripPrefix=2
            - CorrelationId            # <-- custom filter, no args`}</CodeBlock>

        <Callout variant="insight" title="Why factories instead of just beans">
          <p className="m-0">
            Spring Cloud Gateway uses the factory pattern so filters can be configured per-route with different parameters. <code>RewritePath</code> applied to one route uses one regex; on another route, a different regex. The factory creates a fresh filter instance per route, parameterized via the <code>Config</code> object.
          </p>
        </Callout>

        <h3>Global filters vs gateway filters</h3>
        <p>
          A <code>GlobalFilter</code> (extend <code>GlobalFilter</code> directly) runs on <strong>every</strong> route. A <code>GatewayFilter</code> (via factory) runs only on routes that opt in. Default to gateway filters — they&apos;re composable and visible in route config. Reserve global filters for things that genuinely must apply to every request (request logging, security headers, top-level metrics).
        </p>

        <Quiz
          question="Your gateway has Retry configured globally on all 5xx responses, including for POST /api/payments. A downstream payments-svc returns 502 due to a transient network blip. What's the failure mode?"
          options={[
            { label: "The retry happens transparently and the user sees one successful payment.", explanation: "Only if payments-svc is idempotent on POST without an explicit key. Most aren't — by default a retried POST means two charges." },
            { label: "The retry is rejected because POST isn’t safe.", explanation: "The default Retry filter does NOT distinguish safe methods unless you configure the methods explicitly. It will retry POST." },
            { label: "The user may be charged twice — POST isn’t idempotent by default, so retry can duplicate the side effect.", correct: true, explanation: "Right. Retry is only safe with idempotent operations or explicit idempotency keys. Configure Retry to scope to safe methods or pair it with end-to-end idempotency." },
            { label: "Spring Cloud Gateway refuses to start with this config.", explanation: "It starts fine — Spring trusts you. That's why this is a bug class, not a config error." },
          ]}
        />

        <Quiz
          question="You add a custom AuthFilter and a custom AuditFilter to a route. AuditFilter must log the authenticated principal. The principal shows up as null in audit logs. Most likely cause?"
          options={[
            { label: "The filters run in parallel — the audit filter is racing the auth filter.", explanation: "Spring Cloud Gateway runs filters serially within a request, not in parallel." },
            { label: "AuditFilter runs before AuthFilter — its order value is too low.", correct: true, explanation: "Yes. Filter order determines pre-filter execution order. The audit filter's pre-stage runs before auth has populated the principal. Either reorder the filters or do the audit logging in the post stage." },
            { label: "Spring Cloud Gateway doesn’t propagate principals between filters.", explanation: "It does — the ServerWebExchange carries the security context once auth has populated it." },
            { label: "AuditFilter must be a GlobalFilter to see the principal.", explanation: "Global vs gateway-scoped doesn't affect access to the security context. Order does." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Predicates decide if a route matches. Filters transform the request and response. Order is everything when filters compose."
          points={[
            { takeaway: "First matching route wins — predicate order matters as much as filter order.", detail: "Put more specific routes (longer paths, more predicates) before catch-all routes. A /api/** before /api/payments/** will eat all your payment traffic." },
            { takeaway: "Retry on non-idempotent verbs is a duplicate-side-effect waiting to happen.", detail: "Either scope Retry to safe methods, or only enable it where downstream services honor idempotency keys. Don’t enable it globally and forget." },
            { takeaway: "Custom filters extend AbstractGatewayFilterFactory, define a Config, return a GatewayFilter lambda.", detail: "The Config inner class is required by the factory contract even when it has no fields. The filter chain is reactive — you wrap chain.filter(exchange).then(...) for post-filter work." },
            { takeaway: "Reach for global filters only when something must apply to every route, no exceptions.", detail: "Per-route filters are visible in config and easier to reason about. Global filters become invisible coupling — six months later nobody remembers why every request gets that header." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="spring-cloud-gateway" id="production" title="Part 3 · Rate limit, JWT, resilience" xp={35}>
        <h3>Edge rate limiting with Redis</h3>
        <p>
          The single most valuable thing the gateway does is reject traffic before it costs you anything. Spring Cloud Gateway ships with a Redis-backed token bucket — the <code>RequestRateLimiter</code> filter — that enforces consistent limits across all gateway instances.
        </p>
        <p>
          You need three pieces: the filter (built-in), a <code>RedisRateLimiter</code> bean (defines replenish + burst capacity), and a <code>KeyResolver</code> bean (defines what to rate-limit on — user, IP, API key).
        </p>
        <CodeBlock lang="plain">{`@Configuration
public class RateLimitConfig {

  /**
   * Rate-limit by authenticated user ID. Falls back to IP for unauth'd requests
   * (login, public endpoints).
   */
  @Bean
  public KeyResolver userKeyResolver() {
    return exchange -> exchange.getPrincipal()
        .map(Principal::getName)
        .switchIfEmpty(Mono.fromCallable(() -> {
          String ip = exchange.getRequest().getRemoteAddress() != null
              ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
              : "unknown";
          return "ip:" + ip;
        }));
  }

  /**
   * Token bucket: 100 req/sec sustained, 200 burst.
   * requestedTokens defaults to 1 — each request consumes one token.
   */
  @Bean
  public RedisRateLimiter redisRateLimiter() {
    return new RedisRateLimiter(
        100,   // replenishRate: tokens added per second
        200,   // burstCapacity: max tokens in the bucket
        1      // requestedTokens per request
    );
  }
}`}</CodeBlock>

        <CodeBlock lang="java">{`spring:
  cloud:
    gateway:
      routes:
        - id: payments-route
          uri: lb://payments-svc
          predicates:
            - Path=/api/payments/**
          filters:
            - StripPrefix=2
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200
                key-resolver: "#{@userKeyResolver}"`}</CodeBlock>

        <Callout variant="spring" title="Token bucket, not leaky bucket">
          <p className="m-0">
            <code>RedisRateLimiter</code> is a token bucket implemented as a Redis Lua script. It allows bursts up to <code>burstCapacity</code> while enforcing a long-run rate of <code>replenishRate</code>. The Lua script runs atomically inside Redis, so all gateway instances share the same view of the bucket. No coordination protocol needed — Redis is the coordinator.
          </p>
        </Callout>

        <h3>JWT validation at the edge</h3>
        <p>
          The gateway should validate the JWT once. Internal services should trust the validated identity from the gateway and not re-validate. (They might still authorize — &quot;is this user allowed to do this thing&quot; — but signature checking happens at the edge.)
        </p>
        <p>
          Spring Security WebFlux gives you JWT validation in a few lines. The gateway becomes an OAuth2 resource server:
        </p>
        <CodeBlock lang="plain">{`@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

  @Bean
  public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
    return http
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .authorizeExchange(ex -> ex
            .pathMatchers("/actuator/health", "/api/auth/**").permitAll()
            .pathMatchers("/api/admin/**").hasAuthority("SCOPE_admin")
            .anyExchange().authenticated())
        .oauth2ResourceServer(o -> o.jwt(jwt -> jwt
            .jwtDecoder(jwtDecoder())))
        .build();
  }

  @Bean
  public ReactiveJwtDecoder jwtDecoder() {
    // Validates against your IdP's JWKS endpoint (Auth0, Keycloak, Cognito, etc.)
    return ReactiveJwtDecoders.fromIssuerLocation("https://idp.example.com");
  }
}`}</CodeBlock>

        <h3>Identity propagation downstream</h3>
        <p>
          After validation, the gateway extracts what downstream services need (user ID, tenant, scopes) and stamps it as plain headers. Downstream services trust these headers because the gateway is the only ingress — and you&apos;ve made sure of that with network policy or a service mesh.
        </p>
        <CodeBlock lang="java">{`@Component
public class IdentityPropagationFilterFactory
    extends AbstractGatewayFilterFactory<IdentityPropagationFilterFactory.Config> {

  public IdentityPropagationFilterFactory() { super(Config.class); }

  @Override
  public GatewayFilter apply(Config config) {
    return (exchange, chain) -> exchange.getPrincipal()
        .cast(JwtAuthenticationToken.class)
        .map(auth -> {
          Jwt jwt = auth.getToken();
          String userId = jwt.getSubject();
          String tenant = jwt.getClaimAsString("tenant_id");
          String scopes = String.join(" ", auth.getAuthorities().stream()
              .map(GrantedAuthority::getAuthority).toList());

          ServerHttpRequest mutated = exchange.getRequest().mutate()
              .header("X-User-Id", userId)
              .header("X-Tenant-Id", tenant != null ? tenant : "")
              .header("X-Scopes", scopes)
              // Strip the original Authorization header so downstream
              // can't accidentally rely on the raw JWT.
              .headers(h -> h.remove(HttpHeaders.AUTHORIZATION))
              .build();
          return exchange.mutate().request(mutated).build();
        })
        .defaultIfEmpty(exchange)
        .flatMap(chain::filter);
  }

  public static class Config {}
}`}</CodeBlock>

        <Callout variant="warn" title="Strip the JWT or relay it — pick one">
          <p className="m-0">
            Either remove the <code>Authorization</code> header at the gateway and replace it with trusted ID headers (shown above), OR forward the JWT downstream and have services validate it themselves. Doing both is the worst option — services half-trust headers, half-trust the token, and inconsistencies become security bugs. Pick a pattern and enforce it across the fleet.
          </p>
        </Callout>

        <h3>Circuit breakers and retries</h3>
        <p>
          Spring Cloud Gateway integrates with Resilience4j out of the box. Configure circuit breakers per route — when downstream is failing, open the circuit and serve a fallback fast instead of piling up failed requests on slow timeouts.
        </p>
        <CodeBlock lang="java">{`spring:
  cloud:
    gateway:
      routes:
        - id: payments-route
          uri: lb://payments-svc
          predicates:
            - Path=/api/payments/**
          filters:
            - name: CircuitBreaker
              args:
                name: paymentsCB
                fallbackUri: forward:/fallback/payments
            - name: Retry
              args:
                retries: 2
                methods: GET           # only retry idempotent verbs
                statuses: BAD_GATEWAY,SERVICE_UNAVAILABLE
                backoff:
                  firstBackoff: 100ms
                  maxBackoff: 2s
                  factor: 2
                  basedOnPreviousValue: false

resilience4j.circuitbreaker:
  instances:
    paymentsCB:
      slidingWindowSize: 20
      minimumNumberOfCalls: 10
      failureRateThreshold: 50
      waitDurationInOpenState: 30s
      permittedNumberOfCallsInHalfOpenState: 3`}</CodeBlock>

        <p>
          The fallback can be another gateway route that returns a static response, or a tiny controller in the gateway itself:
        </p>
        <CodeBlock lang="java">{`@RestController
public class FallbackController {

  @GetMapping("/fallback/payments")
  public Mono<ResponseEntity<Map<String, Object>>> paymentsFallback() {
    return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .header("Retry-After", "30")
        .body(Map.of(
            "type", "https://errors.example.com/upstream-down",
            "title", "Payments temporarily unavailable",
            "status", 503,
            "retryable", true
        )));
  }
}`}</CodeBlock>

        <Callout variant="insight" title="The retry-inside-circuit-breaker subtlety">
          <p className="m-0">
            Filter order matters here. If <code>Retry</code> wraps <code>CircuitBreaker</code>, every retry counts as a separate call to the breaker — three retries can flip the breaker open by themselves. If <code>CircuitBreaker</code> wraps <code>Retry</code>, the breaker sees the final outcome of the retried sequence as a single call. The latter is almost always what you want. Spring Cloud Gateway&apos;s default ordering puts <code>CircuitBreaker</code> outside <code>Retry</code> — verify it for your version with the route filter chain dump.
          </p>
        </Callout>

        <h3>Observability: the non-negotiables</h3>
        <ul>
          <li><strong>Metrics:</strong> request count, status code distribution, p50/p95/p99 latency, per-route. Micrometer + your TSDB.</li>
          <li><strong>Tracing:</strong> propagate <code>traceparent</code> (W3C Trace Context) end-to-end. Spring Cloud Sleuth (or Micrometer Tracing in newer versions) handles this if you enable it.</li>
          <li><strong>Logs:</strong> structured JSON, with correlation ID, user ID, route ID, status, duration. Don’t log the entire request body — payloads contain PII.</li>
          <li><strong>Rate-limit metrics:</strong> tokens consumed, rejections per key. If you can&apos;t graph the top 10 rate-limited users, you can&apos;t debug noisy neighbors.</li>
        </ul>

        <Quiz
          question="A team complains their /api/orders endpoint is being rate-limited even though their service has plenty of capacity. You check Redis — the bucket for their API key is exhausted. What's the most likely fix?"
          options={[
            { label: "Increase replenishRate and burstCapacity for that route only.", explanation: "Possible, but you need to know WHY they're hitting the limit before raising it. Otherwise you're papering over a real issue." },
            { label: "Disable rate limiting for that route.", explanation: "Almost never the right answer — you lose the noisy-neighbor protection that the limit exists for." },
            { label: "Investigate first: who’s sending the traffic, is it expected, is the KeyResolver bucketing correctly?", correct: true, explanation: "Right. A ‘rate limit too low’ complaint is sometimes a real capacity request, sometimes a runaway client, sometimes a wrong KeyResolver bucketing all users into one key. Diagnose before tuning." },
            { label: "Switch from Redis token bucket to in-memory rate limiting.", explanation: "That just makes per-instance limits inconsistent. The Redis bucket is correct; the question is what limit and what key." },
          ]}
        />

        <Quiz
          question="You enable JWT validation at the gateway and propagate X-User-Id and X-Tenant-Id headers. What MUST be true for this pattern to be secure?"
          options={[
            { label: "Downstream services must also re-validate the JWT signature.", explanation: "If they re-validate, you've duplicated work. The point of edge offload is doing it once." },
            { label: "The gateway must be the only ingress to the internal network — services must not be reachable from clients directly.", correct: true, explanation: "Yes. The trust model is: services trust gateway-stamped headers because the gateway is the only thing that can reach them. Enforce with network policy, mesh mTLS, or VPC isolation. If a client can hit the service directly, they can spoof the headers." },
            { label: "Only Java services can trust gateway headers; other languages must validate the JWT themselves.", explanation: "Language doesn't matter — the trust model is about network topology, not implementation." },
            { label: "Headers must be signed by the gateway with a shared secret.", explanation: "Possible but rare — most teams rely on network isolation and mTLS rather than per-header signatures." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The production gateway does three jobs better than anyone else: edge rate limiting, JWT offload, coarse resilience. Each has a sharp edge."
          points={[
            { takeaway: "Redis-backed token bucket is the standard for cross-instance rate limiting.", detail: "RedisRateLimiter + KeyResolver. Bucket on user ID for authenticated traffic, fall back to IP for unauthenticated. Always graph rejections by key." },
            { takeaway: "JWT validation belongs at the edge; identity is propagated as trusted headers.", detail: "Strip the original Authorization header, stamp X-User-Id / X-Tenant-Id / X-Scopes. The trust model requires the gateway to be the only ingress — enforce with network policy." },
            { takeaway: "Circuit breaker outside, retry inside.", detail: "If retry wraps the breaker, retries flip the breaker open prematurely. Default Spring Cloud Gateway ordering is correct — but verify, because filter ordering bugs are silent." },
            { takeaway: "Observability is the difference between a debuggable gateway and a black box.", detail: "Metrics (per-route latency + status), tracing (W3C trace context propagation), structured logs with correlation IDs. Skip these and your first incident is going to teach you why they matter." },
          ]}
        />
      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <h3 className="font-bold text-lg mt-0 mb-2">Up next</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          The gateway handles synchronous traffic. The next module looks at the asynchronous side: <Link href="/courses/system-design/modules/message-queues" className="text-cyan-600 hover:underline">message queues</Link> — delivery semantics, ordering, dead-letter queues, and the SQS / RabbitMQ / Kafka decision.
        </p>
      </section>
    </article>
  );
}
