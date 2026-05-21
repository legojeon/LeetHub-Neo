---@param num integer
---@param k integer
---@return integer
function clear_kth_bit(num, k)
    return num & ~(1 << k)
end
