---@param n integer
---@param edges table<integer, { [1]: integer, [2]: integer, [3]: integer }>
---@param source integer
---@return table<integer, number>
function bellman_ford(n, edges, source)
    local distances = {}
    for i = 1, n do
        distances[i] = math.huge
    end
    distances[source] = 0

    for i = 1, n - 1 do
        for _, edge in ipairs(edges) do
            local u, v, w = edge[1], edge[2], edge[3]
            if distances[u] ~= math.huge and distances[u] + w < distances[v] then
                distances[v] = distances[u] + w
            end
        end
    end

    for _, edge in ipairs(edges) do
        local u, v, w = edge[1], edge[2], edge[3]
        if distances[u] ~= math.huge and distances[u] + w < distances[v] then
            return {}
        end
    end

    return distances
end
