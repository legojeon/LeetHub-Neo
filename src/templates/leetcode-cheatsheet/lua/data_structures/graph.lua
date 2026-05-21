local class = require('middleclass')

---@class Graph
---@field graph table<string, string[]>
local Graph = class('Graph')

function Graph:initialize()
    self.graph = {}
end

---@param vertex string
function Graph:add_vertex(vertex)
    if not self.graph[vertex] then
        self.graph[vertex] = {}
    end
end

---@param a string
---@param b string
function Graph:add_edge(a, b)
    self:add_vertex(a)
    self:add_vertex(b)
    table.insert(self.graph[a], b)
    table.insert(self.graph[b], a)
end

---@param vertex string
---@return string[]
function Graph:get_neighbors(vertex)
    return self.graph[vertex] or {}
end

---@return string
function Graph:__tostring()
    local output = ''
    for vertex, neighbors in pairs(self.graph) do
        output = output .. vertex .. ' - ' .. table.concat(neighbors, ' - ') .. '\n'
    end
    return output
end
