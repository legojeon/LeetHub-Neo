---@param graph table<any, table>
---@return integer
function fn(graph)
    local stack = {START_NODE}
    local seen = {[START_NODE] = true}
    local ans = 0

    while #stack > 0 do
        local node = table.remove(stack)
        -- TODO: logic
        for _, neighbor in ipairs(graph[node]) do
            if not seen[neighbor] then
                seen[neighbor] = true
                table.insert(stack, neighbor)
            end
        end
    end

    return ans
end
