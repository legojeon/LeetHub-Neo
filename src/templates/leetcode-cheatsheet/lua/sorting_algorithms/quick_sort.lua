function quick_sort(arr)
    local n = #arr
    if n <= 1 then return arr end

    local pivot = arr[math.floor(n / 2) + 1]
    local left, right, middle = {}, {}, {}

    for i = 1, n do
        local x = arr[i]
        if x < pivot then
            table.insert(left, x)
        elseif x > pivot then
            table.insert(right, x)
        else
            table.insert(middle, x)
        end
    end

    local res_left = quick_sort(left)
    local res_right = quick_sort(right)

    local res = {}
    for _, v in ipairs(res_left) do table.insert(res, v) end
    for _, v in ipairs(middle) do table.insert(res, v) end
    for _, v in ipairs(res_right) do table.insert(res, v) end

    return res
end
