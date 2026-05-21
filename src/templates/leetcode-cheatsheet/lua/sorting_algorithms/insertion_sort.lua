function insertion_sort(arr)
    local n = #arr
    for i = 2, n do
        local key = arr[i]
        local j = i
        while j > 1 and key < arr[j - 1] do
            arr[j] = arr[j - 1]
            j = j - 1
        end
        arr[j] = key
    end
end
