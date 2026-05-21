local function insertion_sort_range(arr, left, right)
    for i = left + 1, right do
        local key = arr[i]
        local j = i
        while j > left and key < arr[j - 1] do
            arr[j] = arr[j - 1]
            j = j - 1
        end
        arr[j] = key
    end
end

local function merge(left, right)
    local output = {}
    local i, j = 1, 1
    while i <= #left and j <= #right do
        if left[i] <= right[j] then
            table.insert(output, left[i])
            i = i + 1
        else
            table.insert(output, right[j])
            j = j + 1
        end
    end
    for k = i, #left do table.insert(output, left[k]) end
    for k = j, #right do table.insert(output, right[k]) end
    return output
end

function tim_sort(arr)
    local n = #arr
    local min_run = 32

    for start = 1, n, min_run do
        insertion_sort_range(arr, start, math.min(start + min_run - 1, n))
    end

    local size = min_run
    while size < n do
        for left = 1, n, 2 * size do
            local mid = math.min(n, left + size - 1)
            local right = math.min(n, left + 2 * size - 1)

            local left_part = {}
            for i = left, mid do table.insert(left_part, arr[i]) end
            local right_part = {}
            for i = mid + 1, right do table.insert(right_part, arr[i]) end

            local merged = merge(left_part, right_part)
            for i = 1, #merged do
                arr[left + i - 1] = merged[i]
            end
        end
        size = size * 2
    end

    return arr
end
