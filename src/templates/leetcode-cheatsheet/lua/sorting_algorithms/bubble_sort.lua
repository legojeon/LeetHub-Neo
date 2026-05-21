function bubble_sort(arr)
    local n = #arr
    for i = 1, n do
        local swapped = false

        for j = 1, n - i do
            if arr[j] > arr[j + 1] then
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = true
            end
        end

        if not swapped then break end
    end
end
