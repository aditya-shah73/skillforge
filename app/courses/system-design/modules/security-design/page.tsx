import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "authn-authz", title: "AuthN/AuthZ" },
  { id: "secrets-mtls", title: "Secrets & mTLS" },
  { id: "owasp", title: "OWASP" },
  { id: "pii", title: "PII & deletion" },
  { id: "modern-auth", title: "Modern auth depth" },
];

const oauthFlow = `sequenceDiagram
  participant U as User
  participant C as Client App
  participant A as Auth Server
  participant R as Resource API
  U->>C: Login
  C->>A: Authorization request (PKCE)
  A->>U: Login + consent
  U->>A: Approve
  A->>C: Authorization code
  C->>A: Exchange code + verifier
  A->>C: Access token (JWT) + refresh token
  C->>R: GET /resource (Bearer JWT)
  R->>R: Verify signature, exp, scopes
  R->>C: 200 OK`;

const mtlsFlow = `flowchart LR
  A[Service A] -->|presents cert| B[Service B]
  B -->|presents cert| A
  A -.verifies.-> CA[Internal CA]
  B -.verifies.-> CA
  A <-->|encrypted + authenticated| B`;

const authTiers = `flowchart LR
  C[Browser/SPA<br/>access token in memory<br/>refresh in HttpOnly cookie] -->|HTTPS| E[Edge / Gateway<br/>JWT signature + basic claims]
  E --> B[BFF<br/>holds session cookie<br/>mints svc tokens]
  B -->|service JWT<br/>aud=orders| O[Orders Service]
  B -->|service JWT<br/>aud=billing| BI[Billing Service]
  O -->|validates aud, scope, exp| O
  BI -->|validates aud, scope, exp| BI`;

const refreshRotation = `sequenceDiagram
  participant C as Client
  participant A as Auth Server
  Note over C,A: Initial login
  C->>A: code + verifier
  A->>C: AT1 (5 min) + RT1 (family=F1, gen=1)
  Note over C,A: Normal refresh
  C->>A: RT1
  A->>A: mark RT1 used, issue gen=2
  A->>C: AT2 + RT2 (family=F1, gen=2)
  Note over C,A: Attacker tries stolen RT1
  C->>A: RT1 (already used!)
  A->>A: REUSE DETECTED — kill family F1
  A->>C: 401 + force re-login`;

