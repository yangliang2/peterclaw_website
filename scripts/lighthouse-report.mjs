import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const reportDirectory = ".lighthouseci";
const outputFlagIndex = process.argv.indexOf("--output");
const outputPath =
  outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : undefined;
const budgets = {
  performance: 0.85,
  lcp: 2500,
  cls: 0.1,
  tbt: 200,
};

function milliseconds(value) {
  return Number.isFinite(value) ? `${Math.round(value)} ms` : "n/a";
}

function decimal(value) {
  return Number.isFinite(value) ? value.toFixed(3) : "n/a";
}

function passesMaximum(value, maximum) {
  return Number.isFinite(value) && value <= maximum;
}

function passesMinimum(value, minimum) {
  return Number.isFinite(value) && value >= minimum;
}

function marker(passes) {
  return passes ? "PASS" : "FAIL";
}

function routeFor(report) {
  const rawUrl =
    report.finalDisplayedUrl ?? report.finalUrl ?? report.requestedUrl;
  try {
    return new URL(rawUrl).pathname;
  } catch {
    return rawUrl ?? "unknown route";
  }
}

async function readReports() {
  let filenames = [];
  try {
    filenames = await readdir(reportDirectory);
  } catch {
    return [];
  }

  const reports = [];
  for (const filename of filenames.filter(
    (file) => file.startsWith("lhr-") && file.endsWith(".json"),
  )) {
    const report = JSON.parse(
      await readFile(path.join(reportDirectory, filename), "utf8"),
    );
    const performance = report.categories?.performance?.score;
    reports.push({
      route: routeFor(report),
      performance,
      lcp: report.audits?.["largest-contentful-paint"]?.numericValue,
      cls: report.audits?.["cumulative-layout-shift"]?.numericValue,
      tbt: report.audits?.["total-blocking-time"]?.numericValue,
    });
  }
  return reports;
}

function medianReports(reports) {
  const grouped = new Map();
  for (const report of reports) {
    const reportsForRoute = grouped.get(report.route) ?? [];
    reportsForRoute.push(report);
    grouped.set(report.route, reportsForRoute);
  }
  return [...grouped.values()]
    .map(
      (routeReports) =>
        routeReports.sort((a, b) => a.performance - b.performance)[
          Math.floor(routeReports.length / 2)
        ],
    )
    .sort((a, b) => a.route.localeCompare(b.route));
}

function render(reports) {
  const header = [
    "## Lighthouse CI performance budget",
    "",
    "Thresholds: Performance >= 85, LCP <= 2500 ms, CLS <= 0.100, TBT <= 200 ms (lab proxy for INP).",
    "",
  ];

  if (reports.length === 0) {
    return [
      ...header,
      "No Lighthouse JSON reports were produced. Inspect the workflow log for the collection failure.",
      "",
    ].join("\n");
  }

  const rows = reports.map((report) => {
    const performanceScore = Number.isFinite(report.performance)
      ? Math.round(report.performance * 100)
      : "n/a";
    const result = [
      passesMinimum(report.performance, budgets.performance),
      passesMaximum(report.lcp, budgets.lcp),
      passesMaximum(report.cls, budgets.cls),
      passesMaximum(report.tbt, budgets.tbt),
    ].every(Boolean);
    return `| \`${report.route}\` | ${performanceScore} | ${milliseconds(report.lcp)} | ${decimal(report.cls)} | ${milliseconds(report.tbt)} | ${marker(result)} |`;
  });

  return [
    ...header,
    "| Audited route | Performance | LCP | CLS | TBT | Budget result |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...rows,
    "",
    "_Values are the median Lighthouse run for each route. Download the retained workflow artifact for full reports._",
    "",
  ].join("\n");
}

const markdown = render(medianReports(await readReports()));
if (outputPath) {
  await writeFile(outputPath, markdown);
} else {
  process.stdout.write(markdown);
}
