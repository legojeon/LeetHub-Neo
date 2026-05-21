function fn(root)
    local que = Deque([root])
    local ans = 0

    while que do
        local current_length = #que
        -- TODO: logic for current level
        for _ = 0, current_length - 1 do
            local node = que.popleft()
            -- TODO: logic
            if node.left then
                table.insert(que, node.left)
            end
            if node.right then
                table.insert(que, node.right)

            end
        end
    end

    return ans
end
