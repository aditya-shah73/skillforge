import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "what-multimodal", title: "What multimodal really means" },
  { id: "image-input", title: "Sending images to the model" },
  { id: "structured-extraction", title: "Structured extraction from images" },
  { id: "files-and-pdfs", title: "Files, PDFs, and the upload path" },
  { id: "project", title: "Project: receipt parser" },
  { id: "final", title: "Final quiz" },
];

export default function MultimodalModule() {
  const mod = getModuleBySlug("multimodal")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Phase 4 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Multimodal inputs</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Pictures, PDFs, screenshots. The model can see now — what does that change?
        </p>
        <BookmarkButton courseId="ai" moduleSlug="multimodal" />
        <ModuleProgress moduleSlug="multimodal" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A working understanding of vision models — not as magic, but as &quot;tokens, but the
          token grid is now 2-D&quot;. Plus the receipt parser project, which is the canonical
          &quot;photo in, JSON out&quot; pipeline.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>How vision models tokenize an image (and why that matters for cost)</li>
          <li>Sending images to Claude from Spring AI — base64 vs URL</li>
          <li>Structured extraction with JSON schemas and validation</li>
          <li>Handling PDFs: when to send to the model vs OCR-then-text</li>
          <li>The receipt parser: photo upload → extracted line items → totals reconciled</li>
        </ul>
      </section>

      <Callout variant="info" title="Prerequisites">
        <p className="m-0">
          Module 9 (Claude API fundamentals) for the request shape, Module 10 (Spring AI) for the
          Java client, Module 21 (chat interface) for the upload UI you&apos;ll bolt this onto.
          Optional but useful: Module 6 (embeddings) — image embeddings come from the same idea.
        </p>
      </Callout>

      {/* ================================================================= */}
      {/* PART 1: WHAT MULTIMODAL REALLY MEANS                                */}
      {/* ================================================================= */}
      <section id="what-multimodal">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — What &quot;multimodal&quot; really means</h2>

        <p>
          The marketing version: &quot;the model can see images now.&quot; That&apos;s true but
          unhelpful. It hides what&apos;s actually happening, and that&apos;s the part that
          determines whether your feature works or burns money.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Images become tokens</h3>

        <p>
          Remember Module 1 — text gets chopped into tokens, and the model only sees those tokens.
          Vision models do the exact same thing, just in 2-D. The image is sliced into a grid of
          patches (typically 14×14 or 16×16 pixels each), and each patch becomes one
          &quot;visual token&quot; that lives in the same vector space as text tokens.
        </p>

        <p>
          Concretely, a 1092×1092 image into Claude&apos;s vision encoder becomes roughly
          <strong> ~1,600 tokens</strong>. A 512×512 thumbnail is closer to ~400 tokens. A full HD
          screenshot? Several thousand. <em>This is why you should resize before sending.</em>
        </p>

        <Callout variant="warn" title="The expensive screenshot trap">
          <p className="m-0">
            Default phone photos are 4032×3024 — about 12 megapixels. Sent raw, that&apos;s
            tens of thousands of tokens per image, and most providers will resize you down anyway
            (badly, on their side). Always resize on your side, to a known dimension, before
            uploading. We&apos;ll do this in the project.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">It&apos;s the same transformer</h3>

        <p>
          Once the image is tokenized, it&apos;s just more tokens flowing into the same attention
          mechanism you learned in Module 5. The model attends to image tokens and text tokens
          uniformly. That&apos;s why you can ask &quot;what does the third row of this table say?&quot;
          and it works — the model is doing exactly what it does for text, but the &quot;third row&quot;
          is now a spatial concept the patch grid encodes.
        </p>

        <p>
          The implication: <strong>everything you learned about prompting still applies</strong>.
          System prompts, few-shot examples, structured output — all of it works for vision tasks.
          You just have an image (or several) somewhere in the message.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">What vision models are good at — and what they aren&apos;t</h3>

        <p>Roughly, by 2025-era capability:</p>

        <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Reliable</h4>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Reading printed text (receipts, signs, slides)</li>
              <li>Describing scenes, identifying objects</li>
              <li>Reading tables and structured layouts</li>
              <li>Counting small numbers of items (≤ 10ish)</li>
              <li>Understanding charts and diagrams</li>
              <li>Reading handwriting that&apos;s not too messy</li>
            </ul>
          </div>
          <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 p-4">
            <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-2">Unreliable</h4>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Counting many items (&gt; 20)</li>
              <li>Pixel-precise geometry (&quot;is X to the left of Y by 3px?&quot;)</li>
              <li>Reading very small text (resize matters)</li>
              <li>Identifying specific people (and providers may refuse)</li>
              <li>Decoding QR codes, barcodes (use a real library)</li>
              <li>OCR of low-contrast / rotated / damaged text</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="The right mental model">
          <p className="m-0">
            Vision models are a smart human glancing at an image — not a microscope. If a smart human
            would need to zoom in or use a tool, the model probably will too. Your job is to either
            (a) crop and resize so the relevant content is large and clear, or (b) call a real
            OCR/CV tool from a Module-11-style tool-use loop.
          </p>
        </Callout>

        <PartRecap
          title="Part 1 recap"
          gist="Vision models tokenize images into a 2-D patch grid and run them through the same transformer as text. Cost scales with pixels; capability is 'smart human at a glance', not 'microscope'."
          points={[
            { takeaway: "Images become patches, patches become tokens.", detail: "Roughly 14×14-pixel patches. A 1092×1092 image is ~1,600 visual tokens. Same vector space as text tokens, same attention mechanism — just more of them." },
            { takeaway: "Resize aggressively before upload.", detail: "Token count scales with pixel count. A 12-megapixel phone photo is ~12× more tokens than a 1024×1024 resize. Providers will resize you down anyway — do it on your side so you don't pay for the upload twice." },
            { takeaway: "Reliable for reading text and scenes, weak at counting and pixel-precise geometry.", detail: "Mental model: smart human glancing at the image. If a human would zoom in, the model needs you to crop or hand off to a real CV tool." },
            { takeaway: "Your prompting toolkit still works.", detail: "System prompts, few-shot, structured output — all of it composes with images. Vision doesn't replace prompting, it extends it." },
          ]}
        />

        <Checkpoint moduleSlug="multimodal" id="what-multimodal" title="What multimodal really means" xp={20} celebration="You see why vision is just 'tokens, but 2-D'.">
          <Quiz
            kind="Quick check"
            question="Why does resizing a 4032×3024 photo down to 1024×1024 before sending it to a vision model usually save you money without hurting accuracy?"
            options={[
              { label: "It doesn't — the provider resizes server-side anyway, so cost is identical.", explanation: "You still pay for the bytes you upload, and you pay for the visual tokens the encoder produces. Provider-side resizing is lossy and outside your control." },
              { label: "Visual token count scales with pixel count, so 12× fewer pixels means ~12× fewer tokens. Most tasks don't benefit from extra resolution past ~1024–1568px on the long side.", correct: true, explanation: "Patches → tokens. Pixel count drops, patch count drops, token cost drops. Receipts and scenes don't benefit from megapixel-level detail." },
              { label: "Vision models reject any image over 1024px.", explanation: "They accept larger images; the cost just balloons." },
              { label: "Compression artifacts from JPEG always hurt accuracy past a certain size.", explanation: "Compression matters but it's a separate concern from pixel count." },
            ]}
            xp={10}
          />
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: SENDING IMAGES TO THE MODEL                                 */}
      {/* ================================================================= */}
      <section id="image-input">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — Sending images to the model</h2>

        <p>
          There are three ways to put an image into a Claude request: a public URL, a base64 blob,
          or — for some providers — a pre-uploaded file ID. We&apos;ll cover the first two,
          because they cover 99% of cases.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The raw HTTP shape</h3>

        <p>
          Before Spring AI does its magic, here&apos;s what the wire actually looks like for the
          Anthropic API. Useful to know, because when something breaks you&apos;ll be reading these
          payloads in logs.
        </p>

        <CodeBlock lang="plain">{`POST /v1/messages
Content-Type: application/json
x-api-key: sk-ant-...
anthropic-version: 2023-06-01

{
  "model": "claude-sonnet-4-5",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": "/9j/4AAQSkZJRgABAQ..."
          }
        },
        {
          "type": "text",
          "text": "Read the total off this receipt."
        }
      ]
    }
  ]
}`}</CodeBlock>

        <p>
          Two things to notice. First, the message <code>content</code> is now an array, not a
          string — text-only messages can use a string for convenience, but as soon as you add an
          image, you must use the array form. Second, ordering matters: putting the image
          <em> before</em>{" "}the question is the recommended pattern. The model&apos;s attention
          tends to ground better that way.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">From Spring AI</h3>

        <p>
          Spring AI hides the JSON shape behind <code>UserMessage</code> and a <code>Media</code>
          object. Here&apos;s the equivalent in Java:
        </p>

        <CodeBlock lang="java">{`package com.example.standup.vision;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.content.Media;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

@Service
public class ReceiptVisionService {

    private final ChatClient chat;

    public ReceiptVisionService(ChatClient.Builder builder) {
        this.chat = builder.build();
    }

    public String describeReceipt(Resource imageResource) {
        var media = Media.builder()
                .mimeType(MimeTypeUtils.IMAGE_JPEG)
                .data(imageResource)
                .build();

        var userMessage = UserMessage.builder()
                .text("Read the total off this receipt. Reply with just the number.")
                .media(media)
                .build();

        return chat.prompt()
                .messages(userMessage)
                .call()
                .content();
    }
}`}</CodeBlock>

        <p>
          The <code>Media</code> object holds the bytes plus the MIME type. Spring AI handles
          base64 encoding for you under the hood. You can pass any <code>Resource</code> —
          a <code>FileSystemResource</code>, a <code>ByteArrayResource</code>, or a
          <code> ClassPathResource</code> for tests. For most production use you&apos;ll be
          handing in a <code>ByteArrayResource</code> built from a multipart upload.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">URL vs base64 — when to use which</h3>

        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-2">Approach</th>
                <th className="text-left p-2">Use when</th>
                <th className="text-left p-2">Watch out for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-mono text-xs">base64 in request</td>
                <td className="p-2">User just uploaded the file; image is private; under 5 MB</td>
                <td className="p-2">Inflates your request size by ~33%</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-mono text-xs">Public URL</td>
                <td className="p-2">Image is already on a CDN; reused across many requests</td>
                <td className="p-2">Provider has to fetch it; URL must be publicly reachable</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-mono text-xs">Pre-signed S3 URL</td>
                <td className="p-2">Private image but you want URL semantics</td>
                <td className="p-2">Watch the TTL; provider needs time to fetch</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          For the receipt parser, we&apos;ll use base64 — receipts are private, one-shot, and
          small enough that a 33% inflation is fine.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Resizing on the server</h3>

        <p>
          Don&apos;t trust the client to resize. The phone might, the desktop browser usually
          won&apos;t, and the user might paste in a screenshot or drag an image off another tab.
          Resize server-side, on the way in:
        </p>

        <CodeBlock lang="java">{`package com.example.standup.vision;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;

public class ImageResizer {

    private static final int MAX_DIM = 1568;
    private static final float JPEG_QUALITY = 0.85f;

    public static byte[] resizeIfNeeded(byte[] input) throws IOException {
        BufferedImage src = ImageIO.read(new ByteArrayInputStream(input));
        if (src == null) {
            throw new IOException("not an image");
        }
        int w = src.getWidth(), h = src.getHeight();
        if (Math.max(w, h) <= MAX_DIM) {
            return input; // already small enough
        }
        double scale = (double) MAX_DIM / Math.max(w, h);
        int newW = (int) Math.round(w * scale);
        int newH = (int) Math.round(h * scale);

        BufferedImage out = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.drawImage(src, 0, 0, newW, newH, null);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(out, "jpg", baos);
        return baos.toByteArray();
    }
}`}</CodeBlock>

        <Callout variant="warn" title="JPEG re-encoding loses quality">
          <p className="m-0">
            The example above re-encodes everything as JPEG. For receipts this is fine — they&apos;re
            already photos. But if a user uploads a PNG screenshot of a sharp UI and you re-encode to
            JPEG, you&apos;ll add compression artifacts that hurt OCR. Decision rule: if input is PNG
            and the image has fewer than ~2000 unique colors (likely a screenshot), keep PNG. Otherwise
            JPEG at 85% is plenty.
          </p>
        </Callout>

        <PartRecap
          title="Part 2 recap"
          gist="Multimodal messages use the array content form. Spring AI's Media object handles encoding. Resize server-side. Watch for HEIC."
          points={[
            { takeaway: "The wire shape is `content: [image, text]`.", detail: "Once a message has an image, content can no longer be a plain string. Image part first, then the text question — the model grounds better that way." },
            { takeaway: "Spring AI's Media wraps any Resource.", detail: "ByteArrayResource for uploads, ClassPathResource for tests, FileSystemResource for batch jobs. Spring AI handles base64 under the hood." },
            { takeaway: "Base64 vs URL is a privacy + reuse trade-off.", detail: "Base64 inflates request size by ~33% but keeps the image private and one-shot. URLs are great for CDN-hosted, reused images. Pre-signed S3 URLs split the difference." },
            { takeaway: "Resize on the server, not the client.", detail: "Phones might resize, browsers usually don't. Cap the long side at ~1568px (Claude's effective ceiling) and re-encode at JPEG 85% — unless the input is a screenshot, then keep PNG." },
          ]}
        />

        <Checkpoint moduleSlug="multimodal" id="image-input" title="Sending images to the model" xp={20} celebration="You can send a real image to a real vision model.">
          <Quiz
            kind="Quick check"
            question="A user uploads an iPhone HEIC photo. Your Java backend reads it with ImageIO.read(...) and gets null. What's the cleanest production fix?"
            options={[
              { label: "Reject HEIC at the API boundary and tell the user to convert.", explanation: "Workable but annoying UX — iPhone is a huge share of receipt photos." },
              { label: "Add twelvemonkeys imageio JNI bindings to every backend instance.", explanation: "Possible, but you're now coupling your service to a native dependency that complicates Docker builds and increases attack surface." },
              { label: "Put a converter in front of the upload — e.g., a sidecar or pre-signed-URL Lambda that produces JPEG before it reaches your service.", correct: true, explanation: "Keeps format conversion out of your hot path. Your service stays simple (accepts JPEG/PNG/WebP). Conversion can be cached, scaled, and updated independently." },
              { label: "Use Spring AI's built-in HEIC adapter.", explanation: "There isn't one — HEIC is Apple's container format, not in the JDK or Spring AI." },
            ]}
            xp={10}
          />
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: STRUCTURED EXTRACTION                                       */}
      {/* ================================================================= */}
      <section id="structured-extraction">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — Structured extraction from images</h2>

        <p>
          Reading text from an image is easy. Getting the model to spit out a JSON object you can
          actually <em>use</em>{" "}is where the work is. This is the same problem as Module 7&apos;s
          structured output — but with images, the failure modes are sneakier.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Define the schema first, prompt second</h3>

        <p>
          When you&apos;re extracting data from a picture, your schema is your contract. Write it
          before you write the prompt. For receipts:
        </p>

        <CodeBlock lang="java">{`package com.example.standup.vision;

import java.util.List;

public record Receipt(
        String merchant,
        String date,           // ISO 8601 yyyy-MM-dd
        List<LineItem> items,
        double subtotal,
        double tax,
        double total,
        String currency,       // ISO 4217 — USD, EUR, etc.
        Double confidence      // 0.0 – 1.0, model's self-assessment
) {
    public record LineItem(
            String description,
            int quantity,
            double unitPrice,
            double lineTotal
    ) {}
}`}</CodeBlock>

        <p>
          Notice the <code>Double confidence</code> (boxed, nullable). We&apos;ll ask the model to
          tell us how confident it is — a self-rating. It&apos;s not a probability in any
          mathematical sense, but it correlates well enough with actual accuracy that you can use
          it as a triage signal: under 0.7? Send to manual review.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Spring AI&apos;s entity converter</h3>

        <p>
          Spring AI can map directly to your record. You give it the class, it injects the JSON
          schema into the prompt and parses the response.
        </p>

        <CodeBlock lang="java">{`public Receipt extract(byte[] imageBytes) {
    var media = Media.builder()
            .mimeType(MimeTypeUtils.IMAGE_JPEG)
            .data(new ByteArrayResource(imageBytes))
            .build();

    var system = """
            You are a receipt parsing service. Extract structured data from receipt images.
            Rules:
            - Dates must be ISO 8601 (yyyy-MM-dd). If the year is ambiguous, use the current year.
            - Currency must be ISO 4217. If unclear, default to USD.
            - lineTotal = quantity * unitPrice. Verify before responding.
            - subtotal + tax should equal total within 0.02. If they don't, lower your confidence.
            - Output ONLY the JSON object. No prose, no markdown fences.
            """;

    return chat.prompt()
            .system(system)
            .user(u -> u.text("Extract this receipt.").media(media))
            .call()
            .entity(Receipt.class);
}`}</CodeBlock>

        <p>
          The <code>.entity(Receipt.class)</code> call is the magic line. Spring AI generates a JSON
          schema from your record, appends it to the prompt as &quot;here&apos;s the format you
          must follow,&quot; and parses the response back into a <code>Receipt</code>. If parsing
          fails, you get an exception — not a half-broken object.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Validation: never trust the extraction</h3>

        <p>
          The schema gives you type safety. It does <em>not</em>{" "}give you truth. The model can return
          a perfectly-shaped JSON that says the total is $42.00 when the receipt clearly shows
          $43.50. You must validate.
        </p>

        <WorkedExample
          title="A real receipt extraction failure I hit in testing"
          subtitle="And the validation that caught it"
          steps={[
            {
              title: "The receipt",
              body: <p>A coffee shop receipt: 2× latte at $5.50 = $11.00, 1× pastry at $4.25, subtotal $15.25, tax $1.30, total $16.55. Clear as day to a human.</p>,
            },
            {
              title: "What the model returned",
              body: <p>It got the items right, the subtotal right, the tax right — and then said <code>total: 16.05</code>. Off by 50 cents. Looking at the image carefully, the &quot;5&quot; in &quot;55&quot; was slightly smudged. The model&apos;s confidence: 0.92. So self-rating wouldn&apos;t have caught it.</p>,
            },
            {
              title: "The validation that did catch it",
              body: <p>A simple post-processing check: <code>Math.abs(subtotal + tax - total) &gt; 0.02</code>. That fired immediately. We rejected the extraction and flagged for review.</p>,
            },
            {
              title: "What we did with the failure",
              body: <p>Two paths. Cheap path: re-prompt with &quot;the totals don&apos;t reconcile, look again&quot; and the original image. About 70% of the time, that fixes it. Expensive path: route to manual review. Either is fine; the key is that you don&apos;t silently store wrong data.</p>,
            },
            {
              title: "The takeaway",
              body: <p>Structured output gives you a typed object. It does not give you a correct one. Always validate against domain constraints — sums, ranges, formats, references. The model is a smart assistant, not an audited accountant.</p>,
            },
          ]}
        />

        <h3 className="text-xl font-bold mt-8 mb-3">Few-shot for tricky formats</h3>

        <p>
          Some receipts are weird. European receipts use commas as decimal separators. Some
          merchants list discounts as line items with negative quantities. Tax-inclusive prices
          (common in EU/UK) vs. tax-added (US) confuse the model unless you tell it which to expect.
        </p>

        <p>
          When you hit an edge case repeatedly, add a few-shot example. Don&apos;t try to describe
          the rule abstractly — show the model two or three input/output pairs and let it
          generalize.
        </p>

        <CodeBlock lang="java">{`var system = """
        You are a receipt parsing service. ...

        Examples of correctly-parsed European receipts:

        Input: receipt shows "Sub: 12,50 € / VAT 19%: 2,38 € / Tot: 14,88 €"
        Output: {"subtotal": 12.50, "tax": 2.38, "total": 14.88, "currency": "EUR", ...}

        Input: receipt shows "TOTAL incl. VAT: £24.00"
        Output: {"subtotal": 20.00, "tax": 4.00, "total": 24.00, "currency": "GBP", ...}
        (back-calculate subtotal from VAT-inclusive total at 20%)
        """;`}</CodeBlock>

        <Callout variant="insight" title="Few-shot beats verbose instructions">
          <p className="m-0">
            A common bug: writing 200 words explaining how European receipts work, getting it 70%
            right. Replacing all 200 words with two examples often gets it 95%+ right. Show, don&apos;t
            tell — the model is a pattern-matcher.
          </p>
        </Callout>

        <PartRecap
          title="Part 3 recap"
          gist="Schema first. Spring AI maps to records. Type safety isn't correctness — validate. Few-shot beats verbose rules for tricky formats."
          points={[
            { takeaway: "Define a Java record before writing the prompt.", detail: "The record IS your contract. Field names, types, and required vs nullable shape what the model returns. Sketch it before you sketch the prompt." },
            { takeaway: ".entity(Class) appends a schema and parses the response.", detail: "Spring AI generates JSON Schema from your record, injects it into the prompt as 'use this format', and parses on the way back. If parsing fails, you get an exception — not a half-broken object." },
            { takeaway: "Type safety isn't correctness.", detail: "A perfectly-shaped Receipt can have a wrong total. Validate domain constraints: subtotal + tax ≈ total, currency is ISO 4217, line items sum to subtotal. Reject (or flag) when constraints fail." },
            { takeaway: "Few-shot for tricky formats; rules for simple ones.", detail: "Decimal commas, VAT-inclusive pricing, negative-quantity discounts — describe these by example, not by paragraph. The model is a pattern-matcher; show it the pattern." },
          ]}
        />

        <Checkpoint moduleSlug="multimodal" id="structured-extraction" title="Structured extraction" xp={25} celebration="Photo in, validated JSON out.">
          <Quiz
            kind="Quick check"
            question="You're extracting receipts and the model occasionally returns 'total: null' on blurry images. Type-safe, but useless. Best way to make this fail loudly instead of silently saving a Receipt with null total?"
            options={[
              { label: "Use a primitive `double` for total — Jackson throws on null, Spring AI surfaces the error.", correct: true, explanation: "The simplest, most defensive option. The contract becomes 'total is required' at the type level, and an unreadable receipt fails at parse time instead of polluting your DB." },
              { label: "Catch nulls in the controller and return 200 with an empty body.", explanation: "Silently returning empty is worse than failing — clients can't distinguish 'extraction failed' from 'this receipt was empty'." },
              { label: "Run the prompt three times and majority-vote.", explanation: "3× the cost, no real reliability gain — the model usually gets stuck in the same failure mode on the same blurry image." },
              { label: "Add a system prompt rule: 'never return null'.", explanation: "Helpful but not enforceable. The model can still return null. Combine prompt rules with type-level enforcement, but rely on the type for the safety net." },
            ]}
            xp={10}
          />
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: FILES, PDFS                                                 */}
      {/* ================================================================= */}
      <section id="files-and-pdfs">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — Files, PDFs, and the upload path</h2>

        <p>
          PDFs are the most common &quot;is this an image?&quot; question you&apos;ll hit. Answer:
          sometimes. A scanned receipt PDF is just a JPEG with a thin wrapper. A digitally-generated
          invoice PDF has actual text inside. You handle them differently.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The decision tree</h3>

        <CodeBlock lang="plain">{`┌─ Is it a PDF? ─────────────────┐
│                                │
│   Try extracting text:         │
│   - PDFBox / Apache Tika       │
│                                │
│   Got > 100 chars of text?     │
│   ├─ YES → text path           │
│   │       (chunk + Module 17)  │
│   │                            │
│   └─ NO  → image path          │
│           (rasterize page →    │
│            send as image)      │
│                                │
└────────────────────────────────┘`}</CodeBlock>

        <p>
          The text path is cheaper, faster, and more accurate when it works. The image path is your
          fallback for scanned PDFs. You don&apos;t pick one; you have both, and you route based on
          what extraction returns.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Native PDF support (Claude)</h3>

        <p>
          Claude accepts PDFs directly as a content type — internally it does the rasterize-or-text
          decision for you, page by page. Convenient, but you pay for it: every page is processed.
          For multi-page documents where only one page is relevant, this is wasteful.
        </p>

        <CodeBlock lang="java">{`var pdfMedia = Media.builder()
        .mimeType(MimeType.valueOf("application/pdf"))
        .data(new ByteArrayResource(pdfBytes))
        .build();

var response = chat.prompt()
        .user(u -> u.text("Summarize this invoice.").media(pdfMedia))
        .call()
        .content();`}</CodeBlock>

        <p>
          For the receipt project we&apos;ll keep things simple — image upload only. PDF handling
          is a great topic to revisit when we hit document-AI use cases.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The upload endpoint</h3>

        <p>
          Multipart upload from the browser is a well-trodden path. The interesting bit is what you
          do with the file <em>before</em>{" "}it touches the model: validate type, resize, scan for
          malware (in production), and only then call the vision service.
        </p>

        <CodeBlock lang="java">{`package com.example.standup.api;

import com.example.standup.vision.ImageResizer;
import com.example.standup.vision.Receipt;
import com.example.standup.vision.ReceiptVisionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Set;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_BYTES = 8L * 1024 * 1024; // 8 MB

    private final ReceiptVisionService vision;

    public ReceiptController(ReceiptVisionService vision) {
        this.vision = vision;
    }

    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> extract(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(error("file required"));
        }
        if (!ALLOWED.contains(file.getContentType())) {
            return ResponseEntity.status(415).body(error("unsupported type: " + file.getContentType()));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.status(413).body(error("file too large"));
        }

        byte[] resized = ImageResizer.resizeIfNeeded(file.getBytes());
        Receipt receipt = vision.extract(resized);
        return ResponseEntity.ok(receipt);
    }

    private record Err(String error) {}
    private static Err error(String msg) { return new Err(msg); }
}`}</CodeBlock>

        <Callout variant="warn" title="Don't forget Spring's multipart limits">
          <p className="m-0">
            By default Spring caps multipart uploads at 1 MB per file and 10 MB per request. Your 8 MB
            check above will never fire — Spring rejects the request earlier with a confusing
            MaxUploadSizeExceededException. Set <code>spring.servlet.multipart.max-file-size=10MB</code>
            and <code>max-request-size=10MB</code> in <code>application.yml</code> to match.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">The frontend upload UI</h3>

        <p>
          Plain old <code>&lt;input type=&quot;file&quot;&gt;</code> with <code>FormData</code>.
          Nothing exotic.
        </p>

        <CodeBlock lang="plain">{`// app/components/ReceiptUploader.tsx
"use client";
import { useState } from "react";

type Receipt = {
  merchant: string;
  total: number;
  currency: string;
  items: { description: string; lineTotal: number }[];
  confidence: number | null;
};

export function ReceiptUploader() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/receipts/extract", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? \`HTTP \${res.status}\`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={onChange} disabled={busy} />
      {busy && <p>Extracting…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <ReceiptDisplay receipt={result} />}
    </div>
  );
}`}</CodeBlock>

        <Callout variant="insight" title="Streaming or not?">
          <p className="m-0">
            For one-shot extraction (receipt → JSON), don&apos;t bother streaming. The whole call
            finishes in 2-4 seconds, and a JSON object isn&apos;t meaningful to render token-by-token.
            Save streaming for the chat UX (Module 20/21), where partial output is actually useful.
          </p>
        </Callout>

        <PartRecap
          title="Part 4 recap"
          gist="Files and PDFs are a routing problem. Validate hard at the boundary, bump Spring's defaults, and don't stream what you don't need to."
          points={[
            { takeaway: "PDFs route on text-vs-scanned.", detail: "Try PDFBox/Tika text extraction first. If you get <100 chars or it looks like garbage, fall back to rasterizing the page as an image. Don't pay vision-token prices when the PDF already has the text inside." },
            { takeaway: "Validate type, size, and dimensions before the model sees the bytes.", detail: "MIME type allowlist, max-bytes check, and a resize pass. Each one fails-fast before you spend money on a bad upload." },
            { takeaway: "Bump Spring's multipart limits.", detail: "Defaults are 1 MB per file and 10 MB per request. Your in-controller limits never fire because the parser rejects first. Set max-file-size and max-request-size in application.yml to match." },
            { takeaway: "One-shot extraction doesn't need streaming.", detail: "A JSON object isn't meaningful token-by-token. Save streaming for chat UIs where partial text is useful." },
          ]}
        />

        <Checkpoint moduleSlug="multimodal" id="files-and-pdfs" title="Files, PDFs, and uploads" xp={20} celebration="You can route any file the user throws at you.">
          <Quiz
            kind="Quick check"
            question="You're processing a mix of PDFs — some are exported invoices, some are phone photos saved as PDF. Best routing strategy?"
            options={[
              { label: "Always rasterize and send as image — most consistent.", explanation: "Wasteful and lossy for digitally-generated PDFs that already contain perfect text." },
              { label: "Always extract text with PDFBox — fastest path.", explanation: "Fails on scanned PDFs that have no embedded text or garbage embedded text." },
              { label: "Try text extraction first; if you get less than ~100 chars or the text looks like garbage, fall back to rasterizing the page as an image.", correct: true, explanation: "The robust pattern: cheap path first, expensive fallback for the cases the cheap path can't handle. Near-OCR-quality on scanned docs, free perfect text on digital ones." },
              { label: "Send all PDFs to Claude with native PDF support — let the provider decide.", explanation: "Convenient but you pay for every page even when extraction would have been free." },
            ]}
            xp={10}
          />
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: PROJECT — RECEIPT PARSER                                    */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Project: receipt parser</h2>

        <p>
          You&apos;ve seen all the pieces. Now build the thing. This project is small enough to
          finish in an afternoon, and big enough to land &quot;I built a vision feature&quot; on a
          resume.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">What you&apos;re building</h3>

        <p>A two-page app:</p>

        <ul className="list-disc pl-6 space-y-1 my-4">
          <li><strong>Upload page:</strong>{" "}drag-and-drop or file picker. Shows a preview, then the spinner, then the parsed receipt.</li>
          <li><strong>History page:</strong>{" "}list of receipts you&apos;ve parsed, total spent per merchant, total per month.</li>
        </ul>

        <p>
          On the backend, three layers: a vision service (Spring AI + Claude), a validation layer
          that catches reconciliation errors, and a tiny JDBC store for history.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Architecture</h3>

        <CodeBlock lang="plain">{`┌─────────────────────────────────────────────────────────────────────┐
│  Browser                                                            │
│  ┌──────────────────┐   POST /api/receipts/extract                  │
│  │ ReceiptUploader  │ ─── multipart/form-data ─→                    │
│  │  (file input)    │                                               │
│  └──────────────────┘                                               │
│  ┌──────────────────┐   GET /api/receipts                           │
│  │ ReceiptHistory   │ ──────────────────────────→                   │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Spring Boot                                                        │
│                                                                     │
│  ReceiptController                                                  │
│       │                                                             │
│       ├─ ImageResizer ──→ bytes                                     │
│       │                                                             │
│       ├─ ReceiptVisionService                                       │
│       │     │                                                       │
│       │     └─ ChatClient.entity(Receipt.class)                     │
│       │           │                                                 │
│       │           ▼                                                 │
│       │     [Claude vision API]                                     │
│       │                                                             │
│       ├─ ReceiptValidator (sum check, date format, currency)        │
│       │                                                             │
│       └─ ReceiptStore.save() ─→ Postgres                            │
└─────────────────────────────────────────────────────────────────────┘`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Schema</h3>

        <CodeBlock lang="plain">{`-- V1__receipts.sql
CREATE TABLE receipts (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    merchant TEXT,
    purchase_date DATE,
    subtotal NUMERIC(10, 2),
    tax NUMERIC(10, 2),
    total NUMERIC(10, 2),
    currency CHAR(3),
    confidence REAL,
    raw_json JSONB NOT NULL,
    image_sha256 CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX receipts_user_date_idx ON receipts (user_id, purchase_date DESC);
CREATE UNIQUE INDEX receipts_user_image_idx ON receipts (user_id, image_sha256);`}</CodeBlock>

        <p>
          Two things to call out. <code>raw_json</code> stores the full extraction including line
          items — cheaper than two tables, and you almost never query inside line items.
          <code> image_sha256</code> is a content hash of the uploaded image, with a unique index
          per user — that gives you idempotent uploads (re-uploading the same receipt updates
          rather than duplicates).
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The validation layer</h3>

        <CodeBlock lang="java">{`package com.example.receipts.validate;

import com.example.receipts.vision.Receipt;
import java.util.ArrayList;
import java.util.List;

public class ReceiptValidator {

    public record ValidationResult(boolean valid, List<String> warnings) {}

    public static ValidationResult validate(Receipt r) {
        List<String> warnings = new ArrayList<>();

        if (r.total() <= 0) {
            warnings.add("total must be positive, got " + r.total());
        }
        if (Math.abs(r.subtotal() + r.tax() - r.total()) > 0.02) {
            warnings.add(String.format(
                "totals don't reconcile: %.2f + %.2f != %.2f",
                r.subtotal(), r.tax(), r.total()));
        }
        if (r.currency() == null || r.currency().length() != 3) {
            warnings.add("invalid currency code: " + r.currency());
        }
        double itemSum = r.items().stream()
                .mapToDouble(Receipt.LineItem::lineTotal).sum();
        if (Math.abs(itemSum - r.subtotal()) > 0.02) {
            warnings.add(String.format(
                "line items sum to %.2f but subtotal is %.2f", itemSum, r.subtotal()));
        }
        if (r.confidence() != null && r.confidence() < 0.7) {
            warnings.add("low confidence: " + r.confidence());
        }
        return new ValidationResult(warnings.isEmpty(), warnings);
    }
}`}</CodeBlock>

        <p>
          Failed validation doesn&apos;t mean reject — it means &quot;flag for review.&quot; Save
          the receipt with a <code>needs_review</code> column (add it to the schema as a boolean),
          and let the user fix it on the history page.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The history aggregations</h3>

        <p>
          The history page is just two SQL queries. Let Postgres do the work:
        </p>

        <CodeBlock lang="plain">{`-- Per merchant
SELECT merchant, SUM(total) as spent, COUNT(*) as visits
FROM receipts
WHERE user_id = ? AND purchase_date >= ?
GROUP BY merchant
ORDER BY spent DESC
LIMIT 20;

-- Per month
SELECT date_trunc('month', purchase_date) as month, SUM(total) as spent
FROM receipts
WHERE user_id = ?
GROUP BY 1
ORDER BY 1 DESC;`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Stretch goals</h3>

        <ul className="list-disc pl-6 space-y-1 my-4">
          <li><strong>Categorize line items.</strong>{" "}Add a follow-up call: given the line items, classify each into &quot;food&quot;/&quot;drink&quot;/&quot;tip&quot;/etc. (Single LLM call, structured output, batched.)</li>
          <li><strong>Currency conversion.</strong>{" "}Convert non-USD totals using a public FX API. Store both raw and converted.</li>
          <li><strong>Duplicate detection.</strong>{" "}Beyond the SHA hash — embed a normalized fingerprint (merchant + date + total) and warn if two receipts within 24 hours look identical.</li>
          <li><strong>Bulk upload.</strong>{" "}Drop a folder of 50 receipts. Process in parallel with a bounded concurrency (max 5 at a time so you don&apos;t blow up your rate limit).</li>
          <li><strong>Export.</strong>{" "}CSV or QIF for tax season.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Acceptance criteria</h3>

        <p>You&apos;re done when:</p>

        <ul className="list-disc pl-6 space-y-1 my-4">
          <li>You can drag a phone photo of a receipt onto the page and get a populated table back within ~5 seconds.</li>
          <li>The validator catches contrived bad receipts (you can hand-edit the JSON to confirm) and flags them for review.</li>
          <li>The same image uploaded twice updates the row instead of inserting a duplicate.</li>
          <li>The history page shows aggregations for the test user across at least 5 receipts.</li>
          <li>An iPhone HEIC upload returns a clear error message instead of a 500.</li>
          <li>A 12 MB image upload returns 413 instead of OOM-ing your server.</li>
        </ul>

        <Callout variant="spring" title="Test fixtures matter">
          <p className="m-0">
            Build a <code>fixtures/</code> directory of 10-20 real receipts (yours, your roommate&apos;s,
            whatever). Some printed, some thermal-paper, some screenshots, one HEIC, one PDF. Run
            your pipeline against the whole set on every change and eyeball the results. This is
            your eval suite — Module 28 will formalize it, but a manual version pays off
            immediately.
          </p>
        </Callout>

        <Checkpoint
          moduleSlug="multimodal"
          id="project"
          title="Project: receipt parser"
          xp={75}
          manual
          manualLabel="My receipt parser ships"
          celebration="You shipped a vision feature end-to-end. Photo in, validated JSON out, history aggregated. That's a real product."
        >
          <p>
            Mark this complete when you can drag a phone photo of a real receipt onto your app and
            see a populated table within ~5 seconds, with reconciliation validation, idempotent
            uploads, and at least 5 receipts visible on a working history page.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* FINAL QUIZ                                                          */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-3">Final quiz</h2>

        <Checkpoint moduleSlug="multimodal" id="final" title="Final quiz" xp={50} celebration="Phase 4 complete. Frontend AI integration is now in your toolkit.">
          <Quiz
            kind="Final"
            question="A 4032×3024 phone photo is sent to Claude's vision API as base64. Roughly how does its visual token count compare to the same image resized to 1024×768 first?"
            options={[
              { label: "Identical — the model resizes server-side anyway.", explanation: "Server-side resizing is lossy and you still pay for the upload bytes and the post-resize tokens. Don't lean on it." },
              { label: "About 4× more, because tokens scale with the long-edge ratio.", explanation: "Tokens scale with pixel count, not edge length. The ratio is closer to ~15× by area." },
              { label: "About 12× more — token count scales with pixel count, and 12 MP / 0.8 MP ≈ 15×, rounding to ~12× after caps.", correct: true, explanation: "Patches → tokens, pixels → patches. The scaling is roughly linear in pixel count, so megapixel ratio is your napkin estimate. Always resize on your side." },
              { label: "About 2× more — providers cap visual tokens at a fixed budget.", explanation: "There's no fixed-token cap that hides the ratio. Resolution maps to cost." },
            ]}
            xp={10}
          />

          <Quiz
            kind="Final"
            question="Your validator catches a Receipt with total=16.05 when the actual total was 16.55. Which check did the work?"
            options={[
              { label: "It re-ran the extraction and majority-voted across attempts.", explanation: "Re-running is expensive and often gets the same answer; reconciliation is cheaper and catches more." },
              { label: "It cross-checked with a local OCR library.", explanation: "A fine belt-and-suspenders move, but reconciliation arithmetic catches this class for free." },
              { label: "It verified subtotal + tax ≈ total within a 0.02 tolerance and flagged when the equation didn't hold.", correct: true, explanation: "The fundamental contract a real receipt has to satisfy. When the model's totals don't reconcile, something's wrong. Cheap, deterministic, no extra LLM call." },
              { label: "Spring AI's .entity() converter automatically verified arithmetic.", explanation: "Spring AI parses against the schema. It doesn't validate domain invariants — that's your job." },
            ]}
            xp={10}
          />

          <Quiz
            kind="Final"
            question="Mixing scanned receipts (saved as PDF) with digitally-exported invoices (also PDF). What's the right routing strategy?"
            options={[
              { label: "Always rasterize each page and send as image.", explanation: "Wasteful and lossy for digital PDFs that already have perfect text." },
              { label: "Always extract text with PDFBox.", explanation: "Fails on scans where there's no embedded text, or where the embedded text is garbage from a bad OCR layer." },
              { label: "Try text extraction first; on too-little or too-garbled output, fall back to rasterizing the page as an image.", correct: true, explanation: "Cheap path first, expensive fallback for what the cheap path can't handle. Free perfect text on digital, near-OCR quality on scans." },
              { label: "Use Claude's native PDF support and let the provider decide.", explanation: "Convenient, but you pay for every page even when extraction would have been free." },
            ]}
            xp={10}
          />

          <Quiz
            kind="Final"
            question="Your receipt upload endpoint validates files at 8 MB. A 5 MB phone photo gets MaxUploadSizeExceededException before your validator even runs. Why?"
            options={[
              { label: "Spring AI caps image inputs at 4 MB.", explanation: "It doesn't — provider limits are higher than that." },
              { label: "Anthropic rejects base64 image data above 4 MB.", explanation: "Limit is higher and unrelated to where this exception fires." },
              { label: "Spring's default multipart cap is 1 MB per file. Bump spring.servlet.multipart.max-file-size and max-request-size in application.yml.", correct: true, explanation: "Spring rejects oversized multipart uploads at the parser, before your controller runs. Your in-code cap is dead weight unless the parser is configured to let bigger files through first." },
              { label: "JVM heap can't base64-encode 5 MB.", explanation: "Default heaps handle this trivially. The exception name is a strong hint that it's a multipart-config problem, not memory." },
            ]}
            xp={10}
          />

          <Quiz
            kind="Final"
            question="You ask the model 'count the people in this photo' on an image with 47 people. It returns '~50'. What's the right systems-level response?"
            options={[
              { label: "Add few-shot examples that show counting up to 50.", explanation: "Few-shot is a prompting fix; it can't lift a capability ceiling. Counting beyond ~20 is unreliable regardless of examples." },
              { label: "Lower temperature to 0 and re-run.", explanation: "Temperature is about sampling, not capability. The model still can't count 47 reliably at temp=0." },
              { label: "Recognize that vision models do small-N counting and rough estimation, but not precise counts past ~20. Wire an object-detection library (YOLO, vision API) into a tool-use loop and let the LLM call it.", correct: true, explanation: "The LLM coordinates and reasons; a specialized model does the counting. This is the Module 11 tool-use pattern applied to a vision capability gap. Use the right tool for each subtask." },
              { label: "Vision models can't count at all — never use them for any quantitative task.", explanation: "Too strong. Counting 3 of something on a desk is reliable. The cliff is around 20." },
            ]}
            xp={10}
          />
        </Checkpoint>
      </section>

      <section className="not-prose mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 mb-4">Phase 4 complete — onward.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/courses/ai/modules/chat-interface"
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 p-4 transition"
          >
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Previous</div>
            <div className="font-bold">Module 21 · Full chat interface</div>
          </Link>
          <Link
            href="/courses/ai/modules/agents-intro"
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 p-4 transition"
          >
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Up next</div>
            <div className="font-bold">Phase 5 · Agents &amp; advanced patterns</div>
          </Link>
        </div>
      </section>
        <ModuleNav courseId="ai" currentSlug="multimodal" />
    </article>
  );
}
