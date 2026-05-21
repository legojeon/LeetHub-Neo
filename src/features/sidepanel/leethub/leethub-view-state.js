const VALID_LEETHUB_SUBVIEWS = new Set(['home', 'settings']);

export function normalizeLeetHubSubview(subview) {
  return VALID_LEETHUB_SUBVIEWS.has(subview) ? subview : 'home';
}

export function getLeetHubSubviewVisibility(subview) {
  const normalizedSubview = normalizeLeetHubSubview(subview);

  return {
    homeHidden: normalizedSubview !== 'home',
    settingsHidden: normalizedSubview !== 'settings',
  };
}

export function createDifficultyStatItems(stats = {}) {
  return [
    { key: 'easy', label: 'Easy', value: stats.easy ?? 0 },
    { key: 'medium', label: 'Med', value: stats.medium ?? 0 },
    { key: 'hard', label: 'Hard', value: stats.hard ?? 0 },
  ];
}

export function createDifficultyDonutStyle(stats = {}) {
  const items = [
    { value: stats.easy ?? 0, color: '#00b8a3' },
    { value: stats.medium ?? 0, color: '#ffc01e' },
    { value: stats.hard ?? 0, color: '#ff375f' },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return 'conic-gradient(#ebedf0 0% 100%)';
  }

  let cursor = 0;
  const segments = items
    .filter(item => item.value > 0)
    .map(item => {
      const start = cursor;
      const end = cursor + Math.round((item.value / total) * 100);
      cursor = end;
      return `${item.color} ${start}% ${end}%`;
    });

  if (segments.length) {
    segments[segments.length - 1] = segments[segments.length - 1].replace(/\d+%$/, '100%');
  }

  return `conic-gradient(${segments.join(', ')})`;
}

export function createActivityGridItems(
  activityByDate = {},
  { endDate = new Date(), weeks = 18 } = {},
) {
  const totalDays = Math.max(1, weeks) * 7;
  const dates = [];
  const cursor = new Date(endDate);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - totalDays + 1);

  for (let index = 0; index < totalDays; index += 1) {
    const date = formatDate(cursor);
    dates.push({
      date,
      count: activityByDate[date] ?? 0,
      level: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const maxCount = Math.max(...dates.map(item => item.count), 0);

  return dates.map(item => ({
    ...item,
    level: getActivityLevel(item.count, maxCount),
  }));
}

export function createTopTagItems(stats = {}, limit = 6) {
  const solved = stats.solved || 0;

  return (stats.topTags ?? []).slice(0, limit).map(tag => ({
    slug: tag.slug,
    name: tag.name,
    count: tag.count,
    percentage: solved ? Math.round((tag.count / solved) * 100) : 0,
  }));
}

function getActivityLevel(count, maxCount) {
  if (!count || !maxCount) {
    return 0;
  }

  return Math.max(1, Math.ceil((count / maxCount) * 4));
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function applyLeetHubSubview($, subview) {
  const visibility = getLeetHubSubviewVisibility(subview);
  $('#leethub_home_view').prop('hidden', visibility.homeHidden);
  $('#leethub_settings_view').prop('hidden', visibility.settingsHidden);
}
