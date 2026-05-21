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

function merge_sort(arr)
    local n = #arr
    if n <= 1 then return arr end

    local mid = math.floor(n / 2)
    local left, right = {}, {}
    for i = 1, mid do table.insert(left, arr[i]) end
    for i = mid + 1, n do table.insert(right, arr[i]) end

    return merge(merge_sort(left), merge_sort(right))
end
