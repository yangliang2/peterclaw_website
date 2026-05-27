import { writeFile } from "node:fs/promises";

const outputFlagIndex = process.argv.indexOf("--output");
const outputPath =
  outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : undefined;

const token = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID;
const teamId = process.env.VERCEL_TEAM_ID;
const target = process.env.VERCEL_TARGET ?? "preview";
const commitSha = process.env.GITHUB_SHA;

const markdown = await render().catch((error) =>
  [
    "## Vercel deployment status",
    "",
    "Vercel deployment status could not be queried.",
    "",
    `Error: ${escapePipes(error.message)}`,
    "",
  ].join("\n"),
);

if (outputPath) {
  await writeFile(outputPath, markdown);
} else {
  process.stdout.write(markdown);
}

async function render() {
  const header = ["## Vercel deployment status", ""];

  if (!token || !projectId) {
    return [
      ...header,
      "Vercel API secrets are not configured, so deployment status could not be queried.",
      "",
      "Required GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`; optional: `VERCEL_TEAM_ID`.",
      "",
    ].join("\n");
  }

  const deployment = await findDeployment();
  if (!deployment) {
    return [
      ...header,
      `No ${target} deployment was found for commit \`${shortSha(commitSha)}\`.`,
      "",
      "Check that Vercel's Git integration is enabled and that the deployment has started.",
      "",
    ].join("\n");
  }

  const deploymentUrl = deployment.url ? `https://${deployment.url}` : "n/a";
  const inspectorUrl = deployment.inspectorUrl ?? "n/a";
  const readyState = deployment.readyState ?? deployment.state ?? "UNKNOWN";
  const checksState = deployment.checksState ?? "n/a";
  const checksConclusion = deployment.checksConclusion ?? "n/a";
  const createdAt = formatDate(deployment.createdAt ?? deployment.created);
  const readyAt = formatDate(deployment.ready);
  const error = deployment.errorMessage ?? deployment.errorCode ?? "";

  return [
    ...header,
    `Deployment: **${readyState}**`,
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Target | ${deployment.target ?? target} |`,
    `| Commit | \`${shortSha(commitSha)}\` |`,
    `| URL | ${deploymentUrl} |`,
    `| Inspector | ${inspectorUrl} |`,
    `| Checks | ${checksState} / ${checksConclusion} |`,
    `| Created | ${createdAt} |`,
    `| Ready | ${readyAt} |`,
    ...(error ? [`| Error | ${escapePipes(error)} |`] : []),
    "",
  ].join("\n");
}

async function findDeployment() {
  const params = new URLSearchParams({
    limit: "20",
    projectId,
  });
  if (teamId) params.set("teamId", teamId);
  if (target) params.set("target", target);

  const response = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel API returned ${response.status}: ${body}`);
  }

  const data = await response.json();
  const deployments = Array.isArray(data.deployments) ? data.deployments : [];

  return (
    deployments.find((deployment) => matchesCommit(deployment, commitSha)) ??
    deployments[0]
  );
}

function matchesCommit(deployment, sha) {
  if (!sha) return false;
  const meta = deployment.meta ?? {};
  return (
    meta.githubCommitSha === sha ||
    meta.githubCommitRef === sha ||
    deployment.gitSource?.sha === sha
  );
}

function shortSha(sha) {
  return typeof sha === "string" && sha.length >= 7 ? sha.slice(0, 7) : "unknown";
}

function formatDate(value) {
  if (!Number.isFinite(value)) return "n/a";
  return new Date(value).toISOString();
}

function escapePipes(value) {
  return String(value).replaceAll("|", "\\|");
}
