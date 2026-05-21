---@param num1 integer
---@param num2 integer
---@return integer, integer
function swap_variables(num1, num2)
    num1 ^= num2
    num2 ^= num1
    num1 ^= num2
    return num1, num2
end
