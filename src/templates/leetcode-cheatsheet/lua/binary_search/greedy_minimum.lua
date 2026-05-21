function fn(arr)
    function check(x)
        return BOOLEAN
    end

    local left = MINIMUM_POSSIBLE_ANSWER
    local right = MAXIMUM_POSSIBLE_ANSWER

    while left <= right do
        local mid = math.floor((left + right) / 2)

        if check(mid) then
            right = mid - 1
        else
            left = mid + 1

        end
    end

    return left
end
