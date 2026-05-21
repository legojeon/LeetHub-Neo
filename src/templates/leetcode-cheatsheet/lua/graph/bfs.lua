---@param graph table<any, table>
---@return integer
function fn(graph)
    local que = Deque({START_NODE})
    local seen = {[START_NODE] = true}
    local ans = 0

    while #que > 0 do
        local node = que:popleft()
        -- TODO: logic
        for _, neighbor in ipairs(graph[node]) do
            if not seen[neighbor] then
                seen[neighbor] = true
                que:push(neighbor)
            end
        end
    end

    return ans
end
