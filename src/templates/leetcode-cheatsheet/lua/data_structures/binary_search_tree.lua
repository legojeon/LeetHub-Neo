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

---@class BinarySearchTree
---@field root TreeNode|nil
local BinarySearchTree = class('BinarySearchTree')

function BinarySearchTree:initialize()
    self.root = nil
end

---@param data any
function BinarySearchTree:insert(data)
    if not self.root then
        self.root = TreeNode:new(data)
    else
        self:_insert_node(self.root, data)
    end
end

---@param node TreeNode
---@param data any
function BinarySearchTree:_insert_node(node, data)
    if data < node.data then
        if not node.left then
            node.left = TreeNode:new(data)
        else
            self:_insert_node(node.left, data)
        end
    else
        if not node.right then
            node.right = TreeNode:new(data)
        else
            self:_insert_node(node.right, data)
        end
    end
end

---@return string
function BinarySearchTree:__tostring()
    if not self.root then
        return 'Empty tree'
    end
    return self:_print_tree(self.root, '', true)
end

---@param node TreeNode|nil
---@param prefix string
---@param is_left boolean
---@return string
function BinarySearchTree:_print_tree(node, prefix, is_left)
    if not node then
        return ''
    end

    local result = ''

    result = result .. self:_print_tree(node.right, prefix .. (is_left and '│   ' or '    '), false)
    result = result .. prefix .. (is_left and '└── ' or '┌── ') .. tostring(node.data) .. '\n'
    result = result .. self:_print_tree(node.left, prefix .. (is_left and '    ' or '│   '), true)

    return result
end
