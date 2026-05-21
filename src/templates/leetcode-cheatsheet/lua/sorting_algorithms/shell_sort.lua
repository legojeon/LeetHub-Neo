function shell_sort(arr)
    local n = #arr
    local gaps = {701, 301, 132, 57, 23, 10, 4, 1}

    for _, gap in ipairs(gaps) do
        for i = gap + 1, n do
            local tmp = arr[i]
            local j = i
            while j > gap and arr[j - gap] > tmp do
                arr[j] = arr[j - gap]
                j = j - gap
            end
            if j ~= i then
                arr[j] = tmp
            end
        end
    end
end
