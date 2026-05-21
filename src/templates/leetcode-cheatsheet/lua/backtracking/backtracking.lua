function backtrack(curr, OTHER_ARGUMENTS...)
    if (BASE_CASE) then
        -- TODO: modify answer
        return
    end

    local ans = 0

    for (ITERATE_OVER_INPUT) do
        -- TODO: modify current state
        ans = ans + backtrack(curr, OTHER_ARGUMENTS...)
        -- TODO: undo modification of current state
    end

    return ans
end
