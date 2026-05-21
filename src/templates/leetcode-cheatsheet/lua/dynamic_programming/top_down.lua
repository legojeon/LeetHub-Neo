function fn(arr)
    local cache = {}

    local function dp(STATE)
        if cache[STATE] then
            return cache[STATE]
        end

        if BASE_CASE then
            return 0
        end

        cache[STATE] = RECURRENCE_RELATION(STATE)
        return cache[STATE]
    end

    return dp(STATE_FOR_WHOLE_INPUT)
end
