---@param num integer
---@param k integer
---@return boolean
function test_kth_bit(num, k)
    return num & (1 << k) != 0
end
