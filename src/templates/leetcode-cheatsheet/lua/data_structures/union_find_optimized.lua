local class = require('middleclass')

---@class UnionFind
---@field root integer[]
---@field rank integer[]
local UnionFind = class('UnionFind')

---@param n integer
function UnionFind:initialize(n)
    self.root = {}
    self.rank = {}
    for i = 1, n do
        self.root[i] = i
        self.rank[i] = 1
    end
end

---@param a integer
---@return integer
function UnionFind:find(a)
    if a == self.root[a] then
        return a
    end
    -- Path compression
    self.root[a] = self.find(self.root[a])
    return self.root[a]
end

---@param a integer
---@param b integer
function UnionFind:union(a, b)
    local root_a = self:find(a)
    local root_b = self:find(b)

    if root_a ~= root_b then
        if self.rank[root_a] < self.rank[root_b] then
            self.root[root_a] = root_b
        elseif self.rank[root_a] > self.rank[root_b] then
            self.root[root_b] = root_a
        else
            self.root[root_b] = root_a
            self.rank[root_a] = self.rank[root_a] + 1
        end
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
        local r = self:find(i)
        if not components[r] then
            components[r] = {}
        end
        table.insert(components[r], '(' .. i .. ')')
    end

    local lines = {}
    for _, nodes in pairs(components) do
        table.insert(lines, table.concat(nodes, ' - '))
    end
    return table.concat(lines, '\n')
end
