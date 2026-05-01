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

const CHECKPOINTS = [
  { id: "authn-authz", title: "AuthN/AuthZ" },
  { id: "secrets-mtls", title: "Secrets & mTLS" },
  { id: "owasp", title: "OWASP" },
  { id: "pii", title: "PII & deletion" },
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

export default function Page() {
  const mod = getModuleBySlug("security-design")!;

  return (
    <article className="prose-custom">
      <ModuleProgress moduleSlug="security-design" checkpoints={CHECKPOINTS} />
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
      </header>

      <section className="my-8">
        <p className="lead">
          Security in system design isn&apos;t a chapter you bolt on at the end. It&apos;s woven into every box on the
          diagram. Who&apos;s allowed to call this service? How do we prove the call came from them and not someone
          forging headers? Where do the secrets live? What happens when an attacker gets one piece — can they pivot to
          everything?
        </p>

        <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/60 dark:bg-slate-900/40">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">What you&apos;ll walk out with</p>
          <ul className="space-y-2 text-sm">
            <li>A working mental model for AuthN vs AuthZ — and why JWTs aren&apos;t a silver bullet.</li>
            <li>Where secrets actually go (hint: not in your repo, not in your config map either).</li>
            <li>mTLS in plain English — when it earns its keep, when it&apos;s overkill.</li>
            <li>The OWASP categories that actually bite system designs (BOLA, SSRF, misconfig).</li>
            <li>How to design for PII without painting yourself into a GDPR corner.</li>
          </ul>
        </div>
      </section>

      {/* ============================== PART 1 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 1 — AuthN and AuthZ are not the same thing</h2>
        <p>
          Authentication answers <em>who are you</em>. Authorization answers <em>what are you allowed to do</em>. Mix
          them up and you build systems where logging in implicitly grants access to everything — which is exactly the
          shape of every breach you read about in the news.
        </p>

        <Callout variant="insight" title="The two-question rule">
          Every request crossing a trust boundary should answer both questions explicitly. &quot;Is this caller
          authenticated?&quot; AND &quot;Is this caller authorized for <em>this specific resource</em>?&quot; Skip the
          second one and you ship BOLA.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Sessions vs tokens vs JWTs</h3>
        <p>Three flavors of authentication state you&apos;ll encounter:</p>
        <ul className="space-y-2">
          <li>
            <strong>Server sessions.</strong> Cookie holds an opaque ID. State lives in Redis or a session store.
            Revocation is trivial — delete the row. Downside: shared session store becomes a hot dependency.
          </li>
          <li>
            <strong>Opaque tokens.</strong> Like sessions but the lookup happens at an auth service via introspection.
            Decoupled from your apps but adds a network hop per request (or a cache).
          </li>
          <li>
            <strong>JWTs.</strong> Self-contained. Signature proves authenticity, claims carry identity and scopes.
            Zero lookup overhead. Downside: revocation is hard. Until expiry, that token is valid.
          </li>
        </ul>

        <Callout variant="warn" title="JWTs aren't magic">
          People reach for JWTs because they sound &quot;stateless&quot; and &quot;modern.&quot; But if you need to
          revoke access immediately when someone is fired, a 1-hour-TTL JWT means up to an hour of lingering access.
          Either accept that, keep TTLs short with refresh tokens, or maintain a denylist (which puts the state back).
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">OAuth2 + OIDC, end to end</h3>
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

        <CodeBlock lang="java" caption="Spring Security — OAuth2 resource server validating JWTs">{`@Configuration
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
              { label: "Immediately — JWTs revoke instantly", correct: false, explanation: "JWTs are self-contained. There is no revocation hook unless you build one." },
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
        <h2 className="text-2xl font-bold mb-4">Part 2 — Secrets, certs, and mTLS</h2>
        <p>
          Authentication for users is one problem. Authentication between services is another. And the substrate for
          both is secrets — passwords, API keys, signing keys, cert private keys. Where they live, how they rotate, and
          who can read them is half the battle.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Where secrets do NOT belong</h3>
        <ul className="space-y-2">
          <li><strong>Source control.</strong> Once it&apos;s in git history, it&apos;s public. Rotate it.</li>
          <li><strong>Plain config maps / environment files committed to repos.</strong> Same problem.</li>
          <li><strong>Hardcoded in container images.</strong> Anyone with image pull rights has the secret.</li>
          <li><strong>Logged.</strong> Yes, this still happens. Scrub headers, redact bodies.</li>
        </ul>

        <Callout variant="warn" title="Detection beats prevention here">
          Pre-commit hooks (gitleaks, truffleHog) and CI scanning will catch the obvious leaks. But assume secrets WILL
          get committed eventually. Plan rotation and revocation as if it&apos;s a Tuesday, not an emergency.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Where secrets DO belong</h3>
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

        <h3 className="text-xl font-semibold mt-8 mb-3">Service-to-service: mTLS</h3>
        <p>
          For human-to-service auth you have OAuth. For service-to-service auth inside your network, mTLS is the gold
          standard. Both sides present certs. Both sides verify. The TLS handshake itself becomes the authentication.
        </p>

        <Mermaid chart={mtlsFlow} />

        <ul className="space-y-2 mt-4">
          <li><strong>What it gives you:</strong> encryption + mutual authentication, baked into the connection.</li>
          <li><strong>Cost:</strong> certificate lifecycle. Issuance, rotation, revocation, CA management.</li>
          <li><strong>Realistic deployment:</strong> Istio / Linkerd handle this transparently via sidecars. Cert-manager + an internal CA if you&apos;re rolling your own.</li>
        </ul>

        <Callout variant="info" title="Don't build your own CA">
          Operating a private CA properly (HSM-backed root, offline intermediates, CRL/OCSP infrastructure) is a
          full-time job. Use a service mesh, use cert-manager, use AWS Private CA — don&apos;t roll your own.
        </Callout>

        <Checkpoint moduleSlug="security-design" id="secrets-mtls" title="Secrets & mTLS checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="A teammate suggests storing the Stripe API key in your Helm values.yaml committed to git, encrypted with sops. Is this OK?"
            options={[
              { label: "No — secrets should never touch git", correct: false, explanation: "Encrypted secrets in git (sops, sealed-secrets) is a legitimate pattern. The key is that the encryption key itself is held outside git." },
              { label: "Yes, if the sops key is in a KMS that only deploy roles can decrypt", correct: true, explanation: "Right. The git artifact is ciphertext; the decryption authority lives in a KMS with proper access control. This is GitOps-friendly secret management." },
              { label: "Only if the repository is private", correct: false, explanation: "Repo privacy is a weak control. The encryption is what matters." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="When does mTLS earn its complexity over plain TLS + bearer token?"
            options={[
              { label: "Always — TLS without mTLS is insecure", correct: false, explanation: "Plain TLS plus a properly validated bearer token is fine for many systems." },
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
        <h2 className="text-2xl font-bold mb-4">Part 3 — The OWASP categories that actually bite</h2>
        <p>
          The OWASP API Security Top 10 reads like a litany of design failures. Most of them aren&apos;t exotic
          attacks — they&apos;re missed checks. Here are the ones that show up in real system design reviews:
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">BOLA — Broken Object-Level Authorization</h3>
        <p>
          Number one on the list, and the most common. Endpoint <code>GET /api/orders/{`{id}`}</code> authenticates the
          caller but doesn&apos;t check that the order belongs to them. Caller swaps the ID and reads someone
          else&apos;s data.
        </p>

        <CodeBlock lang="java" caption="BOLA — wrong vs right">{`// WRONG — authenticates but doesn't authorize
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
          Every endpoint that takes an ID is a BOLA risk. Don&apos;t check ownership in every controller — push it down
          into a query filter or aspect. <code>WHERE user_id = :caller</code> in the repository is hard to forget.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">SSRF — Server-Side Request Forgery</h3>
        <p>
          Your service accepts a URL and fetches it (image upload from URL, webhook config, link preview). Attacker
          sends <code>http://169.254.169.254/latest/meta-data/</code> — the AWS instance metadata endpoint — and your
          server happily fetches it and returns IAM credentials.
        </p>

        <ul className="space-y-2">
          <li>Block private IP ranges (RFC1918, 169.254.0.0/16, 127.0.0.0/8) at fetch time.</li>
          <li>Validate after DNS resolution — attacker DNS can return a private IP.</li>
          <li>Use IMDSv2 on AWS — requires a session token, kills naive SSRF against metadata.</li>
          <li>Egress proxy with allowlist for outbound calls if you can swing it.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Injection — still alive in 2026</h3>
        <p>
          SQL injection via concatenation. Command injection via shelling out. LDAP injection. Template injection. The
          fix is always the same: parameterize, don&apos;t concatenate. ORMs help. Prepared statements help. String
          formatting with user input ends careers.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Security misconfiguration</h3>
        <p>
          The breach you don&apos;t see coming. Open S3 buckets. Default admin passwords. CORS set to <code>*</code>.
          Debug endpoints exposed to the internet. Stack traces in production responses. The fix is automation —
          benchmarks (CIS), policy-as-code (OPA, Kyverno), and continuous scanning.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Insufficient logging &amp; monitoring</h3>
        <p>
          The category that turns a 1-day breach into a 6-month one. If you can&apos;t see who logged in, what data
          they accessed, and what changed — you can&apos;t respond. Log auth events, admin actions, and access to
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
            { id: "i1", label: "Endpoint /users/{id} returns any user when called by an authenticated session", answer: "bola", explanation: "Auth without ownership check — textbook BOLA." },
            { id: "i2", label: "Search field passes user input directly into a LIKE clause built by string concat", answer: "injection", explanation: "Classic SQLi vector. Parameterize the query." },
            { id: "i3", label: "Webhook config accepts arbitrary URLs and POSTs to them on event", answer: "ssrf", explanation: "Server fetching attacker-controlled URLs is SSRF — block private ranges and metadata IPs." },
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
        <h2 className="text-2xl font-bold mb-4">Part 4 — PII, encryption, and designing for deletion</h2>
        <p>
          Personal data shows up everywhere — emails, names, addresses, payment details, IP addresses. Modern
          regulations (GDPR, CCPA, etc.) treat it as a liability you have to manage explicitly, not just data you
          happen to have.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Encryption at rest, in transit, in use</h3>
        <ul className="space-y-2">
          <li>
            <strong>In transit.</strong> TLS everywhere — between client and edge, between services, between service
            and database. No exceptions, even on private networks.
          </li>
          <li>
            <strong>At rest.</strong> Disk-level encryption is table stakes (every cloud provider does it). Application-
            level encryption for sensitive columns is the next tier — even a stolen DB dump is useless without the key.
          </li>
          <li>
            <strong>In use.</strong> Hardest. Confidential computing, enclaves, homomorphic encryption are emerging.
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
          encrypted DEK is stored alongside the ciphertext. To decrypt, you ask KMS to unwrap the DEK — which gives you
          a clean audit log of every decryption.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">The right to be forgotten</h3>
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
          them inaccessible — which most regulators accept.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Data minimization</h3>
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
              { label: "Restore each backup, delete the row, re-snapshot — within 30 days", correct: false, explanation: "Operationally absurd and expensive. Regulators don't expect this." },
              { label: "Delete from live systems and use crypto-shredding so backup data is unreadable", correct: true, explanation: "Right. Per-user keys + key destruction make backup data useless without violating retention. This is the standard GDPR-compliant pattern." },
              { label: "Wait 30 days for backups to roll off, then confirm deletion", correct: false, explanation: "GDPR has a 30-day response window — this is borderline but creates risk if user data is accessed during the wait." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Your team wants to add user phone numbers to a new analytics dashboard. What's the right design instinct?"
            options={[
              { label: "Add the column, encrypt at rest, ship it", correct: false, explanation: "You've added PII and the deletion/access burden that comes with it. Ask why the dashboard needs it." },
              { label: "Ask whether the dashboard genuinely needs phone numbers — or just a count", correct: true, explanation: "Right. Data minimization. Most analytics needs are aggregate, not personal. The cheapest PII is none." },
              { label: "Hash the phone numbers before display", correct: false, explanation: "Hashing identifiers is fine for joins but doesn't help if the dashboard actually shows them." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 4 recap"
          gist="PII is a liability — encrypt aggressively, design deletion in from day one, and don't collect what you don't need."
          points={[
            { takeaway: "Per-record DEKs from KMS give you fine-grained control + audit.", detail: "And per-user keys enable crypto-shredding for deletion." },
            { takeaway: "Deletion has to traverse backups, analytics, caches, third parties.", detail: "Crypto-shredding is the only sane answer at scale." },
            { takeaway: "Data minimization is the cheapest security control.", detail: "Don't collect, don't store, don't worry about." },
          ]}
        />
      </section>

      {/* ============================== Closing ============================== */}
      <section className="my-12 rounded-xl border border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-8">
        <h2 className="text-2xl font-bold mb-3">Walking out</h2>
        <p>
          Security in system design is mostly about not skipping the boring checks. Validate audience claims. Push
          ownership filters into queries. Resolve URLs before fetching. Encrypt with per-user keys. Log auth events.
          None of it is glamorous, all of it is what separates a system that sleeps soundly from one that ends up in a
          retrospective post-mortem.
        </p>
        <p className="mt-3">
          The frameworks help — Spring Security, OAuth2 libraries, service meshes, KMS providers — but they only help
          if you understand what they&apos;re defending against.
        </p>
      </section>

      <section className="my-12">
        <h3 className="text-lg font-semibold mb-3">Next up</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Module 38: Recap — we synthesize all 35 modules into a single mental compass before the capstone.
        </p>
      </section>
    </article>
  );
}
