import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'seo-monitor-pages.json');
const HISTORY_PATH = path.join(process.cwd(), 'scripts', 'gsc-ranking-history.json');
const TRIGGER_THRESHOLD = 3; // Ranking drop > 3

async function runMonitor() {
  if (!existsSync(CONFIG_PATH)) {
    console.error('Configuration file not found at:', CONFIG_PATH);
    process.exit(1);
  }

  const pages = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  console.log(`Monitoring ${pages.length} core pages...`);

  // In a real implementation, this would call the GSC API
  // const gscData = await fetchGSCData(pages);
  
  // For now, we simulate the monitoring logic
  const mockData = simulateGSCData(pages);
  
  const history = loadHistory();
  const alerts = checkRankingDrops(mockData, history);

  if (alerts.length > 0) {
    console.log('\n🚨 Ranking Drop Alerts Detected:');
    for (const alert of alerts) {
      console.log(`- ${alert.page}: Dropped ${alert.drop} positions (Current: ${alert.currentRank})`);
      console.log(`  Trigger: RANK_DROP > ${TRIGGER_THRESHOLD}`);
    }
    console.log('\nRecommendation: Trigger "Content Refresh" task for these pages.');
  } else {
    console.log('\n✅ All core pages ranking stable.');
  }

  saveHistory(mockData, history);
}

function loadHistory() {
  if (existsSync(HISTORY_PATH)) {
    return JSON.parse(readFileSync(HISTORY_PATH, 'utf8'));
  }
  return {};
}

function saveHistory(currentData, history) {
  const timestamp = new Date().toISOString();
  const newHistory = { ...history, [timestamp]: currentData };
  
  // Keep only last 4 weeks of data
  const keys = Object.keys(newHistory).sort().slice(-4);
  const trimmedHistory = {};
  for (const key of keys) {
    trimmedHistory[key] = newHistory[key];
  }

  writeFileSync(HISTORY_PATH, JSON.stringify(trimmedHistory, null, 2));
}

function simulateGSCData(pages) {
  // Mock current ranking data
  const data = {};
  for (const page of pages) {
    // Random rank between 1 and 30
    data[page] = Math.floor(Math.random() * 30) + 1;
  }
  return data;
}

function checkRankingDrops(currentData, history) {
  const alerts = [];
  const historyDates = Object.keys(history).sort();
  
  if (historyDates.length < 1) return alerts;

  const lastDate = historyDates[historyDates.length - 1];
  const lastData = history[lastDate];

  for (const page in currentData) {
    if (lastData[page]) {
      const drop = currentData[page] - lastData[page];
      if (drop > TRIGGER_THRESHOLD) {
        alerts.push({
          page,
          drop,
          currentRank: currentData[page],
          previousRank: lastData[page]
        });
      }
    }
  }

  return alerts;
}

runMonitor().catch(console.error);
