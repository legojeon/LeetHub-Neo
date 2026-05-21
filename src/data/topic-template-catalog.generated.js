(function initializeTopicTemplateCatalog(globalObject) {
  globalObject.LeetHubTopicTemplateCatalog = {
    version: 1,
    source: 'leetcode-cheatsheet/src/code',
    languages: [
      {
        slug: 'cpp',
        name: 'C++',
        extension: '.cpp',
      },
      {
        slug: 'java',
        name: 'Java',
        extension: '.java',
      },
      {
        slug: 'javascript',
        name: 'JavaScript',
        extension: '.js',
      },
      {
        slug: 'lua',
        name: 'Lua',
        extension: '.lua',
      },
      {
        slug: 'python',
        name: 'Python',
        extension: '.py',
      },
      {
        slug: 'ruby',
        name: 'Ruby',
        extension: '.rb',
      },
    ],
    topics: [
      {
        slug: 'array',
        name: 'Array',
        sourceTopic: 'array',
        templates: [
          {
            id: 'prefix-sum',
            title: 'Prefix Sum',
            files: {
              cpp: {
                filename: 'prefix_sum.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/array/prefix_sum.cpp',
                targetPath: 'templates/cpp/prefix_sum.cpp',
              },
              java: {
                filename: 'prefix_sum.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/array/prefix_sum.java',
                targetPath: 'templates/java/prefix_sum.java',
              },
              javascript: {
                filename: 'prefix_sum.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/array/prefix_sum.js',
                targetPath: 'templates/javascript/prefix_sum.js',
              },
              lua: {
                filename: 'prefix_sum.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/array/prefix_sum.lua',
                targetPath: 'templates/lua/prefix_sum.lua',
              },
              python: {
                filename: 'prefix_sum.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/array/prefix_sum.py',
                targetPath: 'templates/python/prefix_sum.py',
              },
              ruby: {
                filename: 'prefix_sum.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/array/prefix_sum.rb',
                targetPath: 'templates/ruby/prefix_sum.rb',
              },
            },
          },
          {
            id: 'sliding-window',
            title: 'Sliding Window',
            files: {
              cpp: {
                filename: 'sliding_window.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/array/sliding_window.cpp',
                targetPath: 'templates/cpp/sliding_window.cpp',
              },
              java: {
                filename: 'sliding_window.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/array/sliding_window.java',
                targetPath: 'templates/java/sliding_window.java',
              },
              javascript: {
                filename: 'sliding_window.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/array/sliding_window.js',
                targetPath: 'templates/javascript/sliding_window.js',
              },
              lua: {
                filename: 'sliding_window.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/array/sliding_window.lua',
                targetPath: 'templates/lua/sliding_window.lua',
              },
              python: {
                filename: 'sliding_window.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/array/sliding_window.py',
                targetPath: 'templates/python/sliding_window.py',
              },
              ruby: {
                filename: 'sliding_window.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/array/sliding_window.rb',
                targetPath: 'templates/ruby/sliding_window.rb',
              },
            },
          },
          {
            id: 'string-building',
            title: 'String Building',
            files: {
              cpp: {
                filename: 'string_building.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/array/string_building.cpp',
                targetPath: 'templates/cpp/string_building.cpp',
              },
              java: {
                filename: 'string_building.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/array/string_building.java',
                targetPath: 'templates/java/string_building.java',
              },
              javascript: {
                filename: 'string_building.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/array/string_building.js',
                targetPath: 'templates/javascript/string_building.js',
              },
              lua: {
                filename: 'string_building.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/array/string_building.lua',
                targetPath: 'templates/lua/string_building.lua',
              },
              python: {
                filename: 'string_building.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/array/string_building.py',
                targetPath: 'templates/python/string_building.py',
              },
              ruby: {
                filename: 'string_building.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/array/string_building.rb',
                targetPath: 'templates/ruby/string_building.rb',
              },
            },
          },
          {
            id: 'two-pointers-one-input',
            title: 'Two Pointers One Input',
            files: {
              cpp: {
                filename: 'two_pointers_one_input.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/array/two_pointers_one_input.cpp',
                targetPath: 'templates/cpp/two_pointers_one_input.cpp',
              },
              java: {
                filename: 'two_pointers_one_input.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/array/two_pointers_one_input.java',
                targetPath: 'templates/java/two_pointers_one_input.java',
              },
              javascript: {
                filename: 'two_pointers_one_input.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/array/two_pointers_one_input.js',
                targetPath: 'templates/javascript/two_pointers_one_input.js',
              },
              lua: {
                filename: 'two_pointers_one_input.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/array/two_pointers_one_input.lua',
                targetPath: 'templates/lua/two_pointers_one_input.lua',
              },
              python: {
                filename: 'two_pointers_one_input.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/array/two_pointers_one_input.py',
                targetPath: 'templates/python/two_pointers_one_input.py',
              },
              ruby: {
                filename: 'two_pointers_one_input.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/array/two_pointers_one_input.rb',
                targetPath: 'templates/ruby/two_pointers_one_input.rb',
              },
            },
          },
          {
            id: 'two-pointers-two-inputs',
            title: 'Two Pointers Two Inputs',
            files: {
              cpp: {
                filename: 'two_pointers_two_inputs.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/array/two_pointers_two_inputs.cpp',
                targetPath: 'templates/cpp/two_pointers_two_inputs.cpp',
              },
              java: {
                filename: 'two_pointers_two_inputs.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/array/two_pointers_two_inputs.java',
                targetPath: 'templates/java/two_pointers_two_inputs.java',
              },
              javascript: {
                filename: 'two_pointers_two_inputs.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/array/two_pointers_two_inputs.js',
                targetPath: 'templates/javascript/two_pointers_two_inputs.js',
              },
              lua: {
                filename: 'two_pointers_two_inputs.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/array/two_pointers_two_inputs.lua',
                targetPath: 'templates/lua/two_pointers_two_inputs.lua',
              },
              python: {
                filename: 'two_pointers_two_inputs.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/array/two_pointers_two_inputs.py',
                targetPath: 'templates/python/two_pointers_two_inputs.py',
              },
              ruby: {
                filename: 'two_pointers_two_inputs.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/array/two_pointers_two_inputs.rb',
                targetPath: 'templates/ruby/two_pointers_two_inputs.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'backtracking',
        name: 'Backtracking',
        sourceTopic: 'backtracking',
        templates: [
          {
            id: 'backtracking',
            title: 'Backtracking',
            files: {
              cpp: {
                filename: 'backtracking.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/backtracking/backtracking.cpp',
                targetPath: 'templates/cpp/backtracking.cpp',
              },
              java: {
                filename: 'backtracking.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/backtracking/backtracking.java',
                targetPath: 'templates/java/backtracking.java',
              },
              javascript: {
                filename: 'backtracking.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/backtracking/backtracking.js',
                targetPath: 'templates/javascript/backtracking.js',
              },
              lua: {
                filename: 'backtracking.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/backtracking/backtracking.lua',
                targetPath: 'templates/lua/backtracking.lua',
              },
              python: {
                filename: 'backtracking.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/backtracking/backtracking.py',
                targetPath: 'templates/python/backtracking.py',
              },
              ruby: {
                filename: 'backtracking.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/backtracking/backtracking.rb',
                targetPath: 'templates/ruby/backtracking.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'binary-search',
        name: 'Binary Search',
        sourceTopic: 'binary_search',
        templates: [
          {
            id: 'binary-search',
            title: 'Binary Search',
            files: {
              cpp: {
                filename: 'binary_search.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/binary_search/binary_search.cpp',
                targetPath: 'templates/cpp/binary_search.cpp',
              },
              java: {
                filename: 'binary_search.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/binary_search/binary_search.java',
                targetPath: 'templates/java/binary_search.java',
              },
              javascript: {
                filename: 'binary_search.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_search/binary_search.js',
                targetPath: 'templates/javascript/binary_search.js',
              },
              lua: {
                filename: 'binary_search.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/binary_search/binary_search.lua',
                targetPath: 'templates/lua/binary_search.lua',
              },
              python: {
                filename: 'binary_search.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/binary_search/binary_search.py',
                targetPath: 'templates/python/binary_search.py',
              },
              ruby: {
                filename: 'binary_search.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/binary_search/binary_search.rb',
                targetPath: 'templates/ruby/binary_search.rb',
              },
            },
          },
          {
            id: 'duplicate-elements-left-insertion',
            title: 'Duplicate Elements Left Insertion',
            files: {
              cpp: {
                filename: 'duplicate_elements_left_insertion.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/binary_search/duplicate_elements_left_insertion.cpp',
                targetPath: 'templates/cpp/duplicate_elements_left_insertion.cpp',
              },
              java: {
                filename: 'duplicate_elements_left_insertion.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/binary_search/duplicate_elements_left_insertion.java',
                targetPath: 'templates/java/duplicate_elements_left_insertion.java',
              },
              javascript: {
                filename: 'duplicate_elements_left_insertion.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_search/duplicate_elements_left_insertion.js',
                targetPath: 'templates/javascript/duplicate_elements_left_insertion.js',
              },
              lua: {
                filename: 'duplicate_elements_left_insertion.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/binary_search/duplicate_elements_left_insertion.lua',
                targetPath: 'templates/lua/duplicate_elements_left_insertion.lua',
              },
              python: {
                filename: 'duplicate_elements_left_insertion.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/binary_search/duplicate_elements_left_insertion.py',
                targetPath: 'templates/python/duplicate_elements_left_insertion.py',
              },
              ruby: {
                filename: 'duplicate_elements_left_insertion.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/binary_search/duplicate_elements_left_insertion.rb',
                targetPath: 'templates/ruby/duplicate_elements_left_insertion.rb',
              },
            },
          },
          {
            id: 'duplicate-elements-right-insertion',
            title: 'Duplicate Elements Right Insertion',
            files: {
              cpp: {
                filename: 'duplicate_elements_right_insertion.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/binary_search/duplicate_elements_right_insertion.cpp',
                targetPath: 'templates/cpp/duplicate_elements_right_insertion.cpp',
              },
              java: {
                filename: 'duplicate_elements_right_insertion.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/binary_search/duplicate_elements_right_insertion.java',
                targetPath: 'templates/java/duplicate_elements_right_insertion.java',
              },
              javascript: {
                filename: 'duplicate_elements_right_insertion.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_search/duplicate_elements_right_insertion.js',
                targetPath: 'templates/javascript/duplicate_elements_right_insertion.js',
              },
              lua: {
                filename: 'duplicate_elements_right_insertion.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/binary_search/duplicate_elements_right_insertion.lua',
                targetPath: 'templates/lua/duplicate_elements_right_insertion.lua',
              },
              python: {
                filename: 'duplicate_elements_right_insertion.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/binary_search/duplicate_elements_right_insertion.py',
                targetPath: 'templates/python/duplicate_elements_right_insertion.py',
              },
              ruby: {
                filename: 'duplicate_elements_right_insertion.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/binary_search/duplicate_elements_right_insertion.rb',
                targetPath: 'templates/ruby/duplicate_elements_right_insertion.rb',
              },
            },
          },
          {
            id: 'greedy-maximum',
            title: 'Greedy Maximum',
            files: {
              cpp: {
                filename: 'greedy_maximum.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/binary_search/greedy_maximum.cpp',
                targetPath: 'templates/cpp/greedy_maximum.cpp',
              },
              java: {
                filename: 'greedy_maximum.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/binary_search/greedy_maximum.java',
                targetPath: 'templates/java/greedy_maximum.java',
              },
              javascript: {
                filename: 'greedy_maximum.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_search/greedy_maximum.js',
                targetPath: 'templates/javascript/greedy_maximum.js',
              },
              lua: {
                filename: 'greedy_maximum.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/binary_search/greedy_maximum.lua',
                targetPath: 'templates/lua/greedy_maximum.lua',
              },
              python: {
                filename: 'greedy_maximum.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/binary_search/greedy_maximum.py',
                targetPath: 'templates/python/greedy_maximum.py',
              },
              ruby: {
                filename: 'greedy_maximum.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/binary_search/greedy_maximum.rb',
                targetPath: 'templates/ruby/greedy_maximum.rb',
              },
            },
          },
          {
            id: 'greedy-minimum',
            title: 'Greedy Minimum',
            files: {
              cpp: {
                filename: 'greedy_minimum.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/binary_search/greedy_minimum.cpp',
                targetPath: 'templates/cpp/greedy_minimum.cpp',
              },
              java: {
                filename: 'greedy_minimum.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/binary_search/greedy_minimum.java',
                targetPath: 'templates/java/greedy_minimum.java',
              },
              javascript: {
                filename: 'greedy_minimum.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_search/greedy_minimum.js',
                targetPath: 'templates/javascript/greedy_minimum.js',
              },
              lua: {
                filename: 'greedy_minimum.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/binary_search/greedy_minimum.lua',
                targetPath: 'templates/lua/greedy_minimum.lua',
              },
              python: {
                filename: 'greedy_minimum.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/binary_search/greedy_minimum.py',
                targetPath: 'templates/python/greedy_minimum.py',
              },
              ruby: {
                filename: 'greedy_minimum.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/binary_search/greedy_minimum.rb',
                targetPath: 'templates/ruby/greedy_minimum.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'binary-tree',
        name: 'Binary Tree',
        sourceTopic: 'binary_tree',
        templates: [
          {
            id: 'bfs',
            title: 'Bfs',
            files: {
              cpp: {
                filename: 'bfs.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/binary_tree/bfs.cpp',
                targetPath: 'templates/cpp/bfs.cpp',
              },
              java: {
                filename: 'bfs.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/binary_tree/bfs.java',
                targetPath: 'templates/java/bfs.java',
              },
              javascript: {
                filename: 'bfs.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/binary_tree/bfs.js',
                targetPath: 'templates/javascript/bfs.js',
              },
              lua: {
                filename: 'bfs.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/binary_tree/bfs.lua',
                targetPath: 'templates/lua/bfs.lua',
              },
              python: {
                filename: 'bfs.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/binary_tree/bfs.py',
                targetPath: 'templates/python/bfs.py',
              },
              ruby: {
                filename: 'bfs.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/binary_tree/bfs.rb',
                targetPath: 'templates/ruby/bfs.rb',
              },
            },
          },
          {
            id: 'dfs-iterative',
            title: 'Dfs Iterative',
            files: {
              cpp: {
                filename: 'dfs_iterative.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/binary_tree/dfs_iterative.cpp',
                targetPath: 'templates/cpp/dfs_iterative.cpp',
              },
              java: {
                filename: 'dfs_iterative.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/binary_tree/dfs_iterative.java',
                targetPath: 'templates/java/dfs_iterative.java',
              },
              javascript: {
                filename: 'dfs_iterative.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_tree/dfs_iterative.js',
                targetPath: 'templates/javascript/dfs_iterative.js',
              },
              lua: {
                filename: 'dfs_iterative.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/binary_tree/dfs_iterative.lua',
                targetPath: 'templates/lua/dfs_iterative.lua',
              },
              python: {
                filename: 'dfs_iterative.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/binary_tree/dfs_iterative.py',
                targetPath: 'templates/python/dfs_iterative.py',
              },
              ruby: {
                filename: 'dfs_iterative.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/binary_tree/dfs_iterative.rb',
                targetPath: 'templates/ruby/dfs_iterative.rb',
              },
            },
          },
          {
            id: 'dfs-recursive',
            title: 'Dfs Recursive',
            files: {
              cpp: {
                filename: 'dfs_recursive.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/binary_tree/dfs_recursive.cpp',
                targetPath: 'templates/cpp/dfs_recursive.cpp',
              },
              java: {
                filename: 'dfs_recursive.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/binary_tree/dfs_recursive.java',
                targetPath: 'templates/java/dfs_recursive.java',
              },
              javascript: {
                filename: 'dfs_recursive.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/binary_tree/dfs_recursive.js',
                targetPath: 'templates/javascript/dfs_recursive.js',
              },
              lua: {
                filename: 'dfs_recursive.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/binary_tree/dfs_recursive.lua',
                targetPath: 'templates/lua/dfs_recursive.lua',
              },
              python: {
                filename: 'dfs_recursive.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/binary_tree/dfs_recursive.py',
                targetPath: 'templates/python/dfs_recursive.py',
              },
              ruby: {
                filename: 'dfs_recursive.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/binary_tree/dfs_recursive.rb',
                targetPath: 'templates/ruby/dfs_recursive.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'bit-manipulation',
        name: 'Bit Manipulation',
        sourceTopic: 'bit_manipulation',
        templates: [
          {
            id: 'check-power-of-two',
            title: 'Check Power Of Two',
            files: {
              cpp: {
                filename: 'check_power_of_two.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/check_power_of_two.cpp',
                targetPath: 'templates/cpp/check_power_of_two.cpp',
              },
              java: {
                filename: 'check_power_of_two.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/check_power_of_two.java',
                targetPath: 'templates/java/check_power_of_two.java',
              },
              javascript: {
                filename: 'check_power_of_two.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/check_power_of_two.js',
                targetPath: 'templates/javascript/check_power_of_two.js',
              },
              lua: {
                filename: 'check_power_of_two.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/check_power_of_two.lua',
                targetPath: 'templates/lua/check_power_of_two.lua',
              },
              python: {
                filename: 'check_power_of_two.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/check_power_of_two.py',
                targetPath: 'templates/python/check_power_of_two.py',
              },
              ruby: {
                filename: 'check_power_of_two.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/check_power_of_two.rb',
                targetPath: 'templates/ruby/check_power_of_two.rb',
              },
            },
          },
          {
            id: 'clear-kth-bit',
            title: 'Clear Kth Bit',
            files: {
              cpp: {
                filename: 'clear_kth_bit.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/clear_kth_bit.cpp',
                targetPath: 'templates/cpp/clear_kth_bit.cpp',
              },
              java: {
                filename: 'clear_kth_bit.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/clear_kth_bit.java',
                targetPath: 'templates/java/clear_kth_bit.java',
              },
              javascript: {
                filename: 'clear_kth_bit.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/clear_kth_bit.js',
                targetPath: 'templates/javascript/clear_kth_bit.js',
              },
              lua: {
                filename: 'clear_kth_bit.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/clear_kth_bit.lua',
                targetPath: 'templates/lua/clear_kth_bit.lua',
              },
              python: {
                filename: 'clear_kth_bit.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/clear_kth_bit.py',
                targetPath: 'templates/python/clear_kth_bit.py',
              },
              ruby: {
                filename: 'clear_kth_bit.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/clear_kth_bit.rb',
                targetPath: 'templates/ruby/clear_kth_bit.rb',
              },
            },
          },
          {
            id: 'count-set-bits',
            title: 'Count Set Bits',
            files: {
              cpp: {
                filename: 'count_set_bits.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/count_set_bits.cpp',
                targetPath: 'templates/cpp/count_set_bits.cpp',
              },
              java: {
                filename: 'count_set_bits.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/count_set_bits.java',
                targetPath: 'templates/java/count_set_bits.java',
              },
              javascript: {
                filename: 'count_set_bits.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/count_set_bits.js',
                targetPath: 'templates/javascript/count_set_bits.js',
              },
              lua: {
                filename: 'count_set_bits.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/count_set_bits.lua',
                targetPath: 'templates/lua/count_set_bits.lua',
              },
              python: {
                filename: 'count_set_bits.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/count_set_bits.py',
                targetPath: 'templates/python/count_set_bits.py',
              },
              ruby: {
                filename: 'count_set_bits.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/count_set_bits.rb',
                targetPath: 'templates/ruby/count_set_bits.rb',
              },
            },
          },
          {
            id: 'divide-power-of-two',
            title: 'Divide Power Of Two',
            files: {
              cpp: {
                filename: 'divide_power_of_two.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/divide_power_of_two.cpp',
                targetPath: 'templates/cpp/divide_power_of_two.cpp',
              },
              java: {
                filename: 'divide_power_of_two.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/divide_power_of_two.java',
                targetPath: 'templates/java/divide_power_of_two.java',
              },
              javascript: {
                filename: 'divide_power_of_two.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/divide_power_of_two.js',
                targetPath: 'templates/javascript/divide_power_of_two.js',
              },
              lua: {
                filename: 'divide_power_of_two.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/divide_power_of_two.lua',
                targetPath: 'templates/lua/divide_power_of_two.lua',
              },
              python: {
                filename: 'divide_power_of_two.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/divide_power_of_two.py',
                targetPath: 'templates/python/divide_power_of_two.py',
              },
              ruby: {
                filename: 'divide_power_of_two.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/divide_power_of_two.rb',
                targetPath: 'templates/ruby/divide_power_of_two.rb',
              },
            },
          },
          {
            id: 'get-rightmost-bit',
            title: 'Get Rightmost Bit',
            files: {
              cpp: {
                filename: 'get_rightmost_bit.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/get_rightmost_bit.cpp',
                targetPath: 'templates/cpp/get_rightmost_bit.cpp',
              },
              java: {
                filename: 'get_rightmost_bit.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/get_rightmost_bit.java',
                targetPath: 'templates/java/get_rightmost_bit.java',
              },
              javascript: {
                filename: 'get_rightmost_bit.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/get_rightmost_bit.js',
                targetPath: 'templates/javascript/get_rightmost_bit.js',
              },
              lua: {
                filename: 'get_rightmost_bit.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/get_rightmost_bit.lua',
                targetPath: 'templates/lua/get_rightmost_bit.lua',
              },
              python: {
                filename: 'get_rightmost_bit.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/get_rightmost_bit.py',
                targetPath: 'templates/python/get_rightmost_bit.py',
              },
              ruby: {
                filename: 'get_rightmost_bit.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/get_rightmost_bit.rb',
                targetPath: 'templates/ruby/get_rightmost_bit.rb',
              },
            },
          },
          {
            id: 'multiply-power-of-two',
            title: 'Multiply Power Of Two',
            files: {
              cpp: {
                filename: 'multiply_power_of_two.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/multiply_power_of_two.cpp',
                targetPath: 'templates/cpp/multiply_power_of_two.cpp',
              },
              java: {
                filename: 'multiply_power_of_two.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/multiply_power_of_two.java',
                targetPath: 'templates/java/multiply_power_of_two.java',
              },
              javascript: {
                filename: 'multiply_power_of_two.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/multiply_power_of_two.js',
                targetPath: 'templates/javascript/multiply_power_of_two.js',
              },
              lua: {
                filename: 'multiply_power_of_two.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/multiply_power_of_two.lua',
                targetPath: 'templates/lua/multiply_power_of_two.lua',
              },
              python: {
                filename: 'multiply_power_of_two.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/multiply_power_of_two.py',
                targetPath: 'templates/python/multiply_power_of_two.py',
              },
              ruby: {
                filename: 'multiply_power_of_two.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/multiply_power_of_two.rb',
                targetPath: 'templates/ruby/multiply_power_of_two.rb',
              },
            },
          },
          {
            id: 'set-kth-bit',
            title: 'Set Kth Bit',
            files: {
              cpp: {
                filename: 'set_kth_bit.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/set_kth_bit.cpp',
                targetPath: 'templates/cpp/set_kth_bit.cpp',
              },
              java: {
                filename: 'set_kth_bit.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/set_kth_bit.java',
                targetPath: 'templates/java/set_kth_bit.java',
              },
              javascript: {
                filename: 'set_kth_bit.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/set_kth_bit.js',
                targetPath: 'templates/javascript/set_kth_bit.js',
              },
              lua: {
                filename: 'set_kth_bit.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/set_kth_bit.lua',
                targetPath: 'templates/lua/set_kth_bit.lua',
              },
              python: {
                filename: 'set_kth_bit.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/set_kth_bit.py',
                targetPath: 'templates/python/set_kth_bit.py',
              },
              ruby: {
                filename: 'set_kth_bit.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/set_kth_bit.rb',
                targetPath: 'templates/ruby/set_kth_bit.rb',
              },
            },
          },
          {
            id: 'swap-variables',
            title: 'Swap Variables',
            files: {
              cpp: {
                filename: 'swap_variables.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/swap_variables.cpp',
                targetPath: 'templates/cpp/swap_variables.cpp',
              },
              java: {
                filename: 'swap_variables.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/swap_variables.java',
                targetPath: 'templates/java/swap_variables.java',
              },
              javascript: {
                filename: 'swap_variables.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/swap_variables.js',
                targetPath: 'templates/javascript/swap_variables.js',
              },
              lua: {
                filename: 'swap_variables.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/swap_variables.lua',
                targetPath: 'templates/lua/swap_variables.lua',
              },
              python: {
                filename: 'swap_variables.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/swap_variables.py',
                targetPath: 'templates/python/swap_variables.py',
              },
              ruby: {
                filename: 'swap_variables.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/swap_variables.rb',
                targetPath: 'templates/ruby/swap_variables.rb',
              },
            },
          },
          {
            id: 'test-kth-bit',
            title: 'Test Kth Bit',
            files: {
              cpp: {
                filename: 'test_kth_bit.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/test_kth_bit.cpp',
                targetPath: 'templates/cpp/test_kth_bit.cpp',
              },
              java: {
                filename: 'test_kth_bit.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/test_kth_bit.java',
                targetPath: 'templates/java/test_kth_bit.java',
              },
              javascript: {
                filename: 'test_kth_bit.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/test_kth_bit.js',
                targetPath: 'templates/javascript/test_kth_bit.js',
              },
              lua: {
                filename: 'test_kth_bit.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/test_kth_bit.lua',
                targetPath: 'templates/lua/test_kth_bit.lua',
              },
              python: {
                filename: 'test_kth_bit.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/test_kth_bit.py',
                targetPath: 'templates/python/test_kth_bit.py',
              },
              ruby: {
                filename: 'test_kth_bit.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/test_kth_bit.rb',
                targetPath: 'templates/ruby/test_kth_bit.rb',
              },
            },
          },
          {
            id: 'toggle-kth-bit',
            title: 'Toggle Kth Bit',
            files: {
              cpp: {
                filename: 'toggle_kth_bit.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/bit_manipulation/toggle_kth_bit.cpp',
                targetPath: 'templates/cpp/toggle_kth_bit.cpp',
              },
              java: {
                filename: 'toggle_kth_bit.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/bit_manipulation/toggle_kth_bit.java',
                targetPath: 'templates/java/toggle_kth_bit.java',
              },
              javascript: {
                filename: 'toggle_kth_bit.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/bit_manipulation/toggle_kth_bit.js',
                targetPath: 'templates/javascript/toggle_kth_bit.js',
              },
              lua: {
                filename: 'toggle_kth_bit.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/bit_manipulation/toggle_kth_bit.lua',
                targetPath: 'templates/lua/toggle_kth_bit.lua',
              },
              python: {
                filename: 'toggle_kth_bit.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/bit_manipulation/toggle_kth_bit.py',
                targetPath: 'templates/python/toggle_kth_bit.py',
              },
              ruby: {
                filename: 'toggle_kth_bit.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/bit_manipulation/toggle_kth_bit.rb',
                targetPath: 'templates/ruby/toggle_kth_bit.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'data-structures',
        name: 'Data Structures',
        sourceTopic: 'data_structures',
        templates: [
          {
            id: 'array',
            title: 'Array',
            files: {
              cpp: {
                filename: 'array.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/array.cpp',
                targetPath: 'templates/cpp/array.cpp',
              },
              java: {
                filename: 'array.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/data_structures/array.java',
                targetPath: 'templates/java/array.java',
              },
              javascript: {
                filename: 'array.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/data_structures/array.js',
                targetPath: 'templates/javascript/array.js',
              },
              lua: {
                filename: 'array.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/array.lua',
                targetPath: 'templates/lua/array.lua',
              },
              python: {
                filename: 'array.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/data_structures/array.py',
                targetPath: 'templates/python/array.py',
              },
              ruby: {
                filename: 'array.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/array.rb',
                targetPath: 'templates/ruby/array.rb',
              },
            },
          },
          {
            id: 'binary-search-tree',
            title: 'Binary Search Tree',
            files: {
              cpp: {
                filename: 'binary_search_tree.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/data_structures/binary_search_tree.cpp',
                targetPath: 'templates/cpp/binary_search_tree.cpp',
              },
              java: {
                filename: 'binary_search_tree.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/data_structures/binary_search_tree.java',
                targetPath: 'templates/java/binary_search_tree.java',
              },
              javascript: {
                filename: 'binary_search_tree.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/binary_search_tree.js',
                targetPath: 'templates/javascript/binary_search_tree.js',
              },
              lua: {
                filename: 'binary_search_tree.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/data_structures/binary_search_tree.lua',
                targetPath: 'templates/lua/binary_search_tree.lua',
              },
              python: {
                filename: 'binary_search_tree.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/data_structures/binary_search_tree.py',
                targetPath: 'templates/python/binary_search_tree.py',
              },
              ruby: {
                filename: 'binary_search_tree.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/data_structures/binary_search_tree.rb',
                targetPath: 'templates/ruby/binary_search_tree.rb',
              },
            },
          },
          {
            id: 'binary-tree',
            title: 'Binary Tree',
            files: {
              cpp: {
                filename: 'binary_tree.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/binary_tree.cpp',
                targetPath: 'templates/cpp/binary_tree.cpp',
              },
              java: {
                filename: 'binary_tree.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/data_structures/binary_tree.java',
                targetPath: 'templates/java/binary_tree.java',
              },
              javascript: {
                filename: 'binary_tree.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/binary_tree.js',
                targetPath: 'templates/javascript/binary_tree.js',
              },
              lua: {
                filename: 'binary_tree.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/binary_tree.lua',
                targetPath: 'templates/lua/binary_tree.lua',
              },
              python: {
                filename: 'binary_tree.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/data_structures/binary_tree.py',
                targetPath: 'templates/python/binary_tree.py',
              },
              ruby: {
                filename: 'binary_tree.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/binary_tree.rb',
                targetPath: 'templates/ruby/binary_tree.rb',
              },
            },
          },
          {
            id: 'doubly-linked-list',
            title: 'Doubly Linked List',
            files: {
              cpp: {
                filename: 'doubly_linked_list.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/data_structures/doubly_linked_list.cpp',
                targetPath: 'templates/cpp/doubly_linked_list.cpp',
              },
              java: {
                filename: 'doubly_linked_list.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/data_structures/doubly_linked_list.java',
                targetPath: 'templates/java/doubly_linked_list.java',
              },
              javascript: {
                filename: 'doubly_linked_list.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/doubly_linked_list.js',
                targetPath: 'templates/javascript/doubly_linked_list.js',
              },
              lua: {
                filename: 'doubly_linked_list.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/data_structures/doubly_linked_list.lua',
                targetPath: 'templates/lua/doubly_linked_list.lua',
              },
              python: {
                filename: 'doubly_linked_list.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/data_structures/doubly_linked_list.py',
                targetPath: 'templates/python/doubly_linked_list.py',
              },
              ruby: {
                filename: 'doubly_linked_list.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/data_structures/doubly_linked_list.rb',
                targetPath: 'templates/ruby/doubly_linked_list.rb',
              },
            },
          },
          {
            id: 'graph',
            title: 'Graph',
            files: {
              cpp: {
                filename: 'graph.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/graph.cpp',
                targetPath: 'templates/cpp/graph.cpp',
              },
              java: {
                filename: 'graph.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/data_structures/graph.java',
                targetPath: 'templates/java/graph.java',
              },
              javascript: {
                filename: 'graph.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/data_structures/graph.js',
                targetPath: 'templates/javascript/graph.js',
              },
              lua: {
                filename: 'graph.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/graph.lua',
                targetPath: 'templates/lua/graph.lua',
              },
              python: {
                filename: 'graph.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/data_structures/graph.py',
                targetPath: 'templates/python/graph.py',
              },
              ruby: {
                filename: 'graph.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/graph.rb',
                targetPath: 'templates/ruby/graph.rb',
              },
            },
          },
          {
            id: 'hash-map',
            title: 'Hash Map',
            files: {
              cpp: {
                filename: 'hash_map.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/hash_map.cpp',
                targetPath: 'templates/cpp/hash_map.cpp',
              },
              java: {
                filename: 'hash_map.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/data_structures/hash_map.java',
                targetPath: 'templates/java/hash_map.java',
              },
              javascript: {
                filename: 'hash_map.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/hash_map.js',
                targetPath: 'templates/javascript/hash_map.js',
              },
              lua: {
                filename: 'hash_map.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/hash_map.lua',
                targetPath: 'templates/lua/hash_map.lua',
              },
              python: {
                filename: 'hash_map.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/data_structures/hash_map.py',
                targetPath: 'templates/python/hash_map.py',
              },
              ruby: {
                filename: 'hash_map.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/hash_map.rb',
                targetPath: 'templates/ruby/hash_map.rb',
              },
            },
          },
          {
            id: 'linked-list',
            title: 'Linked List',
            files: {
              cpp: {
                filename: 'linked_list.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/linked_list.cpp',
                targetPath: 'templates/cpp/linked_list.cpp',
              },
              java: {
                filename: 'linked_list.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/data_structures/linked_list.java',
                targetPath: 'templates/java/linked_list.java',
              },
              javascript: {
                filename: 'linked_list.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/linked_list.js',
                targetPath: 'templates/javascript/linked_list.js',
              },
              lua: {
                filename: 'linked_list.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/linked_list.lua',
                targetPath: 'templates/lua/linked_list.lua',
              },
              python: {
                filename: 'linked_list.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/data_structures/linked_list.py',
                targetPath: 'templates/python/linked_list.py',
              },
              ruby: {
                filename: 'linked_list.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/linked_list.rb',
                targetPath: 'templates/ruby/linked_list.rb',
              },
            },
          },
          {
            id: 'trie',
            title: 'Trie',
            files: {
              cpp: {
                filename: 'trie.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/trie.cpp',
                targetPath: 'templates/cpp/trie.cpp',
              },
              java: {
                filename: 'trie.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/data_structures/trie.java',
                targetPath: 'templates/java/trie.java',
              },
              javascript: {
                filename: 'trie.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/data_structures/trie.js',
                targetPath: 'templates/javascript/trie.js',
              },
              lua: {
                filename: 'trie.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/trie.lua',
                targetPath: 'templates/lua/trie.lua',
              },
              python: {
                filename: 'trie.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/data_structures/trie.py',
                targetPath: 'templates/python/trie.py',
              },
              ruby: {
                filename: 'trie.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/trie.rb',
                targetPath: 'templates/ruby/trie.rb',
              },
            },
          },
          {
            id: 'union-find',
            title: 'Union Find',
            files: {
              cpp: {
                filename: 'union_find.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/data_structures/union_find.cpp',
                targetPath: 'templates/cpp/union_find.cpp',
              },
              java: {
                filename: 'union_find.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/data_structures/union_find.java',
                targetPath: 'templates/java/union_find.java',
              },
              javascript: {
                filename: 'union_find.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/union_find.js',
                targetPath: 'templates/javascript/union_find.js',
              },
              lua: {
                filename: 'union_find.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/data_structures/union_find.lua',
                targetPath: 'templates/lua/union_find.lua',
              },
              python: {
                filename: 'union_find.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/data_structures/union_find.py',
                targetPath: 'templates/python/union_find.py',
              },
              ruby: {
                filename: 'union_find.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/data_structures/union_find.rb',
                targetPath: 'templates/ruby/union_find.rb',
              },
            },
          },
          {
            id: 'union-find-optimized',
            title: 'Union Find Optimized',
            files: {
              cpp: {
                filename: 'union_find_optimized.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/data_structures/union_find_optimized.cpp',
                targetPath: 'templates/cpp/union_find_optimized.cpp',
              },
              java: {
                filename: 'union_find_optimized.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/data_structures/union_find_optimized.java',
                targetPath: 'templates/java/union_find_optimized.java',
              },
              javascript: {
                filename: 'union_find_optimized.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/data_structures/union_find_optimized.js',
                targetPath: 'templates/javascript/union_find_optimized.js',
              },
              lua: {
                filename: 'union_find_optimized.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/data_structures/union_find_optimized.lua',
                targetPath: 'templates/lua/union_find_optimized.lua',
              },
              python: {
                filename: 'union_find_optimized.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/data_structures/union_find_optimized.py',
                targetPath: 'templates/python/union_find_optimized.py',
              },
              ruby: {
                filename: 'union_find_optimized.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/data_structures/union_find_optimized.rb',
                targetPath: 'templates/ruby/union_find_optimized.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'dynamic-programming',
        name: 'Dynamic Programming',
        sourceTopic: 'dynamic_programming',
        templates: [
          {
            id: 'bottom-up',
            title: 'Bottom Up',
            files: {
              cpp: {
                filename: 'bottom_up.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/dynamic_programming/bottom_up.cpp',
                targetPath: 'templates/cpp/bottom_up.cpp',
              },
              java: {
                filename: 'bottom_up.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/dynamic_programming/bottom_up.java',
                targetPath: 'templates/java/bottom_up.java',
              },
              javascript: {
                filename: 'bottom_up.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/dynamic_programming/bottom_up.js',
                targetPath: 'templates/javascript/bottom_up.js',
              },
              lua: {
                filename: 'bottom_up.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/dynamic_programming/bottom_up.lua',
                targetPath: 'templates/lua/bottom_up.lua',
              },
              python: {
                filename: 'bottom_up.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/dynamic_programming/bottom_up.py',
                targetPath: 'templates/python/bottom_up.py',
              },
              ruby: {
                filename: 'bottom_up.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/dynamic_programming/bottom_up.rb',
                targetPath: 'templates/ruby/bottom_up.rb',
              },
            },
          },
          {
            id: 'kadane',
            title: 'Kadane',
            files: {
              cpp: {
                filename: 'kadane.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/dynamic_programming/kadane.cpp',
                targetPath: 'templates/cpp/kadane.cpp',
              },
              java: {
                filename: 'kadane.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/dynamic_programming/kadane.java',
                targetPath: 'templates/java/kadane.java',
              },
              javascript: {
                filename: 'kadane.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/dynamic_programming/kadane.js',
                targetPath: 'templates/javascript/kadane.js',
              },
              lua: {
                filename: 'kadane.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/dynamic_programming/kadane.lua',
                targetPath: 'templates/lua/kadane.lua',
              },
              python: {
                filename: 'kadane.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/dynamic_programming/kadane.py',
                targetPath: 'templates/python/kadane.py',
              },
              ruby: {
                filename: 'kadane.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/dynamic_programming/kadane.rb',
                targetPath: 'templates/ruby/kadane.rb',
              },
            },
          },
          {
            id: 'top-down',
            title: 'Top Down',
            files: {
              cpp: {
                filename: 'top_down.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/dynamic_programming/top_down.cpp',
                targetPath: 'templates/cpp/top_down.cpp',
              },
              java: {
                filename: 'top_down.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/dynamic_programming/top_down.java',
                targetPath: 'templates/java/top_down.java',
              },
              javascript: {
                filename: 'top_down.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/dynamic_programming/top_down.js',
                targetPath: 'templates/javascript/top_down.js',
              },
              lua: {
                filename: 'top_down.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/dynamic_programming/top_down.lua',
                targetPath: 'templates/lua/top_down.lua',
              },
              python: {
                filename: 'top_down.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/dynamic_programming/top_down.py',
                targetPath: 'templates/python/top_down.py',
              },
              ruby: {
                filename: 'top_down.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/dynamic_programming/top_down.rb',
                targetPath: 'templates/ruby/top_down.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'graph',
        name: 'Graph',
        sourceTopic: 'graph',
        templates: [
          {
            id: 'bellman-ford',
            title: 'Bellman Ford',
            files: {
              cpp: {
                filename: 'bellman_ford.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/bellman_ford.cpp',
                targetPath: 'templates/cpp/bellman_ford.cpp',
              },
              java: {
                filename: 'bellman_ford.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/bellman_ford.java',
                targetPath: 'templates/java/bellman_ford.java',
              },
              javascript: {
                filename: 'bellman_ford.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/bellman_ford.js',
                targetPath: 'templates/javascript/bellman_ford.js',
              },
              lua: {
                filename: 'bellman_ford.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/bellman_ford.lua',
                targetPath: 'templates/lua/bellman_ford.lua',
              },
              python: {
                filename: 'bellman_ford.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/bellman_ford.py',
                targetPath: 'templates/python/bellman_ford.py',
              },
              ruby: {
                filename: 'bellman_ford.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/bellman_ford.rb',
                targetPath: 'templates/ruby/bellman_ford.rb',
              },
            },
          },
          {
            id: 'bfs',
            title: 'Bfs',
            files: {
              cpp: {
                filename: 'bfs.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/bfs.cpp',
                targetPath: 'templates/cpp/bfs.cpp',
              },
              java: {
                filename: 'bfs.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/bfs.java',
                targetPath: 'templates/java/bfs.java',
              },
              javascript: {
                filename: 'bfs.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/bfs.js',
                targetPath: 'templates/javascript/bfs.js',
              },
              lua: {
                filename: 'bfs.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/bfs.lua',
                targetPath: 'templates/lua/bfs.lua',
              },
              python: {
                filename: 'bfs.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/bfs.py',
                targetPath: 'templates/python/bfs.py',
              },
              ruby: {
                filename: 'bfs.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/bfs.rb',
                targetPath: 'templates/ruby/bfs.rb',
              },
            },
          },
          {
            id: 'dfs-iterative',
            title: 'Dfs Iterative',
            files: {
              cpp: {
                filename: 'dfs_iterative.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/dfs_iterative.cpp',
                targetPath: 'templates/cpp/dfs_iterative.cpp',
              },
              java: {
                filename: 'dfs_iterative.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/dfs_iterative.java',
                targetPath: 'templates/java/dfs_iterative.java',
              },
              javascript: {
                filename: 'dfs_iterative.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/dfs_iterative.js',
                targetPath: 'templates/javascript/dfs_iterative.js',
              },
              lua: {
                filename: 'dfs_iterative.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/dfs_iterative.lua',
                targetPath: 'templates/lua/dfs_iterative.lua',
              },
              python: {
                filename: 'dfs_iterative.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/dfs_iterative.py',
                targetPath: 'templates/python/dfs_iterative.py',
              },
              ruby: {
                filename: 'dfs_iterative.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/dfs_iterative.rb',
                targetPath: 'templates/ruby/dfs_iterative.rb',
              },
            },
          },
          {
            id: 'dfs-recursive',
            title: 'Dfs Recursive',
            files: {
              cpp: {
                filename: 'dfs_recursive.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/dfs_recursive.cpp',
                targetPath: 'templates/cpp/dfs_recursive.cpp',
              },
              java: {
                filename: 'dfs_recursive.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/dfs_recursive.java',
                targetPath: 'templates/java/dfs_recursive.java',
              },
              javascript: {
                filename: 'dfs_recursive.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/dfs_recursive.js',
                targetPath: 'templates/javascript/dfs_recursive.js',
              },
              lua: {
                filename: 'dfs_recursive.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/dfs_recursive.lua',
                targetPath: 'templates/lua/dfs_recursive.lua',
              },
              python: {
                filename: 'dfs_recursive.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/dfs_recursive.py',
                targetPath: 'templates/python/dfs_recursive.py',
              },
              ruby: {
                filename: 'dfs_recursive.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/dfs_recursive.rb',
                targetPath: 'templates/ruby/dfs_recursive.rb',
              },
            },
          },
          {
            id: 'dijkstra',
            title: 'Dijkstra',
            files: {
              cpp: {
                filename: 'dijkstra.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/dijkstra.cpp',
                targetPath: 'templates/cpp/dijkstra.cpp',
              },
              java: {
                filename: 'dijkstra.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/dijkstra.java',
                targetPath: 'templates/java/dijkstra.java',
              },
              javascript: {
                filename: 'dijkstra.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/dijkstra.js',
                targetPath: 'templates/javascript/dijkstra.js',
              },
              lua: {
                filename: 'dijkstra.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/dijkstra.lua',
                targetPath: 'templates/lua/dijkstra.lua',
              },
              python: {
                filename: 'dijkstra.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/dijkstra.py',
                targetPath: 'templates/python/dijkstra.py',
              },
              ruby: {
                filename: 'dijkstra.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/dijkstra.rb',
                targetPath: 'templates/ruby/dijkstra.rb',
              },
            },
          },
          {
            id: 'kahn',
            title: 'Kahn',
            files: {
              cpp: {
                filename: 'kahn.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/kahn.cpp',
                targetPath: 'templates/cpp/kahn.cpp',
              },
              java: {
                filename: 'kahn.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/kahn.java',
                targetPath: 'templates/java/kahn.java',
              },
              javascript: {
                filename: 'kahn.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/kahn.js',
                targetPath: 'templates/javascript/kahn.js',
              },
              lua: {
                filename: 'kahn.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/kahn.lua',
                targetPath: 'templates/lua/kahn.lua',
              },
              python: {
                filename: 'kahn.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/kahn.py',
                targetPath: 'templates/python/kahn.py',
              },
              ruby: {
                filename: 'kahn.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/kahn.rb',
                targetPath: 'templates/ruby/kahn.rb',
              },
            },
          },
          {
            id: 'kruskal',
            title: 'Kruskal',
            files: {
              cpp: {
                filename: 'kruskal.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/kruskal.cpp',
                targetPath: 'templates/cpp/kruskal.cpp',
              },
              java: {
                filename: 'kruskal.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/kruskal.java',
                targetPath: 'templates/java/kruskal.java',
              },
              javascript: {
                filename: 'kruskal.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/kruskal.js',
                targetPath: 'templates/javascript/kruskal.js',
              },
              lua: {
                filename: 'kruskal.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/kruskal.lua',
                targetPath: 'templates/lua/kruskal.lua',
              },
              python: {
                filename: 'kruskal.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/kruskal.py',
                targetPath: 'templates/python/kruskal.py',
              },
              ruby: {
                filename: 'kruskal.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/kruskal.rb',
                targetPath: 'templates/ruby/kruskal.rb',
              },
            },
          },
          {
            id: 'prim',
            title: 'Prim',
            files: {
              cpp: {
                filename: 'prim.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/graph/prim.cpp',
                targetPath: 'templates/cpp/prim.cpp',
              },
              java: {
                filename: 'prim.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/graph/prim.java',
                targetPath: 'templates/java/prim.java',
              },
              javascript: {
                filename: 'prim.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/graph/prim.js',
                targetPath: 'templates/javascript/prim.js',
              },
              lua: {
                filename: 'prim.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/graph/prim.lua',
                targetPath: 'templates/lua/prim.lua',
              },
              python: {
                filename: 'prim.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/graph/prim.py',
                targetPath: 'templates/python/prim.py',
              },
              ruby: {
                filename: 'prim.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/graph/prim.rb',
                targetPath: 'templates/ruby/prim.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'hash-table',
        name: 'Hash Table',
        sourceTopic: 'hash_map',
        templates: [
          {
            id: 'find-number-of-subarrays',
            title: 'Find Number Of Subarrays',
            files: {
              cpp: {
                filename: 'find_number_of_subarrays.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/hash_map/find_number_of_subarrays.cpp',
                targetPath: 'templates/cpp/find_number_of_subarrays.cpp',
              },
              java: {
                filename: 'find_number_of_subarrays.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/hash_map/find_number_of_subarrays.java',
                targetPath: 'templates/java/find_number_of_subarrays.java',
              },
              javascript: {
                filename: 'find_number_of_subarrays.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/hash_map/find_number_of_subarrays.js',
                targetPath: 'templates/javascript/find_number_of_subarrays.js',
              },
              lua: {
                filename: 'find_number_of_subarrays.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/hash_map/find_number_of_subarrays.lua',
                targetPath: 'templates/lua/find_number_of_subarrays.lua',
              },
              python: {
                filename: 'find_number_of_subarrays.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/hash_map/find_number_of_subarrays.py',
                targetPath: 'templates/python/find_number_of_subarrays.py',
              },
              ruby: {
                filename: 'find_number_of_subarrays.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/hash_map/find_number_of_subarrays.rb',
                targetPath: 'templates/ruby/find_number_of_subarrays.rb',
              },
            },
          },
          {
            id: 'sliding-window',
            title: 'Sliding Window',
            files: {
              cpp: {
                filename: 'sliding_window.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/hash_map/sliding_window.cpp',
                targetPath: 'templates/cpp/sliding_window.cpp',
              },
              java: {
                filename: 'sliding_window.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/hash_map/sliding_window.java',
                targetPath: 'templates/java/sliding_window.java',
              },
              javascript: {
                filename: 'sliding_window.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/hash_map/sliding_window.js',
                targetPath: 'templates/javascript/sliding_window.js',
              },
              lua: {
                filename: 'sliding_window.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/hash_map/sliding_window.lua',
                targetPath: 'templates/lua/sliding_window.lua',
              },
              python: {
                filename: 'sliding_window.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/hash_map/sliding_window.py',
                targetPath: 'templates/python/sliding_window.py',
              },
              ruby: {
                filename: 'sliding_window.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/hash_map/sliding_window.rb',
                targetPath: 'templates/ruby/sliding_window.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'heap',
        name: 'Heap',
        sourceTopic: 'heap',
        templates: [
          {
            id: 'find-top-k-elements',
            title: 'Find Top K Elements',
            files: {
              cpp: {
                filename: 'find_top_k_elements.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/heap/find_top_k_elements.cpp',
                targetPath: 'templates/cpp/find_top_k_elements.cpp',
              },
              java: {
                filename: 'find_top_k_elements.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/heap/find_top_k_elements.java',
                targetPath: 'templates/java/find_top_k_elements.java',
              },
              javascript: {
                filename: 'find_top_k_elements.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/heap/find_top_k_elements.js',
                targetPath: 'templates/javascript/find_top_k_elements.js',
              },
              lua: {
                filename: 'find_top_k_elements.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/heap/find_top_k_elements.lua',
                targetPath: 'templates/lua/find_top_k_elements.lua',
              },
              python: {
                filename: 'find_top_k_elements.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/heap/find_top_k_elements.py',
                targetPath: 'templates/python/find_top_k_elements.py',
              },
              ruby: {
                filename: 'find_top_k_elements.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/heap/find_top_k_elements.rb',
                targetPath: 'templates/ruby/find_top_k_elements.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'linked-list',
        name: 'Linked List',
        sourceTopic: 'linked_list',
        templates: [
          {
            id: 'fast-and-slow-pointer',
            title: 'Fast And Slow Pointer',
            files: {
              cpp: {
                filename: 'fast_and_slow_pointer.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/linked_list/fast_and_slow_pointer.cpp',
                targetPath: 'templates/cpp/fast_and_slow_pointer.cpp',
              },
              java: {
                filename: 'fast_and_slow_pointer.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/linked_list/fast_and_slow_pointer.java',
                targetPath: 'templates/java/fast_and_slow_pointer.java',
              },
              javascript: {
                filename: 'fast_and_slow_pointer.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/linked_list/fast_and_slow_pointer.js',
                targetPath: 'templates/javascript/fast_and_slow_pointer.js',
              },
              lua: {
                filename: 'fast_and_slow_pointer.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/linked_list/fast_and_slow_pointer.lua',
                targetPath: 'templates/lua/fast_and_slow_pointer.lua',
              },
              python: {
                filename: 'fast_and_slow_pointer.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/linked_list/fast_and_slow_pointer.py',
                targetPath: 'templates/python/fast_and_slow_pointer.py',
              },
              ruby: {
                filename: 'fast_and_slow_pointer.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/linked_list/fast_and_slow_pointer.rb',
                targetPath: 'templates/ruby/fast_and_slow_pointer.rb',
              },
            },
          },
          {
            id: 'reverse-linked-list',
            title: 'Reverse Linked List',
            files: {
              cpp: {
                filename: 'reverse_linked_list.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/linked_list/reverse_linked_list.cpp',
                targetPath: 'templates/cpp/reverse_linked_list.cpp',
              },
              java: {
                filename: 'reverse_linked_list.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/linked_list/reverse_linked_list.java',
                targetPath: 'templates/java/reverse_linked_list.java',
              },
              javascript: {
                filename: 'reverse_linked_list.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/linked_list/reverse_linked_list.js',
                targetPath: 'templates/javascript/reverse_linked_list.js',
              },
              lua: {
                filename: 'reverse_linked_list.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/linked_list/reverse_linked_list.lua',
                targetPath: 'templates/lua/reverse_linked_list.lua',
              },
              python: {
                filename: 'reverse_linked_list.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/linked_list/reverse_linked_list.py',
                targetPath: 'templates/python/reverse_linked_list.py',
              },
              ruby: {
                filename: 'reverse_linked_list.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/linked_list/reverse_linked_list.rb',
                targetPath: 'templates/ruby/reverse_linked_list.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'matrix',
        name: 'Matrix',
        sourceTopic: 'matrix',
        templates: [
          {
            id: 'create-copy',
            title: 'Create Copy',
            files: {
              cpp: {
                filename: 'create_copy.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/matrix/create_copy.cpp',
                targetPath: 'templates/cpp/create_copy.cpp',
              },
              java: {
                filename: 'create_copy.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/matrix/create_copy.java',
                targetPath: 'templates/java/create_copy.java',
              },
              javascript: {
                filename: 'create_copy.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/matrix/create_copy.js',
                targetPath: 'templates/javascript/create_copy.js',
              },
              lua: {
                filename: 'create_copy.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/matrix/create_copy.lua',
                targetPath: 'templates/lua/create_copy.lua',
              },
              python: {
                filename: 'create_copy.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/matrix/create_copy.py',
                targetPath: 'templates/python/create_copy.py',
              },
              ruby: {
                filename: 'create_copy.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/matrix/create_copy.rb',
                targetPath: 'templates/ruby/create_copy.rb',
              },
            },
          },
          {
            id: 'diagonals',
            title: 'Diagonals',
            files: {
              cpp: {
                filename: 'diagonals.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/matrix/diagonals.cpp',
                targetPath: 'templates/cpp/diagonals.cpp',
              },
              java: {
                filename: 'diagonals.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/matrix/diagonals.java',
                targetPath: 'templates/java/diagonals.java',
              },
              javascript: {
                filename: 'diagonals.js',
                sourcePath: 'src/templates/leetcode-cheatsheet/javascript/matrix/diagonals.js',
                targetPath: 'templates/javascript/diagonals.js',
              },
              lua: {
                filename: 'diagonals.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/matrix/diagonals.lua',
                targetPath: 'templates/lua/diagonals.lua',
              },
              python: {
                filename: 'diagonals.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/matrix/diagonals.py',
                targetPath: 'templates/python/diagonals.py',
              },
              ruby: {
                filename: 'diagonals.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/matrix/diagonals.rb',
                targetPath: 'templates/ruby/diagonals.rb',
              },
            },
          },
          {
            id: 'rotate-transpose',
            title: 'Rotate Transpose',
            files: {
              cpp: {
                filename: 'rotate_transpose.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/matrix/rotate_transpose.cpp',
                targetPath: 'templates/cpp/rotate_transpose.cpp',
              },
              java: {
                filename: 'rotate_transpose.java',
                sourcePath: 'src/templates/leetcode-cheatsheet/java/matrix/rotate_transpose.java',
                targetPath: 'templates/java/rotate_transpose.java',
              },
              javascript: {
                filename: 'rotate_transpose.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/matrix/rotate_transpose.js',
                targetPath: 'templates/javascript/rotate_transpose.js',
              },
              lua: {
                filename: 'rotate_transpose.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/matrix/rotate_transpose.lua',
                targetPath: 'templates/lua/rotate_transpose.lua',
              },
              python: {
                filename: 'rotate_transpose.py',
                sourcePath: 'src/templates/leetcode-cheatsheet/python/matrix/rotate_transpose.py',
                targetPath: 'templates/python/rotate_transpose.py',
              },
              ruby: {
                filename: 'rotate_transpose.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/matrix/rotate_transpose.rb',
                targetPath: 'templates/ruby/rotate_transpose.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'sorting',
        name: 'Sorting',
        sourceTopic: 'sorting_algorithms',
        templates: [
          {
            id: 'bogo-sort',
            title: 'Bogo Sort',
            files: {
              cpp: {
                filename: 'bogo_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/bogo_sort.cpp',
                targetPath: 'templates/cpp/bogo_sort.cpp',
              },
              java: {
                filename: 'bogo_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/bogo_sort.java',
                targetPath: 'templates/java/bogo_sort.java',
              },
              javascript: {
                filename: 'bogo_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/bogo_sort.js',
                targetPath: 'templates/javascript/bogo_sort.js',
              },
              lua: {
                filename: 'bogo_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/bogo_sort.lua',
                targetPath: 'templates/lua/bogo_sort.lua',
              },
              python: {
                filename: 'bogo_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/bogo_sort.py',
                targetPath: 'templates/python/bogo_sort.py',
              },
              ruby: {
                filename: 'bogo_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/bogo_sort.rb',
                targetPath: 'templates/ruby/bogo_sort.rb',
              },
            },
          },
          {
            id: 'bubble-sort',
            title: 'Bubble Sort',
            files: {
              cpp: {
                filename: 'bubble_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/bubble_sort.cpp',
                targetPath: 'templates/cpp/bubble_sort.cpp',
              },
              java: {
                filename: 'bubble_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/bubble_sort.java',
                targetPath: 'templates/java/bubble_sort.java',
              },
              javascript: {
                filename: 'bubble_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/bubble_sort.js',
                targetPath: 'templates/javascript/bubble_sort.js',
              },
              lua: {
                filename: 'bubble_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/bubble_sort.lua',
                targetPath: 'templates/lua/bubble_sort.lua',
              },
              python: {
                filename: 'bubble_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/bubble_sort.py',
                targetPath: 'templates/python/bubble_sort.py',
              },
              ruby: {
                filename: 'bubble_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/bubble_sort.rb',
                targetPath: 'templates/ruby/bubble_sort.rb',
              },
            },
          },
          {
            id: 'bucket-sort',
            title: 'Bucket Sort',
            files: {
              cpp: {
                filename: 'bucket_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/bucket_sort.cpp',
                targetPath: 'templates/cpp/bucket_sort.cpp',
              },
              java: {
                filename: 'bucket_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/bucket_sort.java',
                targetPath: 'templates/java/bucket_sort.java',
              },
              javascript: {
                filename: 'bucket_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/bucket_sort.js',
                targetPath: 'templates/javascript/bucket_sort.js',
              },
              lua: {
                filename: 'bucket_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/bucket_sort.lua',
                targetPath: 'templates/lua/bucket_sort.lua',
              },
              python: {
                filename: 'bucket_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/bucket_sort.py',
                targetPath: 'templates/python/bucket_sort.py',
              },
              ruby: {
                filename: 'bucket_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/bucket_sort.rb',
                targetPath: 'templates/ruby/bucket_sort.rb',
              },
            },
          },
          {
            id: 'counting-sort',
            title: 'Counting Sort',
            files: {
              cpp: {
                filename: 'counting_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/counting_sort.cpp',
                targetPath: 'templates/cpp/counting_sort.cpp',
              },
              java: {
                filename: 'counting_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/counting_sort.java',
                targetPath: 'templates/java/counting_sort.java',
              },
              javascript: {
                filename: 'counting_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/counting_sort.js',
                targetPath: 'templates/javascript/counting_sort.js',
              },
              lua: {
                filename: 'counting_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/counting_sort.lua',
                targetPath: 'templates/lua/counting_sort.lua',
              },
              python: {
                filename: 'counting_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/counting_sort.py',
                targetPath: 'templates/python/counting_sort.py',
              },
              ruby: {
                filename: 'counting_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/counting_sort.rb',
                targetPath: 'templates/ruby/counting_sort.rb',
              },
            },
          },
          {
            id: 'cube-sort',
            title: 'Cube Sort',
            files: {
              cpp: {
                filename: 'cube_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/cube_sort.cpp',
                targetPath: 'templates/cpp/cube_sort.cpp',
              },
              java: {
                filename: 'cube_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/cube_sort.java',
                targetPath: 'templates/java/cube_sort.java',
              },
              javascript: {
                filename: 'cube_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/cube_sort.js',
                targetPath: 'templates/javascript/cube_sort.js',
              },
              lua: {
                filename: 'cube_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/cube_sort.lua',
                targetPath: 'templates/lua/cube_sort.lua',
              },
              python: {
                filename: 'cube_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/cube_sort.py',
                targetPath: 'templates/python/cube_sort.py',
              },
              ruby: {
                filename: 'cube_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/cube_sort.rb',
                targetPath: 'templates/ruby/cube_sort.rb',
              },
            },
          },
          {
            id: 'heap-sort',
            title: 'Heap Sort',
            files: {
              cpp: {
                filename: 'heap_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/heap_sort.cpp',
                targetPath: 'templates/cpp/heap_sort.cpp',
              },
              java: {
                filename: 'heap_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/heap_sort.java',
                targetPath: 'templates/java/heap_sort.java',
              },
              javascript: {
                filename: 'heap_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/heap_sort.js',
                targetPath: 'templates/javascript/heap_sort.js',
              },
              lua: {
                filename: 'heap_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/heap_sort.lua',
                targetPath: 'templates/lua/heap_sort.lua',
              },
              python: {
                filename: 'heap_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/heap_sort.py',
                targetPath: 'templates/python/heap_sort.py',
              },
              ruby: {
                filename: 'heap_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/heap_sort.rb',
                targetPath: 'templates/ruby/heap_sort.rb',
              },
            },
          },
          {
            id: 'insertion-sort',
            title: 'Insertion Sort',
            files: {
              cpp: {
                filename: 'insertion_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/insertion_sort.cpp',
                targetPath: 'templates/cpp/insertion_sort.cpp',
              },
              java: {
                filename: 'insertion_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/insertion_sort.java',
                targetPath: 'templates/java/insertion_sort.java',
              },
              javascript: {
                filename: 'insertion_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/insertion_sort.js',
                targetPath: 'templates/javascript/insertion_sort.js',
              },
              lua: {
                filename: 'insertion_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/insertion_sort.lua',
                targetPath: 'templates/lua/insertion_sort.lua',
              },
              python: {
                filename: 'insertion_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/insertion_sort.py',
                targetPath: 'templates/python/insertion_sort.py',
              },
              ruby: {
                filename: 'insertion_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/insertion_sort.rb',
                targetPath: 'templates/ruby/insertion_sort.rb',
              },
            },
          },
          {
            id: 'merge-sort',
            title: 'Merge Sort',
            files: {
              cpp: {
                filename: 'merge_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/merge_sort.cpp',
                targetPath: 'templates/cpp/merge_sort.cpp',
              },
              java: {
                filename: 'merge_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/merge_sort.java',
                targetPath: 'templates/java/merge_sort.java',
              },
              javascript: {
                filename: 'merge_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/merge_sort.js',
                targetPath: 'templates/javascript/merge_sort.js',
              },
              lua: {
                filename: 'merge_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/merge_sort.lua',
                targetPath: 'templates/lua/merge_sort.lua',
              },
              python: {
                filename: 'merge_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/merge_sort.py',
                targetPath: 'templates/python/merge_sort.py',
              },
              ruby: {
                filename: 'merge_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/merge_sort.rb',
                targetPath: 'templates/ruby/merge_sort.rb',
              },
            },
          },
          {
            id: 'pancake-sort',
            title: 'Pancake Sort',
            files: {
              cpp: {
                filename: 'pancake_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/pancake_sort.cpp',
                targetPath: 'templates/cpp/pancake_sort.cpp',
              },
              java: {
                filename: 'pancake_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/pancake_sort.java',
                targetPath: 'templates/java/pancake_sort.java',
              },
              javascript: {
                filename: 'pancake_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/pancake_sort.js',
                targetPath: 'templates/javascript/pancake_sort.js',
              },
              lua: {
                filename: 'pancake_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/pancake_sort.lua',
                targetPath: 'templates/lua/pancake_sort.lua',
              },
              python: {
                filename: 'pancake_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/pancake_sort.py',
                targetPath: 'templates/python/pancake_sort.py',
              },
              ruby: {
                filename: 'pancake_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/pancake_sort.rb',
                targetPath: 'templates/ruby/pancake_sort.rb',
              },
            },
          },
          {
            id: 'quick-sort',
            title: 'Quick Sort',
            files: {
              cpp: {
                filename: 'quick_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/quick_sort.cpp',
                targetPath: 'templates/cpp/quick_sort.cpp',
              },
              java: {
                filename: 'quick_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/quick_sort.java',
                targetPath: 'templates/java/quick_sort.java',
              },
              javascript: {
                filename: 'quick_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/quick_sort.js',
                targetPath: 'templates/javascript/quick_sort.js',
              },
              lua: {
                filename: 'quick_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/quick_sort.lua',
                targetPath: 'templates/lua/quick_sort.lua',
              },
              python: {
                filename: 'quick_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/quick_sort.py',
                targetPath: 'templates/python/quick_sort.py',
              },
              ruby: {
                filename: 'quick_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/quick_sort.rb',
                targetPath: 'templates/ruby/quick_sort.rb',
              },
            },
          },
          {
            id: 'radix-sort',
            title: 'Radix Sort',
            files: {
              cpp: {
                filename: 'radix_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/radix_sort.cpp',
                targetPath: 'templates/cpp/radix_sort.cpp',
              },
              java: {
                filename: 'radix_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/radix_sort.java',
                targetPath: 'templates/java/radix_sort.java',
              },
              javascript: {
                filename: 'radix_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/radix_sort.js',
                targetPath: 'templates/javascript/radix_sort.js',
              },
              lua: {
                filename: 'radix_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/radix_sort.lua',
                targetPath: 'templates/lua/radix_sort.lua',
              },
              python: {
                filename: 'radix_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/radix_sort.py',
                targetPath: 'templates/python/radix_sort.py',
              },
              ruby: {
                filename: 'radix_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/radix_sort.rb',
                targetPath: 'templates/ruby/radix_sort.rb',
              },
            },
          },
          {
            id: 'selection-sort',
            title: 'Selection Sort',
            files: {
              cpp: {
                filename: 'selection_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/selection_sort.cpp',
                targetPath: 'templates/cpp/selection_sort.cpp',
              },
              java: {
                filename: 'selection_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/selection_sort.java',
                targetPath: 'templates/java/selection_sort.java',
              },
              javascript: {
                filename: 'selection_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/selection_sort.js',
                targetPath: 'templates/javascript/selection_sort.js',
              },
              lua: {
                filename: 'selection_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/selection_sort.lua',
                targetPath: 'templates/lua/selection_sort.lua',
              },
              python: {
                filename: 'selection_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/selection_sort.py',
                targetPath: 'templates/python/selection_sort.py',
              },
              ruby: {
                filename: 'selection_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/selection_sort.rb',
                targetPath: 'templates/ruby/selection_sort.rb',
              },
            },
          },
          {
            id: 'shell-sort',
            title: 'Shell Sort',
            files: {
              cpp: {
                filename: 'shell_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/shell_sort.cpp',
                targetPath: 'templates/cpp/shell_sort.cpp',
              },
              java: {
                filename: 'shell_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/shell_sort.java',
                targetPath: 'templates/java/shell_sort.java',
              },
              javascript: {
                filename: 'shell_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/shell_sort.js',
                targetPath: 'templates/javascript/shell_sort.js',
              },
              lua: {
                filename: 'shell_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/shell_sort.lua',
                targetPath: 'templates/lua/shell_sort.lua',
              },
              python: {
                filename: 'shell_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/shell_sort.py',
                targetPath: 'templates/python/shell_sort.py',
              },
              ruby: {
                filename: 'shell_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/shell_sort.rb',
                targetPath: 'templates/ruby/shell_sort.rb',
              },
            },
          },
          {
            id: 'sleep-sort',
            title: 'Sleep Sort',
            files: {
              cpp: {
                filename: 'sleep_sort.cpp',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/sleep_sort.cpp',
                targetPath: 'templates/cpp/sleep_sort.cpp',
              },
              java: {
                filename: 'sleep_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/sleep_sort.java',
                targetPath: 'templates/java/sleep_sort.java',
              },
              javascript: {
                filename: 'sleep_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/sleep_sort.js',
                targetPath: 'templates/javascript/sleep_sort.js',
              },
              lua: {
                filename: 'sleep_sort.lua',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/sleep_sort.lua',
                targetPath: 'templates/lua/sleep_sort.lua',
              },
              python: {
                filename: 'sleep_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/sleep_sort.py',
                targetPath: 'templates/python/sleep_sort.py',
              },
              ruby: {
                filename: 'sleep_sort.rb',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/sleep_sort.rb',
                targetPath: 'templates/ruby/sleep_sort.rb',
              },
            },
          },
          {
            id: 'tim-sort',
            title: 'Tim Sort',
            files: {
              cpp: {
                filename: 'tim_sort.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/sorting_algorithms/tim_sort.cpp',
                targetPath: 'templates/cpp/tim_sort.cpp',
              },
              java: {
                filename: 'tim_sort.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/sorting_algorithms/tim_sort.java',
                targetPath: 'templates/java/tim_sort.java',
              },
              javascript: {
                filename: 'tim_sort.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/sorting_algorithms/tim_sort.js',
                targetPath: 'templates/javascript/tim_sort.js',
              },
              lua: {
                filename: 'tim_sort.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/sorting_algorithms/tim_sort.lua',
                targetPath: 'templates/lua/tim_sort.lua',
              },
              python: {
                filename: 'tim_sort.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/sorting_algorithms/tim_sort.py',
                targetPath: 'templates/python/tim_sort.py',
              },
              ruby: {
                filename: 'tim_sort.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/sorting_algorithms/tim_sort.rb',
                targetPath: 'templates/ruby/tim_sort.rb',
              },
            },
          },
        ],
      },
      {
        slug: 'stack',
        name: 'Stack',
        sourceTopic: 'stack',
        templates: [
          {
            id: 'monotonic-decreasing',
            title: 'Monotonic Decreasing',
            files: {
              cpp: {
                filename: 'monotonic_decreasing.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/stack/monotonic_decreasing.cpp',
                targetPath: 'templates/cpp/monotonic_decreasing.cpp',
              },
              java: {
                filename: 'monotonic_decreasing.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/stack/monotonic_decreasing.java',
                targetPath: 'templates/java/monotonic_decreasing.java',
              },
              javascript: {
                filename: 'monotonic_decreasing.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/stack/monotonic_decreasing.js',
                targetPath: 'templates/javascript/monotonic_decreasing.js',
              },
              lua: {
                filename: 'monotonic_decreasing.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/stack/monotonic_decreasing.lua',
                targetPath: 'templates/lua/monotonic_decreasing.lua',
              },
              python: {
                filename: 'monotonic_decreasing.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/stack/monotonic_decreasing.py',
                targetPath: 'templates/python/monotonic_decreasing.py',
              },
              ruby: {
                filename: 'monotonic_decreasing.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/stack/monotonic_decreasing.rb',
                targetPath: 'templates/ruby/monotonic_decreasing.rb',
              },
            },
          },
          {
            id: 'monotonic-increasing',
            title: 'Monotonic Increasing',
            files: {
              cpp: {
                filename: 'monotonic_increasing.cpp',
                sourcePath: 'src/templates/leetcode-cheatsheet/cpp/stack/monotonic_increasing.cpp',
                targetPath: 'templates/cpp/monotonic_increasing.cpp',
              },
              java: {
                filename: 'monotonic_increasing.java',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/java/stack/monotonic_increasing.java',
                targetPath: 'templates/java/monotonic_increasing.java',
              },
              javascript: {
                filename: 'monotonic_increasing.js',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/javascript/stack/monotonic_increasing.js',
                targetPath: 'templates/javascript/monotonic_increasing.js',
              },
              lua: {
                filename: 'monotonic_increasing.lua',
                sourcePath: 'src/templates/leetcode-cheatsheet/lua/stack/monotonic_increasing.lua',
                targetPath: 'templates/lua/monotonic_increasing.lua',
              },
              python: {
                filename: 'monotonic_increasing.py',
                sourcePath:
                  'src/templates/leetcode-cheatsheet/python/stack/monotonic_increasing.py',
                targetPath: 'templates/python/monotonic_increasing.py',
              },
              ruby: {
                filename: 'monotonic_increasing.rb',
                sourcePath: 'src/templates/leetcode-cheatsheet/ruby/stack/monotonic_increasing.rb',
                targetPath: 'templates/ruby/monotonic_increasing.rb',
              },
            },
          },
        ],
      },
    ],
  };
})(globalThis);
