function fn(arr)
    local strings = {}

    for _, s in ipairs(arr) do
        table.insert(strings, s)
    end

    return table.concat(strings, '')
end
