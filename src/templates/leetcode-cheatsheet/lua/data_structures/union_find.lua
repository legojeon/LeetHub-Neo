local class = require('middleclass')

---@class UnionFind
---@field root integer[]
local UnionFind = class('UnionFind')

---@param n integer
function UnionFind:initialize(n)
    self.root = {}
    for i = 1, n do
        self.root[i] = i
    end
end

---@param a integer
---@return integer
function UnionFind:find(a)
    if a == self.root[a] then
        return a
    end
    self.root[a] = self:find(self.root[a])
    return self.root[a]
end

---@param a integer
---@param b integer
function UnionFind:union(a, b)
    local root_a = self:find(a)
    local root_b = self:find(b)
    if root_a ~= root_b then
        self.root[root_a] = root_b
    end
end

---@param a integer
---@param b integer
---@return boolean
function UnionFind:connected(a, b)
    return self:find(a) == self:find(b)
end

---@return string
function UnionFind:__tostring()
    local components = {}
    for i = 1, #self.root do
        local root = self:find(i)
        if not components[root] then
            components[root] = {}
        end
        table.insert(components[root], '(' .. i .. ')')
    end

    local lines = {}
    for _, component in pairs(components) do
        table.insert(lines, table.concat(component, ' - '))
    end
    return table.concat(lines, '\n')
end
