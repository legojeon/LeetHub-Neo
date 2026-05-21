local class = require('middleclass')

---@class TreeNode
---@field data any
---@field left TreeNode|nil
---@field right TreeNode|nil
local TreeNode = class('TreeNode')

function TreeNode:initialize(data)
    self.data = data
    self.left = nil
    self.right = nil
end

---@class BinaryTree
---@field root TreeNode|nil
local BinaryTree = class('BinaryTree')

function BinaryTree:initialize()
    self.root = nil
end

---@param data any
function BinaryTree:insert(data)
    if not self.root then
        self.root = TreeNode:new(data)
    else
        self:_insert_node(self.root, data)
    end
end

---@param node TreeNode|nil
---@param data any
---@return TreeNode
function BinaryTree:_insert_node(node, data)
    if not node then
        return TreeNode:new(data)
    end

    if not node.left then
        node.left = TreeNode:new(data)
    elseif not node.right then
        node.right = TreeNode:new(data)
    else
        node.left = self:_insert_node(node.left, data)
    end

    return node
end

---@return string
function BinaryTree:__tostring()
    if not self.root then
        return 'Empty tree'
    end
    return self:_print_tree(self.root, '', true)
end

---@param node TreeNode|nil
---@param prefix string
---@param is_left boolean
---@return string
function BinaryTree:_print_tree(node, prefix, is_left)
    if not node then
        return ''
    end

    local result = ''

    result = result .. self:_print_tree(node.right, prefix .. (is_left and '│   ' or '    '), false)
    result = result .. prefix .. (is_left and '└── ' or '┌── ') .. tostring(node.data) .. '\n'
    result = result .. self:_print_tree(node.left, prefix .. (is_left and '    ' or '│   '), true)

    return result
end
