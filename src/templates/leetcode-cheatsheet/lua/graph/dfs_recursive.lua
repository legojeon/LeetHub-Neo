---@param graph table<any, table>
---@return integer
function fn(graph)
    local seen = {}
    seen[START_NODE] = true

    function dfs(node)
        local ans = 0
        -- TODO: logic
        for _, neighbor in ipairs(graph[node]) do
            if not seen[neighbor] then
                seen[neighbor] = true
                ans = ans + dfs(neighbor)
            end
        end

        return ans
    end

    return dfs(START_NODE)
end
