function fn(arr)
    local stack = {}
    local ans = 0

    for _, num in ipairs(arr) do
        while #stack > 0 and stack[#stack] > num do
            -- TODO: logic
            table.remove(stack)
        end
        table.insert(stack, num)
    end

    return ans
end
