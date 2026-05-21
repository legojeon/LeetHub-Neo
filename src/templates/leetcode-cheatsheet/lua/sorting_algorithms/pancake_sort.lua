local function flip(arr, i)
    local left = 1
    while left < i do
        arr[left], arr[i] = arr[i], arr[left]
        left = left + 1
        i = i - 1
    end
end

local function find_max_index(arr, n)
    local max_idx = 1
    for i = 1, n do
        if arr[i] > arr[max_idx] then max_idx = i end
    end
    return max_idx
end

function pancake_sort(arr)
    local n = #arr
    for size = n, 2, -1 do
        local max_idx = find_max_index(arr, size)
        if max_idx ~= size then
            flip(arr, max_idx)
            flip(arr, size)
        end
    end
end
