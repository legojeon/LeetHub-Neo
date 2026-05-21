---@param num integer
---@return integer
function get_rightmost_set_bit(num)
    return num & -num
end
