function bucket_sort(arr)
    local num_buckets = 10
    local min_num, max_num = math.huge, -math.huge
    for _, v in ipairs(arr) do
        if v < min_num then min_num = v end
        if v > max_num then max_num = v end
    end

    local bucket_range = (max_num - min_num) / num_buckets
    local buckets = {}
    for i = 1, num_buckets do buckets[i] = {} end

    for _, num in ipairs(arr) do
        local index = math.floor((num - min_num) / bucket_range) + 1
        if index > num_buckets then index = num_buckets end
        table.insert(buckets[index], num)
    end

    local result = {}
    for i = 1, num_buckets do
        table.sort(buckets[i])
        for _, num in ipairs(buckets[i]) do
            table.insert(result, num)
        end
    end

    return result
end
