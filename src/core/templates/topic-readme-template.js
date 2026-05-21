(function initializeTopicReadmeTemplate(globalObject) {
  function createTopicReadmeTemplate(topicName) {
    return [
      `# ${topicName}`,
      '',
      'Use this page as your personal algorithm playbook.',
      '',
      'Write freely in Markdown: concepts, mental models, gotchas, links, snippets, or your own tips. Keep what helps you recognize this topic faster next time.',
      '',
      'This README works well with GitHub, Obsidian, Notion, or any Markdown-friendly notes app.',
      '',
    ].join('\n');
  }

  globalObject.LeetHubTopicReadmeTemplate = {
    createTopicReadmeTemplate,
  };
})(globalThis);
