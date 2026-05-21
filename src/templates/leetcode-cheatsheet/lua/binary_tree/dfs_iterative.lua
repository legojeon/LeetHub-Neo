function dfs(root)
    local stack = [root]
    local ans = 0

    while stack do
        local node = table.remove(stack)
        -- TODO: logic
        if node.left then
            table.insert(stack, node.left)
        end
        if node.right then
            table.insert(stack, node.right)

        end
    end

    return ans
end
