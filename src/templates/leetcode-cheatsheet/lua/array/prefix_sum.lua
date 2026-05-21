function fn(arr)
    local n = #arr
    local prefix = {arr[1]}

    for i = 2, n do
        table.insert(prefix, prefix[#prefix] + arr[i])
    end

    return prefix
end
