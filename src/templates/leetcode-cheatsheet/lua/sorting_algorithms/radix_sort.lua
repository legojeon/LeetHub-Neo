local function radix_counting_sort(arr, exp)
    local n = #arr
    local output = {}
    local count = {}
    for i = 0, 9 do count[i] = 0 end

    for i = 1, n do
        local idx = math.floor(arr[i] / exp)
        local digit = idx % 10
        count[digit] = count[digit] + 1
    end

    for i = 1, 9 do
        count[i] = count[i] + count[i - 1]
    end

    for i = n, 1, -1 do
        local idx = math.floor(arr[i] / exp)
        local digit = idx % 10
        output[count[digit]] = arr[i]
        count[digit] = count[digit] - 1
    end

    for i = 1, n do
        arr[i] = output[i]
    end
end

function radix_sort(arr)
    local max_val = 0
    for i = 1, #arr do
        if arr[i] > max_val then max_val = arr[i] end
    end

    local exp = 1
    while math.floor(max_val / exp) > 0 do
        radix_counting_sort(arr, exp)
        exp = exp * 10
    end
end
