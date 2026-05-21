---@param arr integer[]
---@return integer
function kadane(arr)
    local curr_sub = arr[1]
    local max_sub = arr[1]

    for i = 2, #arr do
        local num = arr[i]
        curr_sub = math.max(curr_sub + num, num)
        max_sub = math.max(max_sub, curr_sub)
    end

    return max_sub
end
