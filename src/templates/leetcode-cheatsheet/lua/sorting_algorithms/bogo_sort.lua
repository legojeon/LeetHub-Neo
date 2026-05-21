function bogo_sort(arr)
    local function is_sorted(t)
        for i = 1, #t - 1 do
            if t[i] > t[i + 1] then return false end
        end
        return true
    end

    local function shuffle(t)
        for i = #t, 2, -1 do
            local j = math.random(i)
            t[i], t[j] = t[j], t[i]
        end
    end

    while not is_sorted(arr) do
        shuffle(arr)
    end
end
