---@param matrix integer[][]
function fn(matrix)
    local r = #matrix
    local c = #matrix[1]

    local transpose = {}
    for j = 1, c do
        transpose[j] = {}
        for i = 1, r do
            transpose[j][i] = matrix[i][j]
        end
    end

    local rotate_left = {}
    local tr = #transpose
    for i = 1, tr do
        rotate_left[tr - i + 1] = transpose[i]
    end

    local rotate_right = {}
    for i = 1, #transpose do
        rotate_right[i] = {}
        local row_len = #transpose[i]
        for j = 1, row_len do
            rotate_right[i][j] = transpose[i][row_len - j + 1]
        end
    end
end
