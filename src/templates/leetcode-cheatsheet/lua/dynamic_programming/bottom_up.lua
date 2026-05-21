function fn(arr)
    if BASE_CASE then
        return 0
    end

    local dp = [BASE_CASE] * (STATE_FOR_WHOLE_INPUT + 1)

    for STATE = SMALLEST_SUBPROBLEM, STATE_FOR_WHOLE_INPUT + 1 - 1 do
        if BASE_CASE then
            dp[STATE] = BASE_CASE
        else
            dp[STATE] = RECURRENCE_RELATION(STATE)
        end
    end

    return dp[STATE_FOR_WHOLE_INPUT]
end
