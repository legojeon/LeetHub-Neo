(function initializeTopicReadmeTemplate(globalObject) {
  function createTopicReadmeTemplate(topicName) {
    return [
      `# ${topicName}`,
      '',
      'Use this page as your personal algorithm playbook.',
      '',
      'Write freely in Markdown: concepts, mental models, gotchas, links, snippets, or your own tips. Keep what helps you recognize this topic faster next time.',
      '',
      '## Code Notes',
      '',
      '```python',
      '# You can write a short example for this topic here.',
      'def example():',
      '    pass',
      '```',
      '',
      'This README works well with GitHub, Obsidian, Notion, or any Markdown-friendly notes app.',
      '',
    ].join('\n');
  }

  globalObject.LeetHubTopicReadmeTemplate = {
    createTopicReadmeTemplate,
  };
})(globalThis);
