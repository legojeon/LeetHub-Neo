function dfs(root)
    if not root then
        return
    end

    local ans = 0

    -- TODO: logic
    dfs(root.left)
    dfs(root.right)

    return ans
end
