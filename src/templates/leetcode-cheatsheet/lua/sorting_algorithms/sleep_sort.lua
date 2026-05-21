local function snorlax(num, arr)
    sleep(num / 1000.0)
    table.insert(arr, num)
end

function sleep_sort(arr)
    local sorted_arr = {}
    local threads = {}

    for _, num in ipairs(arr) do
        local t = Thread.new(snorlax, num, sorted_arr)
        table.insert(threads, t)
    end

    for _, t in ipairs(threads) do
        t:start()
    end

    for _, t in ipairs(threads) do
        t:join()
    end

    return sorted_arr
end
