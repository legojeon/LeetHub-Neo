function fn(arr, k)
    local counts = {}
    counts[0] = 1
    local ans = 0
    local curr = 0

    for _, num in ipairs(arr) do
        -- TODO: logic to change curr
        ans = ans + (counts[curr - k] or 0)
        counts[curr] = (counts[curr] or 0) + 1
    end

    return ans
end
