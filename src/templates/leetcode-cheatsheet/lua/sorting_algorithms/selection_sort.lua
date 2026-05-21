function selection_sort(arr)
    local n = #arr
    for i = 1, n do
        local min_i = i
        for j = i + 1, n do
            if arr[j] < arr[min_i] then
                min_i = j
            end
        end
        if min_i ~= i then
            arr[i], arr[min_i] = arr[min_i], arr[i]
        end
    end
end
