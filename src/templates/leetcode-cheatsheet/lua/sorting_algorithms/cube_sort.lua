function cube_sort(arr, processors)
    local n = #arr
    local subarrays = {}
    local subarray_size = math.floor(n / processors)

    for i = 0, processors - 1 do
        local sub = {}
        for j = 1, subarray_size do
            table.insert(sub, arr[i * subarray_size + j])
        end
        table.sort(sub)
        table.insert(subarrays, sub)
    end

    local steps = 0
    local temp_p = processors
    while temp_p > 1 do
        temp_p = temp_p >> 1
        steps = steps + 1
    end

    for dimension = 0, steps - 1 do
        for i = 0, processors - 1 do
            local partner = i ~ (1 << dimension)
            if i < partner then
                local merged = {}
                for _, v in ipairs(subarrays[i + 1]) do table.insert(merged, v) end
                for _, v in ipairs(subarrays[partner + 1]) do table.insert(merged, v) end
                table.sort(merged)

                local new_i, new_p = {}, {}
                for j = 1, subarray_size do table.insert(new_i, merged[j]) end
                for j = subarray_size + 1, #merged do table.insert(new_p, merged[j]) end

                subarrays[i + 1] = new_i
                subarrays[partner + 1] = new_p
            end
        end
    end

    local idx = 1
    for i = 1, processors do
        for j = 1, #subarrays[i] do
            arr[idx] = subarrays[i][j]
            idx = idx + 1
        end
    end
end
