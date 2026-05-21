---@param graph table<integer, { [1]: integer, [2]: integer }[]>
---@param source integer
---@return table<integer, number>
function dijkstras(graph, source)
    local n = #graph
    local distances = {}
    for i = 1, n do distances[i] = math.huge end
    distances[source] = 0
    local heap = MinHeap()
    heap:push({0, source})

    while #heap > 0 do
        local top = heap:pop()
        local curr_dist, node = top[1], top[2]

        if curr_dist <= distances[node] then
            for _, edge in ipairs(graph[node]) do
                local neighbor, weight = edge[1], edge[2]
                local dist = curr_dist + weight

                if dist < distances[neighbor] then
                    distances[neighbor] = dist
                    heap:push({dist, neighbor})
                end
            end
        end
    end

    return distances
end
