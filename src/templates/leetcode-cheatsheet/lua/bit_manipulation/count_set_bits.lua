---@param num integer
---@return integer
function count_set_bits(num)
    local count = 0

    while num > 0 do
        count = count + (num & 1)
        num = num >> 1
    end

    return count
end
