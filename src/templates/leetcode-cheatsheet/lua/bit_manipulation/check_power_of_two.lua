---@param num integer
---@return boolean
function is_power_of_two(num)
    return (num & (num - 1)) == 0
end
