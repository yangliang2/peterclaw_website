import { writeFile } from "node:fs/promises";

const outputFlagIndex = process.argv.indexOf("--output");
const outputPath =
  outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : undefined;

const baseUrl = normalizeBaseUrl(
  process.env.SMOKE_BASE_URL ?? "https://peterclaw-website.vercel.app",
);
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 10000);
const checks = [
  { label: "Home", path: "/", expects: "html" },
  { label: "Chinese home", path: "/zh/", expects: "html" },
  { label: "English home", path: "/en/", expects: "html" },
  { label: "Chinese blog", path: "/zh/blog/", expects: "html" },
  { label: "English blog", path: "/en/blog/", expects: "html" },
  { label: "Chinese tools", path: "/zh/tools/", expects: "html" },
  { label: "English tools", path: "/en/tools/", expects: "html" },
  { label: "Sitemap index", path: "/sitemap-index.xml", expects: "sitemap" },
];

const startedAt = Date.now();
const results = [];

for (const check of checks) {
  results.push(await runCheck(check));
}

const failed = results.filter((result) => !result.ok);
const markdown = renderSummary(results, failed);

if (outputPath) {
  await writeFile(outputPath, markdown);
} else {
  process.stdout.write(markdown);
}

if (failed.length > 0) {
  process.exitCode = 1;
}

async function runCheck(check) {
  const url = new URL(check.path, baseUrl).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "peterclaw-production-smoke/1.0",
      },
    });
    const body = await response.text();
    const durationMs = Date.now() - start;
    const contentType = response.headers.get("content-type") ?? "";
    const contentOk = contentMatches(check.expects, body, contentType);
    const ok = response.ok && contentOk;

    return {
      ...check,
      url,
      status: response.status,
      durationMs,
      ok,
      detail: ok
        ? "OK"
        : response.ok
          ? `Unexpected ${check.expects} response`
          : response.statusText || "HTTP failure",
    };
  } catch (error) {
    return {
      ...check,
      url,
      status: "n/a",
      durationMs: Date.now() - start,
      ok: false,
      detail:
        error.name === "AbortError"
          ? "Request timed out"
          : networkErrorMessage(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function contentMatches(expectation, body, contentType) {
  if (expectation === "sitemap") {
    return (
      contentType.includes("xml") &&
      (body.includes("<sitemapindex") || body.includes("<urlset"))
    );
  }

  return contentType.includes("html") && /<html[\s>]/i.test(body);
}

function renderSummary(results, failed) {
  const elapsedMs = Date.now() - startedAt;
  const status = failed.length === 0 ? "PASS" : "FAIL";
  const rows = results.map(
    (result) =>
      `| ${result.ok ? "PASS" : "FAIL"} | ${result.label} | \`${result.path}\` | ${result.status} | ${result.durationMs} ms | ${result.detail} |`,
  );

  return [
    "## Production smoke test",
    "",
    `Result: **${status}**`,
    `Base URL: ${baseUrl}`,
    `Elapsed: ${elapsedMs} ms`,
    "",
    "| Result | Check | Path | HTTP | Duration | Detail |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...rows,
    "",
  ].join("\n");
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function networkErrorMessage(error) {
  const causeCode = error.cause?.code;
  return causeCode ? `${error.message} (${causeCode})` : error.message;
}
