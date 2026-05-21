local class = require('middleclass')

---@class TrieNode
---@field children table<string, TrieNode>
---@field is_word boolean
local TrieNode = class('TrieNode')

function TrieNode:initialize()
    self.children = {}
    self.is_word = false
end

---@class Trie
---@field root TrieNode
local Trie = class('Trie')

function Trie:initialize()
    self.root = TrieNode:new()
end

---@param words string[]
function Trie:build(words)
    for _, word in ipairs(words) do
        self:insert(word)
    end
end

---@param word string
function Trie:insert(word)
    local node = self.root
    for i = 1, #word do
        local char = word:sub(i, i)
        if not node.children[char] then
            node.children[char] = TrieNode:new()
        end
        node = node.children[char]
    end
    node.is_word = true
end

---@param word string
---@return boolean
function Trie:search(word)
    local node = self.root
    for i = 1, #word do
        local char = word:sub(i, i)
        if not node.children[char] then
            return false
        end
        node = node.children[char]
    end
    return node.is_word
end

---@param prefix string
---@return boolean
function Trie:starts_with(prefix)
    local node = self.root
    for i = 1, #prefix do
        local char = prefix:sub(i, i)
        if not node.children[char] then
            return false
        end
        node = node.children[char]
    end
    return true
end

---@param node TrieNode
---@param prefix string
---@return string[]
function Trie:collect_words(node, prefix)
    local words = {}
    if node.is_word then
        table.insert(words, prefix)
    end
    for char, child_node in pairs(node.children) do
        local sub_words = self:collect_words(child_node, prefix .. char)
        for _, w in ipairs(sub_words) do
            table.insert(words, w)
        end
    end
    return words
end

---@return string
function Trie:__tostring()
    return 'Trie:\n' .. self:_print_trie(self.root, 0, '')
end

---@param node TrieNode
---@param level integer
---@param prefix string
---@return string
function Trie:_print_trie(node, level, prefix)
    if not node then return '' end
    local output = ''
    for char, child_node in pairs(node.children) do
        local suffix = child_node.is_word and ' (*)' or ''
        output = output .. string.rep('  ', level) .. '└─ ' .. char .. suffix .. '\n'
        output = output .. self:_print_trie(child_node, level + 1, '')
    end
    return output
end