export default function Page() {
  const mod = getModuleBySlug("security-design")!;

  return (
    <article className="prose-custom">
      <BookmarkButton courseId="system-design" moduleSlug="security-design" />
      <ModuleProgress moduleSlug="security-design" checkpoints={CHECKPOINTS} />
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
      </header>

      <section className="my-8">
        <p className="lead">
          Security in system design isn&apos;t a chapter you bolt on at the end. It&apos;s woven into every box on the
          diagram. Who&apos;s allowed to call this service? How do we prove the call came from them and not someone
          forging headers? Where do the secrets live? What happens when an attacker gets one piece, can they pivot to
          everything?
        </p>

        <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase">What you&apos;ll walk out with</p>
          <ul className="space-y-2 text-sm">
            <li>A working mental model for AuthN vs AuthZ, and why JWTs aren&apos;t a silver bullet.</li>
            <li>Where secrets actually go (hint: not in your repo, not in your config map either).</li>
            <li>mTLS in plain English, when it earns its keep, when it&apos;s overkill.</li>
            <li>The OWASP categories that actually bite system designs (BOLA, SSRF, misconfig).</li>
            <li>How to design for PII without painting yourself into a GDPR corner.</li>
          </ul>
        </div>
      </section>

      {/* ============================== PART 1 ============================== */}
      <section className="my-12">
        <h2 className="mb-4 text-2xl font-bold">Part 1, AuthN and AuthZ are not the same thing</h2>
        <p>
          Authentication answers <em>who are you</em>. Authorization answers <em>what are you allowed to do</em>. Mix
          them up and you build systems where logging in implicitly grants access to everything, which is exactly the
          shape of every breach you read about in the news.
        </p>

        <Callout variant="insight" title="The two-question rule">
          Every request crossing a trust boundary should answer both questions explicitly. &quot;Is this caller
          authenticated?&quot; AND &quot;Is this caller authorized for <em>this specific resource</em>?&quot; Skip the
          second one and you ship BOLA.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Sessions vs tokens vs JWTs</h3>
        <p>Three flavors of authentication state you&apos;ll encounter:</p>
        <ul className="space-y-2">
          <li>
            <strong>Server sessions.</strong>{" "}Cookie holds an opaque ID. State lives in Redis or a session store.
            Revocation is trivial, delete the row. Downside: shared session store becomes a hot dependency.
          </li>
          <li>
            <strong>Opaque tokens.</strong>{" "}Like sessions but the lookup happens at an auth service via introspection.
            Decoupled from your apps but adds a network hop per request (or a cache).
          </li>
          <li>
            <strong>JWTs.</strong>{" "}Self-contained. Signature proves authenticity, claims carry identity and scopes.
            Zero lookup overhead. Downside: revocation is hard. Until expiry, that token is valid.
          </li>
        </ul>

        <Callout variant="warn" title="JWTs aren't magic">
          People reach for JWTs because they sound &quot;stateless&quot; and &quot;modern.&quot; But if you need to
          revoke access immediately when someone is fired, a 1-hour-TTL JWT means up to an hour of lingering access.
          Either accept that, keep TTLs short with refresh tokens, or maintain a denylist (which puts the state back).
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">OAuth2 + OIDC, end to end</h3>
        <p>
          OAuth2 is the authorization framework. OIDC layers identity on top. The flow most modern apps use is
          Authorization Code with PKCE:
        </p>

        <Mermaid chart={oauthFlow} />

        <p className="mt-4">
          The PKCE step (proof key for code exchange) is what stops an attacker who steals the authorization code from
          the redirect URL from being able to exchange it. The client proves it&apos;s the same one that started the
          flow.
        </p>

        <CodeBlock lang="java" caption="Spring Security, OAuth2 resource server validating JWTs">{`@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain api(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/health").permitAll()
        .requestMatchers("/api/admin/**").hasAuthority("SCOPE_admin")
        .anyRequest().authenticated())
      .oauth2ResourceServer(oauth -> oauth
        .jwt(jwt -> jwt.jwtAuthenticationConverter(scopeConverter())));
    return http.build();
  }

  @Bean
  JwtDecoder jwtDecoder() {
    // Validates signature against issuer's JWKS, checks exp/iss/aud
    return JwtDecoders.fromIssuerLocation("https://auth.example.com");
  }
}`}</CodeBlock>

        <Callout variant="spring" title="The audience claim is not optional">
          A JWT minted for service-A will work fine against service-B if service-B only checks signature and expiry.
          Always validate <code>aud</code> (audience). Otherwise a token leaking from one system grants access to
          another.
        </Callout>

        <Checkpoint moduleSlug="security-design" id="authn-authz" title="AuthN/AuthZ checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="Your service uses 1-hour JWTs. A user is fired at 2pm. When do they lose API access in the worst case?"
            options={[
              { label: "Immediately, JWTs revoke instantly", correct: false, explanation: "JWTs are self-contained. There is no revocation hook unless you build one." },
              { label: "Up to 1 hour later, when the token expires", correct: true, explanation: "Right. Stateless tokens grant access until expiry. Short TTLs + refresh tokens, or a denylist, are how you tighten this." },
              { label: "Within a few seconds via the auth server", correct: false, explanation: "That would be true for opaque tokens with introspection, not stateless JWTs." },
            ]}
            hint="The whole point of a JWT is no lookup."
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="A legacy endpoint accepts any signed JWT from your IdP. Why is this dangerous even though signatures are valid?"
            options={[
              { label: "Signatures can be forged easily", correct: false, explanation: "Properly signed JWTs (RS256) cannot be forged without the private key." },
              { label: "A token minted for a different service can be replayed against this one", correct: true, explanation: "Exactly. Without checking the audience claim, a token from service A grants access to service B. Always validate aud." },
              { label: "JWTs expire too quickly to be useful", correct: false, explanation: "Expiry is configurable and not the issue here." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 1 recap"
          gist="AuthN proves identity, AuthZ enforces what they can do. Pick your token model with eyes open."
          points={[
            { takeaway: "Sessions revoke instantly; JWTs do not.", detail: "Choose based on revocation requirements, not buzzword fit." },
            { takeaway: "PKCE protects the auth code grant from interception.", detail: "Always use it for public clients (SPAs, mobile)." },
            { takeaway: "Validate signature, expiry, issuer, AND audience.", detail: "Skipping aud is the most common JWT mistake." },
          ]}
        />
      </section>

      {/* ============================== PART 2 ============================== */}
      <section className="my-12">
        <h2 className="mb-4 text-2xl font-bold">Part 2, Secrets, certs, and mTLS</h2>
        <p>
          Authentication for users is one problem. Authentication between services is another. And the substrate for
          both is secrets, passwords, API keys, signing keys, cert private keys. Where they live, how they rotate, and
          who can read them is half the battle.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Where secrets do NOT belong</h3>
        <ul className="space-y-2">
          <li><strong>Source control.</strong>{" "}Once it&apos;s in git history, it&apos;s public. Rotate it.</li>
          <li><strong>Plain config maps / environment files committed to repos.</strong>{" "}Same problem.</li>
          <li><strong>Hardcoded in container images.</strong>{" "}Anyone with image pull rights has the secret.</li>
          <li><strong>Logged.</strong>{" "}Yes, this still happens. Scrub headers, redact bodies.</li>
        </ul>

        <Callout variant="warn" title="Detection beats prevention here">
          Pre-commit hooks (gitleaks, truffleHog) and CI scanning will catch the obvious leaks. But assume secrets WILL
          get committed eventually. Plan rotation and revocation as if it&apos;s a Tuesday, not an emergency.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Where secrets DO belong</h3>
        <p>A dedicated secrets manager: HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Kubernetes External Secrets, etc. The shape:</p>

        <CodeBlock lang="plain" caption="Spring Boot pulling secrets from Vault at startup">{`# application.yml
spring:
  cloud:
    vault:
      uri: https://vault.internal:8200
      authentication: KUBERNETES
      kubernetes:
        role: my-service
        service-account-token-file: /var/run/secrets/kubernetes.io/serviceaccount/token
      kv:
        enabled: true
        backend: secret
        default-context: my-service

# Now @Value("\${db.password}") loads from Vault path secret/my-service/db.password
# No secret in image, no secret in git, rotates with TTL leases`}</CodeBlock>

        <p>
          Notice the chain of trust: the pod has a service account token (mounted by k8s), Vault verifies that token
          with the k8s API, then issues a short-lived secret lease. No long-lived credential anywhere on disk.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Service-to-service: mTLS</h3>
        <p>
          For human-to-service auth you have OAuth. For service-to-service auth inside your network, mTLS is the gold
          standard. Both sides present certs. Both sides verify. The TLS handshake itself becomes the authentication.
        </p>

        <Mermaid chart={mtlsFlow} />

        <ul className="mt-4 space-y-2">
          <li><strong>What it gives you:</strong>{" "}encryption + mutual authentication, baked into the connection.</li>
          <li><strong>Cost:</strong>{" "}certificate lifecycle. Issuance, rotation, revocation, CA management.</li>
          <li><strong>Realistic deployment:</strong>{" "}Istio / Linkerd handle this transparently via sidecars. Cert-manager + an internal CA if you&apos;re rolling your own.</li>
        </ul>

        <Callout variant="info" title="Don't build your own CA">
          Operating a private CA properly (HSM-backed root, offline intermediates, CRL/OCSP infrastructure) is a
          full-time job. Use a service mesh, use cert-manager, use AWS Private CA, don&apos;t roll your own.
        </Callout>

        <Checkpoint moduleSlug="security-design" id="secrets-mtls" title="Secrets & mTLS checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="A teammate suggests storing the Stripe API key in your Helm values.yaml committed to git, encrypted with sops. Is this OK?"
            options={[
              { label: "No, secrets should never touch git", correct: false, explanation: "Encrypted secrets in git (sops, sealed-secrets) is a legitimate pattern. The key is that the encryption key itself is held outside git." },
              { label: "Yes, if the sops key is in a KMS that only deploy roles can decrypt", correct: true, explanation: "Right. The git artifact is ciphertext; the decryption authority lives in a KMS with proper access control. This is GitOps-friendly secret management." },
              { label: "Only if the repository is private", correct: false, explanation: "Repo privacy is a weak control. The encryption is what matters." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="When does mTLS earn its complexity over plain TLS + bearer token?"
            options={[
              { label: "Always, TLS without mTLS is insecure", correct: false, explanation: "Plain TLS plus a properly validated bearer token is fine for many systems." },
              { label: "When you need mutual authentication at the connection layer with no shared bearer secret", correct: true, explanation: "Right. mTLS authenticates both sides cryptographically without anyone passing a token in the request body or header. Great for zero-trust service meshes." },
              { label: "Only for traffic crossing the public internet", correct: false, explanation: "mTLS is most often deployed inside the cluster, not at the edge." },
            ]}
            hint="Think about what mTLS proves that bearer tokens don't."
          />
        </Checkpoint>

        <PartRecap
          title="Part 2 recap"
          gist="Secrets live in a manager with short-lived leases; service-to-service trust comes from mTLS, ideally via a mesh."
          points={[
            { takeaway: "Plan for secret leakage, not against it.", detail: "Rotation is the real defense. Make it cheap and routine." },
            { takeaway: "Vault-style auth chains identity (k8s SA → Vault → secret).", detail: "No long-lived credentials on disk." },
            { takeaway: "mTLS makes the connection itself the auth.", detail: "Pair it with a service mesh so you don't manage certs by hand." },
          ]}
        />
      </section>

      {/* ============================== PART 3 ============================== */}
      <section className="my-12">
        <h2 className="mb-4 text-2xl font-bold">Part 3, The OWASP categories that actually bite</h2>
        <p>
          The OWASP API Security Top 10 reads like a litany of design failures. Most of them aren&apos;t exotic
          attacks, they&apos;re missed checks. Here are the ones that show up in real system design reviews:
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">BOLA, Broken Object-Level Authorization</h3>
        <p>
          Number one on the list, and the most common. Endpoint <code>GET /api/orders/{`{id}`}</code> authenticates the
          caller but doesn&apos;t check that the order belongs to them. Caller swaps the ID and reads someone
          else&apos;s data.
        </p>

        <CodeBlock lang="java" caption="BOLA, wrong vs right">{`// WRONG — authenticates but doesn't authorize
@GetMapping("/orders/{id}")
public Order get(@PathVariable Long id) {
  return orderRepo.findById(id).orElseThrow();
}

// RIGHT — checks ownership
@GetMapping("/orders/{id}")
public Order get(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
  Order o = orderRepo.findById(id).orElseThrow();
  if (!o.getUserId().equals(jwt.getSubject())) {
    throw new AccessDeniedException("not yours");
  }
  return o;
}`}</CodeBlock>

        <Callout variant="warn" title="BOLA scales with object count">
          Every endpoint that takes an ID is a BOLA risk. Don&apos;t check ownership in every controller, push it down
          into a query filter or aspect. <code>WHERE user_id = :caller</code> in the repository is hard to forget.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">SSRF, Server-Side Request Forgery</h3>
        <p>
          Your service accepts a URL and fetches it (image upload from URL, webhook config, link preview). Attacker
          sends <code>http://169.254.169.254/latest/meta-data/</code>, the AWS instance metadata endpoint, and your
          server happily fetches it and returns IAM credentials.
        </p>

        <ul className="space-y-2">
          <li>Block private IP ranges (RFC1918, 169.254.0.0/16, 127.0.0.0/8) at fetch time.</li>
          <li>Validate after DNS resolution, attacker DNS can return a private IP.</li>
          <li>Use IMDSv2 on AWS, requires a session token, kills naive SSRF against metadata.</li>
          <li>Egress proxy with allowlist for outbound calls if you can swing it.</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Injection, still alive in 2026</h3>
        <p>
          SQL injection via concatenation. Command injection via shelling out. LDAP injection. Template injection. The
          fix is always the same: parameterize, don&apos;t concatenate. ORMs help. Prepared statements help. String
          formatting with user input ends careers.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Security misconfiguration</h3>
        <p>
          The breach you don&apos;t see coming. Open S3 buckets. Default admin passwords. CORS set to <code>*</code>.
          Debug endpoints exposed to the internet. Stack traces in production responses. The fix is automation,
          benchmarks (CIS), policy-as-code (OPA, Kyverno), and continuous scanning.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Insufficient logging &amp; monitoring</h3>
        <p>
          The category that turns a 1-day breach into a 6-month one. If you can&apos;t see who logged in, what data
          they accessed, and what changed, you can&apos;t respond. Log auth events, admin actions, and access to
          sensitive data. Alarm on anomalies.
        </p>

        <ClassifyChallenge
          title="OWASP triage"
          prompt="Drop each finding into the OWASP category that best describes it."
          buckets={[
            { id: "bola", label: "BOLA", color: "rose" },
            { id: "injection", label: "Injection", color: "amber" },
            { id: "ssrf", label: "SSRF", color: "emerald" },
            { id: "misconfig", label: "Misconfiguration", color: "indigo" },
            { id: "logging", label: "Logging gap", color: "sky" },
          ]}
          items={[
            { id: "i1", label: "Endpoint /users/{id} returns any user when called by an authenticated session", answer: "bola", explanation: "Auth without ownership check, textbook BOLA." },
            { id: "i2", label: "Search field passes user input directly into a LIKE clause built by string concat", answer: "injection", explanation: "Classic SQLi vector. Parameterize the query." },
            { id: "i3", label: "Webhook config accepts arbitrary URLs and POSTs to them on event", answer: "ssrf", explanation: "Server fetching attacker-controlled URLs is SSRF, block private ranges and metadata IPs." },
            { id: "i4", label: "S3 bucket containing customer exports is set to public-read", answer: "misconfig", explanation: "Misconfig. Bucket policies + Block Public Access at the account level." },
            { id: "i5", label: "Login attempts and password resets are not recorded anywhere", answer: "logging", explanation: "No auth audit trail = no breach detection. Always log auth events." },
          ]}
        />

        <Checkpoint moduleSlug="security-design" id="owasp" title="OWASP checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="Which is the most reliable place to enforce object-level ownership in a Spring app?"
            options={[
              { label: "In every controller method, manually", correct: false, explanation: "Manual checks are forgotten. One missed endpoint is a breach." },
              { label: "In a global filter that scans request paths", correct: false, explanation: "A path filter doesn't know the data model. Brittle and easy to bypass." },
              { label: "At the repository / query layer, scoped by caller identity", correct: true, explanation: "Right. WHERE user_id = :caller in the query layer means there's no path to data you don't own. Hard to forget, hard to bypass." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Your URL fetcher blocks 169.254.169.254. An attacker bypasses it. How?"
            options={[
              { label: "By using HTTPS instead of HTTP", correct: false, explanation: "Protocol doesn't matter for SSRF target validation." },
              { label: "By submitting a hostname whose DNS resolves to 169.254.169.254", correct: true, explanation: "Right. String matching on the URL is fooled by DNS. You must validate the resolved IP at fetch time, not the input string." },
              { label: "By URL-encoding the IP", correct: false, explanation: "Encoding the literal IP is a stale bypass; modern parsers handle this." },
            ]}
            hint="Static analysis of a URL doesn't see what DNS will return."
          />
        </Checkpoint>

        <PartRecap
          title="Part 3 recap"
          gist="Most breaches are missed checks, not exotic attacks. Push enforcement to layers that are hard to forget."
          points={[
            { takeaway: "BOLA: check ownership in the query, not the controller.", detail: "WHERE user_id = :caller is harder to forget than an if-statement." },
            { takeaway: "SSRF: validate the resolved IP, not the input URL.", detail: "DNS rebinding will eat your string filter for breakfast." },
            { takeaway: "Logging is part of security.", detail: "If you can't see it happen, you can't respond to it." },
          ]}
        />
      </section>

      {/* ============================== PART 4 ============================== */}
      <section className="my-12">
        <h2 className="mb-4 text-2xl font-bold">Part 4, PII, encryption, and designing for deletion</h2>
        <p>
          Personal data shows up everywhere, emails, names, addresses, payment details, IP addresses. Modern
          regulations (GDPR, CCPA, etc.) treat it as a liability you have to manage explicitly, not just data you
          happen to have.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Encryption at rest, in transit, in use</h3>
        <ul className="space-y-2">
          <li>
            <strong>In transit.</strong>{" "}TLS everywhere, between client and edge, between services, between service
            and database. No exceptions, even on private networks.
          </li>
          <li>
            <strong>At rest.</strong>{" "}Disk-level encryption is table stakes (every cloud provider does it). Application-
            level encryption for sensitive columns is the next tier, even a stolen DB dump is useless without the key.
          </li>
          <li>
            <strong>In use.</strong>{" "}Hardest. Confidential computing, enclaves, homomorphic encryption are emerging.
            For most systems, you minimize how long PII sits decrypted in memory.
          </li>
        </ul>

        <CodeBlock lang="java" caption="AES-GCM for column-level encryption with KMS-managed keys">{`public class PiiCrypto {
  private final KmsClient kms;
  private final String keyId;

  public byte[] encrypt(String plaintext, String context) {
    // Data-encryption key from KMS, scoped by context (e.g. user id)
    GenerateDataKeyResponse dk = kms.generateDataKey(b -> b
      .keyId(keyId)
      .keySpec(DataKeySpec.AES_256)
      .encryptionContext(Map.of("ctx", context)));

    SecretKey key = new SecretKeySpec(dk.plaintext().asByteArray(), "AES");
    byte[] iv = new byte[12];
    new SecureRandom().nextBytes(iv);

    Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
    c.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
    byte[] ct = c.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

    // Store: encrypted-DEK || IV || ciphertext
    return concat(dk.ciphertextBlob().asByteArray(), iv, ct);
  }
}`}</CodeBlock>

        <p className="mt-4">
          The pattern: KMS holds the master key (you never see it), it issues per-record data-encryption keys, and the
          encrypted DEK is stored alongside the ciphertext. To decrypt, you ask KMS to unwrap the DEK, which gives you
          a clean audit log of every decryption.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">The right to be forgotten</h3>
        <p>
          GDPR Article 17 says users can demand deletion. Sounds simple. Then you remember:
        </p>
        <ul className="space-y-2">
          <li>Backups (immutable for 30 days).</li>
          <li>Analytics warehouses (denormalized copies everywhere).</li>
          <li>Audit logs (legally required to retain).</li>
          <li>Search indexes, caches, CDC streams.</li>
          <li>Third parties you forwarded the data to.</li>
        </ul>

        <Callout variant="insight" title="Crypto-shredding">
          Per-user encryption keys make deletion tractable. Throw away the key and the ciphertext is permanently
          unreadable, even in immutable backups. You haven&apos;t physically deleted the bytes, but you&apos;ve made
          them inaccessible, which most regulators accept.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Data minimization</h3>
        <p>
          The cheapest way to handle PII is not to have it. Don&apos;t collect what you don&apos;t need. Tokenize early
          (Stripe-style) so payment data never lives in your DB. Anonymize for analytics. Hash identifiers when joining
          datasets across boundaries.
        </p>

        <Checkpoint moduleSlug="security-design" id="pii" title="PII checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="A user requests deletion under GDPR. Your DB has 30-day immutable backups. What's the most pragmatic answer?"
            options={[
              { label: "Restore each backup, delete the row, re-snapshot, within 30 days", correct: false, explanation: "Operationally absurd and expensive. Regulators don't expect this." },
              { label: "Delete from live systems and use crypto-shredding so backup data is unreadable", correct: true, explanation: "Right. Per-user keys + key destruction make backup data useless without violating retention. This is the standard GDPR-compliant pattern." },
              { label: "Wait 30 days for backups to roll off, then confirm deletion", correct: false, explanation: "GDPR has a 30-day response window, this is borderline but creates risk if user data is accessed during the wait." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Your team wants to add user phone numbers to a new analytics dashboard. What's the right design instinct?"
            options={[
              { label: "Add the column, encrypt at rest, ship it", correct: false, explanation: "You've added PII and the deletion/access burden that comes with it. Ask why the dashboard needs it." },
              { label: "Ask whether the dashboard genuinely needs phone numbers, or just a count", correct: true, explanation: "Right. Data minimization. Most analytics needs are aggregate, not personal. The cheapest PII is none." },
              { label: "Hash the phone numbers before display", correct: false, explanation: "Hashing identifiers is fine for joins but doesn't help if the dashboard actually shows them." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 4 recap"
          gist="PII is a liability, encrypt aggressively, design deletion in from day one, and don't collect what you don't need."
          points={[
            { takeaway: "Per-record DEKs from KMS give you fine-grained control + audit.", detail: "And per-user keys enable crypto-shredding for deletion." },
            { takeaway: "Deletion has to traverse backups, analytics, caches, third parties.", detail: "Crypto-shredding is the only sane answer at scale." },
            { takeaway: "Data minimization is the cheapest security control.", detail: "Don't collect, don't store, don't worry about." },
          ]}
        />
      </section>

      {/* ============================== PART 5 ============================== */}
      <section className="my-12">
        <h2 className="mb-4 text-2xl font-bold">Part 5, Modern auth depth: OAuth flows, tokens, CSRF, and tier placement</h2>
        <p>
          Part 1 gave you the AuthN/AuthZ split and a feel for OAuth. This part is the depth: which OAuth flow to pick
          and why, what the actual difference is between an ID token and an access token, how refresh token rotation
          works (and why it&apos;s a tripwire, not just a UX feature), what CSRF looks like in 2026 now that browsers
          ship SameSite=Lax by default, and where auth state should physically live as a request walks from the browser
          through your edge, BFF, and downstream services.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">OAuth2 flows, pick one, and only one</h3>
        <p>
          OAuth2 has a handful of grant types. In 2026, the answer is almost always Authorization Code with PKCE. The
          others are either dead, deprecated, or narrow special cases.
        </p>

        <ul className="space-y-2">
          <li>
            <strong>Authorization Code + PKCE.</strong>{" "}The default for SPAs, mobile apps, native desktop apps, and
            anything else that can&apos;t safely hold a client secret. PKCE replaces the client secret with a per-flow
            verifier the attacker can&apos;t guess.
          </li>
          <li>
            <strong>Authorization Code (classic).</strong>{" "}Server-side web apps that have a real backend with a real
            client secret. Still fine. Add PKCE anyway, defense in depth, costs nothing.
          </li>
          <li>
            <strong>Client Credentials.</strong>{" "}Service-to-service. No human in the loop. The service authenticates
            with its own client ID + secret and gets an access token scoped to itself.
          </li>
          <li>
            <strong>Implicit flow.</strong>{" "}Dead. The OAuth 2.1 draft formally removes it. Don&apos;t use it.
          </li>
          <li>
            <strong>Resource Owner Password (ROPC).</strong>{" "}User hands their password to the client. Defeats the whole
            point of OAuth (don&apos;t share passwords with apps). Reserved for legacy migration only.
          </li>
        </ul>

        <Callout variant="warn" title="Why implicit flow is dead">
          <p className="m-0">
            Implicit returned the access token directly in the URL fragment after redirect. That means the token landed
            in browser history, in HTTP referer headers, in proxy logs, and in any analytics script that read
            <code> location.hash</code>. There was no client authentication and no code exchange step, whoever saw the
            URL got the token.
          </p>
          <p className="m-0">
            PKCE killed the &quot;but SPAs can&apos;t hold secrets&quot; argument that originally justified implicit.
            Auth code + PKCE gives SPAs a safe flow with a server-side exchange. There is no remaining reason to use
            implicit.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">ID token vs access token, they answer different questions</h3>
        <p>
          OIDC layers identity on top of OAuth2. The auth server hands back two tokens after a successful login flow,
          and they are not interchangeable.
        </p>
        <ul className="space-y-2">
          <li>
            <strong>ID token (OIDC, &quot;who you are&quot;).</strong>{" "}A JWT containing user claims:
            <code> sub</code>, <code>email</code>, <code>name</code>, <code>iat</code>, <code>aud</code> = your
            client ID. The client consumes this to know who logged in. <strong>Never send an ID token to an
            API.</strong>{" "}It&apos;s addressed to the client app, not the resource server.
          </li>
          <li>
            <strong>Access token (OAuth, &quot;what you can do&quot;).</strong>{" "}A bearer credential the client sends to
            APIs. Carries scopes and an audience claim naming the resource server. The API validates signature, issuer,
            audience, expiry, and required scopes.
          </li>
        </ul>

        <CodeBlock lang="java" caption="Spring resource server, validating audience and scope">{`@Bean
JwtDecoder jwtDecoder(@Value("\${app.issuer}") String issuer,
                      @Value("\${app.audience}") String audience) {
  NimbusJwtDecoder decoder =
      JwtDecoders.fromIssuerLocation(issuer);

  OAuth2TokenValidator<Jwt> withIssuer =
      JwtValidators.createDefaultWithIssuer(issuer);

  // Audience check — reject tokens minted for a different service
  OAuth2TokenValidator<Jwt> withAudience = jwt ->
      jwt.getAudience() != null && jwt.getAudience().contains(audience)
        ? OAuth2TokenValidatorResult.success()
        : OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_audience",
              "Token aud does not include " + audience, null));

  decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience));
  return decoder;
}`}</CodeBlock>

        <Callout variant="insight" title="Don't reuse access tokens across services">
          <p className="m-0">
            If your orders service and billing service both accept the same token, a compromise in either one becomes a
            compromise of both. Mint per-audience tokens, the BFF (or a token exchange endpoint) trades the
            user&apos;s session for a token scoped to exactly the downstream it needs.
          </p>
          <p className="m-0">
            This is the same instinct as least-privilege IAM: the blast radius of any single token is bounded by its
            audience and scope.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Session vs JWT, the 2026 take</h3>
        <p>
          The mid-2010s consensus was &quot;JWT for everything, sessions are legacy.&quot; That consensus was wrong, and
          the industry is quietly walking it back. Here&apos;s the honest tradeoff.
        </p>

        <div className="my-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="mb-2 font-semibold">JWT, pros</p>
            <ul className="space-y-1 text-sm">
              <li>Stateless. No DB read per request.</li>
              <li>Trivial to scale horizontally, any node can validate.</li>
              <li>Works across origins and across services without a shared session store.</li>
              <li>Carries claims (scopes, tenant) the resource server can act on.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="mb-2 font-semibold">JWT, cons</p>
            <ul className="space-y-1 text-sm">
              <li>Can&apos;t revoke until expiry, fired user keeps access for the TTL.</li>
              <li>Bytes ride on every request. Big claims = big requests.</li>
              <li>Key rotation is a real operational chore (JWKS, kid headers, overlap windows).</li>
              <li>Footguns: alg=none, weak HS256 secrets, missing aud check.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="mb-2 font-semibold">Session, pros</p>
            <ul className="space-y-1 text-sm">
              <li>Instant revocation, delete the row, done.</li>
              <li>Tiny opaque cookie. No claim leakage.</li>
              <li>Server controls everything: roles, lockouts, step-up auth.</li>
              <li>Hard to misuse, there&apos;s no &quot;forgot to validate&quot; case.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="mb-2 font-semibold">Session, cons</p>
            <ul className="space-y-1 text-sm">
              <li>Session store is a hot dependency, Redis goes down, logins go down.</li>
              <li>Sticky sessions or a shared store needed across instances.</li>
              <li>Doesn&apos;t cross origins easily.</li>
              <li>Less natural for B2B APIs and machine clients.</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="Opinion, what to actually pick">
          <p className="m-0">
            For a first-party web app where the same org owns the frontend and the backend, sessions win. Revocation is
            free, the cookie is small, and the failure modes are well-understood. Pair with a BFF and you don&apos;t
            ever need to expose a JWT to the browser.
          </p>
          <p className="m-0">
            For B2B APIs where third parties integrate, mobile apps, and service-to-service traffic, JWT wins. There&apos;s
            no shared session store across orgs, and the stateless model fits. Just keep TTLs short (5–15 minutes) and
            rotate refresh tokens.
          </p>
          <p className="m-0">
            The &quot;JWT in localStorage for our SPA&quot; pattern that dominated 2017–2020 was the worst of both
            worlds. Move first-party SPAs to BFF + session cookie.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Refresh token rotation, and why it&apos;s a tripwire</h3>
        <p>
          The standard pattern: short-lived access token (5–15 minutes), long-lived refresh token (days to weeks). When
          the access token expires, the client posts the refresh token to the auth server and gets a new access token
          back. Simple enough.
        </p>
        <p>
          The interesting part is rotation. Each refresh exchange returns a <em>new</em>{" "}refresh token and invalidates
          the old one. If the old refresh token is ever presented again, that&apos;s a stolen-token signal, the
          attacker and the legitimate client are both holding copies. The auth server kills the entire token
          family and forces re-login.
        </p>

        <Mermaid chart={refreshRotation} />

        <CodeBlock lang="java" caption="Refresh token rotation with reuse detection (sketch)">{`@Service
public class RefreshTokenService {
  private final RefreshTokenRepository repo;

  @Transactional
  public TokenPair rotate(String presentedRefresh) {
    RefreshToken rt = repo.findByToken(hash(presentedRefresh))
        .orElseThrow(() -> new BadCredentials("unknown refresh"));

    if (rt.isRevoked() || rt.isUsed()) {
      // REUSE DETECTED — someone else used this token already
      // Kill the entire family — both legit user and attacker get logged out
      repo.revokeFamily(rt.getFamilyId());
      throw new TokenReuseDetected("family " + rt.getFamilyId() + " compromised");
    }

    if (rt.getExpiresAt().isBefore(Instant.now())) {
      throw new BadCredentials("refresh expired");
    }

    // Mark old as used, mint new in same family, increment generation
    rt.markUsed();
    RefreshToken next = RefreshToken.builder()
        .familyId(rt.getFamilyId())
        .generation(rt.getGeneration() + 1)
        .userId(rt.getUserId())
        .expiresAt(Instant.now().plus(Duration.ofDays(14)))
        .build();
    repo.save(next);

    String accessJwt = mintAccessToken(rt.getUserId(), Duration.ofMinutes(10));
    return new TokenPair(accessJwt, next.getRawToken());
  }
}`}</CodeBlock>

        <Callout variant="warn" title="Storage, where these tokens go in the browser">
          <p className="m-0">
            Refresh token: <strong>HttpOnly, Secure, SameSite=Strict cookie</strong>, scoped to the auth server&apos;s
            origin. JavaScript can&apos;t read it, so XSS can&apos;t steal it.
          </p>
          <p className="m-0">
            Access token: <strong>in memory only</strong> (a JS variable, a closure, a Redux slice, not localStorage,
            not sessionStorage). It lives 10 minutes anyway; if the page reloads, refresh fetches a fresh one.
          </p>
          <p className="m-0">
            localStorage for tokens is an XSS amplifier. One reflected XSS through any third-party script and the
            attacker exfiltrates the token to their server. With HttpOnly cookies + in-memory access tokens, XSS still
            hurts but it can&apos;t walk away with persistent credentials.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">CSRF in 2026, what changed and what didn&apos;t</h3>
        <p>
          Modern browsers default cookies to <code>SameSite=Lax</code>. That single change neutered most classic CSRF:
          a malicious site can no longer cause your browser to silently POST to <code>bank.com/transfer</code> with
          your auth cookie attached. The cookie is simply not sent on cross-site sub-requests.
        </p>
        <p>That doesn&apos;t mean CSRF is solved. It means the threat model shifted.</p>

        <ul className="space-y-2">
          <li>
            <strong>SameSite=Lax</strong>{" "}still sends cookies on top-level GET navigations. If your app does
            state-changing GETs (it shouldn&apos;t, but legacy code does), CSRF still works.
          </li>
          <li>
            <strong>SameSite=Strict</strong>{" "}blocks even top-level navigations. Safer, but breaks the &quot;click a
            link in an email and stay logged in&quot; UX. Often paired with a short-lived &quot;lax&quot; sibling
            cookie for first-request bootstrap.
          </li>
          <li>
            <strong>SameSite=None</strong>{" "}with <code>Secure</code> is required for cross-site cookies (think:
            embedded widgets, federated login pop-ups). These are still CSRF-vulnerable and need explicit defenses.
          </li>
          <li>
            <strong>Same-origin form posts</strong>{" "}from a compromised script on your own origin bypass SameSite
            entirely, that&apos;s an XSS problem, not a CSRF problem, but the impact looks similar.
          </li>
        </ul>

        <p className="mt-6 font-semibold">The three CSRF defenses, and what each actually defends:</p>

        <ClassifyChallenge
          title="CSRF defense fit"
          prompt="Match each scenario to the defense that best fits. (Some defenses can stack, pick the one that does the heavy lifting.)"
          buckets={[
            { id: "samesite", label: "SameSite cookie", color: "emerald" },
            { id: "double", label: "Double-submit cookie", color: "amber" },
            { id: "synch", label: "Synchronizer token", color: "indigo" },
            { id: "header", label: "Custom header + CORS", color: "violet" },
          ]}
          items={[
            { id: "c1", label: "First-party app, modern browsers, server-side rendered forms", answer: "samesite", explanation: "SameSite=Lax does the work for free. Add a synchronizer token if you want belt-and-suspenders for legacy browsers." },
            { id: "c2", label: "Stateless API consumed by your own SPA on the same domain", answer: "header", explanation: "Require a custom header (e.g. X-Requested-With), browsers won't send custom headers cross-origin without a preflight, and CORS blocks the preflight. Cheap and effective." },
            { id: "c3", label: "Server has no session store; embeds anti-CSRF cookie that the form re-submits as a hidden field", answer: "double", explanation: "Double-submit cookie. The server compares the cookie value to the form field, attacker can't read the cookie cross-origin to forge the field." },
            { id: "c4", label: "Classic server-rendered app with sessions; high-value form posts", answer: "synch", explanation: "Synchronizer token. Server stores per-session token, embeds in form, validates on submit. Strongest defense, requires session state." },
          ]}
        />

        <Callout variant="info" title="Spring Security defaults that earn their keep">
          <p className="m-0">
            Spring Security ships CSRF protection enabled by default for non-GET requests using a synchronizer token
            stored in the session. For SPAs talking to the same backend, switch to the
            <code> CookieCsrfTokenRepository.withHttpOnlyFalse()</code> repository, it stores the token in a readable
            cookie that your frontend echoes back as a header. That&apos;s a double-submit pattern, configured in two
            lines.
          </p>
          <p className="m-0">
            For pure API services that only accept JSON with a custom <code>Authorization</code> header (and never
            cookies), CSRF protection can be disabled, there&apos;s no ambient-credential to forge. Verify that
            assumption before flipping the switch.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Where auth state lives, full-stack tier walkthrough</h3>
        <p>
          The interview question that separates &quot;has read a JWT tutorial&quot; from &quot;has shipped this in
          production&quot; is: as a request walks from the browser through your edge gateway, into a BFF, then out to
          three downstream services, what auth credential exists at each hop, and who validates what?
        </p>

        <Mermaid chart={authTiers} />

        <ul className="mt-4 space-y-2">
          <li>
            <strong>Client (browser/SPA).</strong>{" "}Holds an access token in memory and a refresh token in an HttpOnly
            cookie. Or, for first-party apps, holds nothing but a session cookie, and the BFF does all token handling
            server-side. The client&apos;s job is to send credentials, not to mint or validate them.
          </li>
          <li>
            <strong>Edge / API gateway / CDN.</strong>{" "}Cheap, high-volume checks: JWT signature verification against
            cached JWKS, expiry, issuer, basic claim shape. This kills obviously-bogus traffic before it costs you
            compute. The edge does <em>not</em>{" "}do fine-grained authz, it doesn&apos;t know your data model.
          </li>
          <li>
            <strong>BFF (backend-for-frontend).</strong>{" "}The trust pivot. Holds the user&apos;s session cookie,
            translates it into per-audience service tokens via a token exchange (RFC 8693) or a credentials-grant call.
            The BFF is the only thing that ever sees the user&apos;s long-lived credential.
          </li>
          <li>
            <strong>Service.</strong>{" "}Validates the service-scoped JWT: signature, issuer, audience (= itself), expiry,
            scopes. Then enforces fine-grained authz against its own data model, &quot;this user owns this order.&quot;
          </li>
        </ul>

        <Callout variant="warn" title="Anti-pattern, client passes one token to N services">
          <p className="m-0">
            The shortcut design: the SPA gets one access token from login and forwards it directly to orders, billing,
            inventory, and notifications. It feels simple. It is also a leak amplifier, any one of those services
            getting compromised exposes a token good for all of them, and there&apos;s no central point to revoke.
          </p>
          <p className="m-0">
            The BFF pattern fixes this. The browser holds a session cookie; the BFF mints a fresh per-audience token
            for each downstream call. Revocation is one row in the session store. Token blast radius is one service.
          </p>
        </Callout>

        <CodeBlock lang="java" caption="BFF, exchanging a session for a downstream service token">{`@Component
public class DownstreamTokenMinter {
  private final WebClient authServer;

  // RFC 8693 token exchange: subject = user from session, audience = target service
  public Mono<String> tokenFor(String userId, String audience) {
    return authServer.post()
        .uri("/oauth2/token")
        .body(BodyInserters.fromFormData("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange")
            .with("subject_token", internalAssertionFor(userId))
            .with("subject_token_type", "urn:ietf:params:oauth:token-type:jwt")
            .with("audience", audience)
            .with("scope", scopesFor(audience)))
        .retrieve()
        .bodyToMono(TokenResponse.class)
        .map(TokenResponse::accessToken);
  }
}

@RestController
public class OrdersController {
  private final WebClient orders;
  private final DownstreamTokenMinter minter;

  @GetMapping("/api/orders")
  public Mono<List<Order>> myOrders(@AuthenticationPrincipal SessionUser u) {
    return minter.tokenFor(u.id(), "orders-service")
      .flatMap(token -> orders.get()
          .uri("/orders?owner={id}", u.id())
          .header("Authorization", "Bearer " + token)
          .retrieve()
          .bodyToFlux(Order.class)
          .collectList());
  }
}`}</CodeBlock>

        <Checkpoint moduleSlug="security-design" id="modern-auth" title="Modern auth depth checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="A SPA team is choosing between auth code + PKCE and implicit flow. Why is implicit the wrong choice in 2026?"
            options={[
              { label: "Implicit returns the access token in the URL fragment, leaking it to history, referers, and analytics; OAuth 2.1 removes it entirely", correct: true, explanation: "Right. The token landed in browser history, referer headers, and any script reading location.hash. PKCE made the original 'SPAs can't hold secrets' justification obsolete." },
              { label: "Implicit is slower than auth code because of the extra round trip", correct: false, explanation: "Implicit is technically fewer hops, that was its original appeal. Speed isn't the issue; token leakage is." },
              { label: "Implicit doesn't support refresh tokens, so users have to log in every hour", correct: false, explanation: "True but secondary. The disqualifier is access token leakage via the URL, not the refresh-token UX." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Your refresh token rotation logic detects that a refresh token was presented twice. What should happen?"
            options={[
              { label: "Issue a new pair anyway, refresh tokens can be reused once for retry safety", correct: false, explanation: "No. Reuse is a stolen-token signal. The attacker has a copy and so does the legitimate client." },
              { label: "Revoke the entire token family and force the user to re-authenticate", correct: true, explanation: "Right. A used refresh being presented again means two parties hold it. You don't know which is the attacker, so kill the family and make both re-authenticate." },
              { label: "Log a warning and let it through, could just be a network retry", correct: false, explanation: "Network retries should use idempotency keys, not token reuse. Reuse means compromise; treat it that way." },
            ]}
            hint="The whole point of rotation is that reuse becomes a tripwire."
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="A teammate stores access tokens in localStorage 'so the SPA can read them after a reload.' What's the strongest objection?"
            options={[
              { label: "localStorage is slower than memory access", correct: false, explanation: "Performance isn't meaningfully different for this use." },
              { label: "Any XSS on the page becomes a full account takeover, the attacker exfiltrates the token to their server", correct: true, explanation: "Right. localStorage is readable by any script on the origin. With HttpOnly refresh cookies + in-memory access tokens, XSS still hurts but can't walk away with persistent credentials." },
              { label: "localStorage has a 5MB quota that JWTs will exceed", correct: false, explanation: "JWTs are kilobytes; quota isn't the issue." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="In a BFF architecture, where does the user's long-lived credential live, and what does the browser send to downstream services?"
            options={[
              { label: "Browser sends a JWT directly to each service; BFF just proxies", correct: false, explanation: "That's the anti-pattern, it's the 'one token to N services' design that defeats per-service blast-radius limits." },
              { label: "BFF holds the session; browser sends only a session cookie; BFF mints per-audience service tokens for each downstream call", correct: true, explanation: "Right. The user's credential never reaches the browser as a bearer token. Each downstream gets a token scoped to itself, so a compromise of one service doesn't grant access to the others." },
              { label: "Both browser and BFF hold the same access token, sent to all services", correct: false, explanation: "Same problem as option A, single token, broad blast radius, no central revocation." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Your team enables SameSite=Lax on session cookies and asks if CSRF tokens can be removed. What's the right answer?"
            options={[
              { label: "Yes, SameSite=Lax fully replaces CSRF tokens in 2026", correct: false, explanation: "Lax still sends cookies on top-level GET navigations and doesn't help if you have any cross-site embed flows or SameSite=None cookies. It's a strong default, not a complete replacement." },
              { label: "Keep CSRF defenses for state-changing endpoints, Lax handles the common case but not top-level GET state changes, cross-site embeds, or SameSite=None cookies", correct: true, explanation: "Right. SameSite=Lax solves most classic CSRF for free, but state-changing GETs, embedded widgets, and cross-site auth flows still need explicit defenses (synchronizer tokens, double-submit, or custom headers)." },
              { label: "No, CSRF tokens are required by every framework regardless of SameSite", correct: false, explanation: "Frameworks let you disable CSRF protection; the question is whether you should, not whether you can." },
            ]}
            hint="Think about what SameSite=Lax does NOT cover."
          />
        </Checkpoint>

        <PartRecap
          title="Part 5 recap"
          gist="Modern auth is a stack of small, opinionated choices: PKCE everywhere, per-audience tokens, rotated refresh, in-memory access tokens, and a BFF that owns the user's credential."
          points={[
            { takeaway: "Auth code + PKCE is the default flow. Implicit is dead.", detail: "OAuth 2.1 formally removes implicit; PKCE killed the SPA-can't-hold-secrets argument." },
            { takeaway: "ID token says who, access token says what. Don't mix them.", detail: "ID tokens go to the client. Access tokens go to APIs and must have aud validated." },
            { takeaway: "Sessions for first-party web, JWT for B2B/mobile. The 'JWT for everything' era was a mistake.", detail: "Pair first-party SPAs with a BFF + session cookie; never expose a long-lived JWT to the browser." },
            { takeaway: "Rotate refresh tokens; treat reuse as a compromise.", detail: "Used refresh seen twice = kill the family. It's a tripwire, not a UX nicety." },
            { takeaway: "SameSite=Lax solves most CSRF for free, not all of it.", detail: "Keep defenses for state-changing GETs, cross-site embeds, and SameSite=None scenarios." },
            { takeaway: "Per-tier auth: edge does cheap checks, BFF holds the session, services validate per-audience JWTs, client holds nothing persistent in JS.", detail: "One token to N services is the anti-pattern. Mint per-audience, revoke at the BFF." },
          ]}
        />
      </section>

      {/* ============================== Closing ============================== */}
      <section className="my-12 rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-8 dark:border-pink-900 dark:from-pink-950/30 dark:to-rose-950/30">
        <h2 className="mb-3 text-2xl font-bold">Walking out</h2>
        <p>
          Security in system design is mostly about not skipping the boring checks. Validate audience claims. Push
          ownership filters into queries. Resolve URLs before fetching. Encrypt with per-user keys. Log auth events.
          Pick auth code + PKCE, not implicit. Rotate refresh tokens and treat reuse as a tripwire. Keep access tokens
          in memory and refresh tokens in HttpOnly cookies. None of it is glamorous, all of it is what separates a
          system that sleeps soundly from one that ends up in a retrospective post-mortem.
        </p>
        <p className="mt-3">
          The frameworks help, Spring Security, OAuth2 libraries, service meshes, KMS providers, but they only help
          if you understand what they&apos;re defending against.
        </p>
      </section>

      <section className="my-12">
        <h3 className="mb-3 text-lg font-semibold">Next up</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Module 44: Recap, we synthesize the whole course into a single mental compass before the capstone.
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="security-design" />
    </article>
  );
}
