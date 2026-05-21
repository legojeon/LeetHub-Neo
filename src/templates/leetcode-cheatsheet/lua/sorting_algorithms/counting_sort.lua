function counting_sort(arr)
    local max_num, min_num = -math.huge, math.huge
    for _, v in ipairs(arr) do
        if v > max_num then max_num = v end
        if v < min_num then min_num = v end
    end

    local count_range = max_num - min_num + 1
    local count = {}
    for i = 1, count_range do count[i] = 0 end
    local output = {}

    for _, num in ipairs(arr) do
        local idx = num - min_num + 1
        count[idx] = count[idx] + 1
    end

    for i = 2, count_range do
        count[i] = count[i] + count[i - 1]
    end

    for i = #arr, 1, -1 do
        local num = arr[i]
        local idx = num - min_num + 1
        output[count[idx]] = num
        count[idx] = count[idx] - 1
    end

    return output
end
