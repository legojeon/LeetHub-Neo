---@param matrix integer[][]
function fn(matrix)
    local r = #matrix
    local c = #matrix[1]
    local min_dim = math.min(r, c)

    local main_diagonal = {}
    local anti_diagonal = {}

    for i = 1, min_dim do
        table.insert(main_diagonal, matrix[i][i])
        table.insert(anti_diagonal, matrix[i][c - i + 1])
    end
end
