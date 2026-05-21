function fn(arr, k)
    local heap = MinHeap.new()

    for _, num in ipairs(arr) do
        -- TODO: logic to push onto heap according to problem's criteria
        heap:push({CRITERIA, num})

        if #heap > k then
            heap:pop()
        end
    end

    local result = {}
    for i = 1, #heap do
        local entry = heap[i]
        table.insert(result, entry[2])
    end

    return result
end
