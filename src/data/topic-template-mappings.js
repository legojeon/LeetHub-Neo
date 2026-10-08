(function initializeTopicTemplateMappings(globalObject) {
  // Keys are LeetCode's stable tagId values. `slug` is also the canonical GitHub
  // folder name; add renamed LeetCode slugs to `aliases` instead of changing it.
  // Matching contexts replace the default list, and multiple matches are unioned.
  // An omitted topic intentionally receives no bundled default but can still use
  // user-created templates.
  const builtin = (group, template) => `builtin:${group}/${template}`;
  const group = (name, templates) => templates.map(template => builtin(name, template));

  const arrayTemplates = group('array', [
    'prefix-sum',
    'sliding-window',
    'string-building',
    'two-pointers-one-input',
    'two-pointers-two-inputs',
  ]);
  const binarySearchTemplates = group('binary-search', [
    'binary-search',
    'duplicate-elements-left-insertion',
    'duplicate-elements-right-insertion',
    'greedy-maximum',
    'greedy-minimum',
  ]);
  const binaryTreeTemplates = group('binary-tree', ['bfs', 'dfs-iterative', 'dfs-recursive']);
  const bitTemplates = group('bit-manipulation', [
    'check-power-of-two',
    'clear-kth-bit',
    'count-set-bits',
    'divide-power-of-two',
    'get-rightmost-bit',
    'multiply-power-of-two',
    'set-kth-bit',
    'swap-variables',
    'test-kth-bit',
    'toggle-kth-bit',
  ]);
  const graphTemplates = group('graph', [
    'bellman-ford',
    'bfs',
    'dfs-iterative',
    'dfs-recursive',
    'dijkstra',
    'kahn',
    'kruskal',
    'prim',
  ]);
  const sortingTemplates = group('sorting', [
    'bubble-sort',
    'bucket-sort',
    'counting-sort',
    'heap-sort',
    'insertion-sort',
    'merge-sort',
    'quick-sort',
    'radix-sort',
    'selection-sort',
    'shell-sort',
    'tim-sort',
  ]);

  globalObject.LeetHubTopicTemplateMappings = {
    version: 1,
    topics: {
      5: {
        slug: 'array',
        templates: [builtin('data-structures', 'array'), ...arrayTemplates],
      },
      6: {
        slug: 'hash-table',
        aliases: ['hash-map'],
        templates: [
          builtin('data-structures', 'hash-map'),
          builtin('hash-table', 'find-number-of-subarrays'),
          builtin('hash-table', 'sliding-window'),
        ],
      },
      7: {
        slug: 'linked-list',
        templates: [
          builtin('data-structures', 'linked-list'),
          builtin('linked-list', 'fast-and-slow-pointer'),
          builtin('linked-list', 'reverse-linked-list'),
        ],
      },
      9: {
        slug: 'two-pointers',
        templates: [
          builtin('array', 'two-pointers-one-input'),
          builtin('array', 'two-pointers-two-inputs'),
        ],
        contexts: [
          {
            anyOf: ['7'],
            templates: [builtin('linked-list', 'fast-and-slow-pointer')],
          },
        ],
      },
      10: {
        slug: 'string',
        templates: [builtin('array', 'string-building')],
      },
      11: { slug: 'binary-search', templates: binarySearchTemplates },
      12: {
        slug: 'divide-and-conquer',
        templates: [builtin('sorting', 'merge-sort'), builtin('sorting', 'quick-sort')],
      },
      13: {
        slug: 'dynamic-programming',
        aliases: ['dp'],
        templates: group('dynamic-programming', ['bottom-up', 'top-down', 'kadane']),
      },
      14: {
        slug: 'backtracking',
        templates: [builtin('backtracking', 'backtracking')],
      },
      15: {
        slug: 'stack',
        templates: [],
        contexts: [
          {
            anyOf: ['61054'],
            templates: group('stack', ['monotonic-decreasing', 'monotonic-increasing']),
          },
        ],
      },
      16: {
        slug: 'heap',
        templates: [builtin('heap', 'find-top-k-elements')],
      },
      17: {
        slug: 'greedy',
        templates: [],
        contexts: [
          {
            anyOf: ['11'],
            templates: [
              builtin('binary-search', 'greedy-maximum'),
              builtin('binary-search', 'greedy-minimum'),
            ],
          },
        ],
      },
      19: { slug: 'bit-manipulation', templates: bitTemplates },
      20: {
        slug: 'tree',
        templates: [builtin('data-structures', 'binary-tree'), ...binaryTreeTemplates],
      },
      21: {
        slug: 'depth-first-search',
        aliases: ['dfs'],
        templates: [
          builtin('graph', 'dfs-iterative'),
          builtin('graph', 'dfs-recursive'),
          builtin('binary-tree', 'dfs-iterative'),
          builtin('binary-tree', 'dfs-recursive'),
        ],
        contexts: [
          {
            anyOf: ['24'],
            templates: [builtin('graph', 'dfs-iterative'), builtin('graph', 'dfs-recursive')],
          },
          {
            anyOf: ['20', '61057'],
            templates: [
              builtin('binary-tree', 'dfs-iterative'),
              builtin('binary-tree', 'dfs-recursive'),
            ],
          },
        ],
      },
      22: {
        slug: 'breadth-first-search',
        aliases: ['bfs'],
        templates: [builtin('graph', 'bfs'), builtin('binary-tree', 'bfs')],
        contexts: [
          { anyOf: ['24'], templates: [builtin('graph', 'bfs')] },
          { anyOf: ['20', '61057'], templates: [builtin('binary-tree', 'bfs')] },
        ],
      },
      23: {
        slug: 'union-find',
        templates: group('data-structures', ['union-find', 'union-find-optimized']),
      },
      24: {
        slug: 'graph',
        aliases: ['graph-theory'],
        templates: [builtin('data-structures', 'graph'), ...graphTemplates],
      },
      26: { slug: 'topological-sort', templates: [builtin('graph', 'kahn')] },
      27: { slug: 'trie', templates: [builtin('data-structures', 'trie')] },
      30: {
        slug: 'binary-search-tree',
        aliases: ['bst'],
        templates: [builtin('data-structures', 'binary-search-tree')],
      },
      31: {
        slug: 'recursion',
        templates: [],
        contexts: [
          { anyOf: ['14'], templates: [builtin('backtracking', 'backtracking')] },
          { anyOf: ['24'], templates: [builtin('graph', 'dfs-recursive')] },
          {
            anyOf: ['20', '61057'],
            templates: [builtin('binary-tree', 'dfs-recursive')],
          },
        ],
      },
      33: { slug: 'memoization', templates: [builtin('dynamic-programming', 'top-down')] },
      34: {
        slug: 'queue',
        templates: [],
        contexts: [
          { anyOf: ['24'], templates: [builtin('graph', 'bfs')] },
          { anyOf: ['20', '61057'], templates: [builtin('binary-tree', 'bfs')] },
        ],
      },
      55821: {
        slug: 'sliding-window',
        templates: [builtin('array', 'sliding-window'), builtin('hash-table', 'sliding-window')],
      },
      61049: { slug: 'sorting', templates: sortingTemplates },
      61050: {
        slug: 'heap-priority-queue',
        aliases: ['priority-queue'],
        templates: [builtin('heap', 'find-top-k-elements')],
      },
      61051: { slug: 'merge-sort', templates: [builtin('sorting', 'merge-sort')] },
      61053: {
        slug: 'matrix',
        templates: group('matrix', ['create-copy', 'diagonals', 'rotate-transpose']),
      },
      61054: {
        slug: 'monotonic-stack',
        templates: group('stack', ['monotonic-decreasing', 'monotonic-increasing']),
      },
      61057: {
        slug: 'binary-tree',
        templates: [builtin('data-structures', 'binary-tree'), ...binaryTreeTemplates],
      },
      61058: {
        slug: 'doubly-linked-list',
        templates: [builtin('data-structures', 'doubly-linked-list')],
      },
      61060: { slug: 'bucket-sort', templates: [builtin('sorting', 'bucket-sort')] },
      61061: { slug: 'radix-sort', templates: [builtin('sorting', 'radix-sort')] },
      61062: { slug: 'counting', templates: [builtin('data-structures', 'hash-map')] },
      61063: {
        slug: 'data-stream',
        templates: [],
        contexts: [{ anyOf: ['16', '61050'], templates: [builtin('heap', 'find-top-k-elements')] }],
      },
      61066: {
        slug: 'enumeration',
        templates: [],
        contexts: [{ anyOf: ['14', '31'], templates: [builtin('backtracking', 'backtracking')] }],
      },
      61068: {
        slug: 'prefix-sum',
        templates: [builtin('array', 'prefix-sum')],
        contexts: [
          {
            anyOf: ['6'],
            templates: [
              builtin('array', 'prefix-sum'),
              builtin('hash-table', 'find-number-of-subarrays'),
            ],
          },
        ],
      },
      61071: {
        slug: 'monotonic-queue',
        templates: [],
        contexts: [{ anyOf: ['55821'], templates: [builtin('array', 'sliding-window')] }],
      },
      61072: { slug: 'counting-sort', templates: [builtin('sorting', 'counting-sort')] },
      61076: {
        slug: 'shortest-path',
        templates: [builtin('graph', 'dijkstra'), builtin('graph', 'bellman-ford')],
      },
      61078: { slug: 'bitmask', templates: bitTemplates },
      61083: {
        slug: 'minimum-spanning-tree',
        aliases: ['mst'],
        templates: [builtin('graph', 'kruskal'), builtin('graph', 'prim')],
      },
    },
  };
})(globalThis);
