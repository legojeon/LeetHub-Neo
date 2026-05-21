---@param graph table<integer, integer[]>
---@return integer[]
function kahn_topological_sort(graph)
    local result = {}
    local indegree = {}
    local node_count = 0

    for u, _ in pairs(graph) do
        node_count = node_count + 1
        indegree[u] = indegree[u] or 0
        for _, v in ipairs(graph[u]) do
            indegree[v] = (indegree[v] or 0) + 1
        end
    end

    local que = Deque.new()
    for node, count in pairs(indegree) do
        if count == 0 then que:push(node) end
    end

    while #que > 0 do
        local node = que:popleft()
        table.insert(result, node)

        for _, neighbor in ipairs(graph[node]) do
            indegree[neighbor] = indegree[neighbor] - 1
            if indegree[neighbor] == 0 then
                que:push(neighbor)
            end
        end
    end

    return #result == node_count and result or {}
end
