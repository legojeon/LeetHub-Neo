function fn(arr, target)
    local left = 1
    local right = #arr + 1

    while left < right do
        local mid = math.floor((left + right) / 2)

        if arr[mid] >= target then
            right = mid
        else
            left = mid + 1

        end
    end

    return left
end
