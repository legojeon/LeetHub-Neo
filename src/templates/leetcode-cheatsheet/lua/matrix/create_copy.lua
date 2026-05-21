---@param matrix integer[][]
function fn(matrix)
    local r = #matrix
    local c = #matrix[1]

    local create_matrix = {}
    for i = 1, r do
        create_matrix[i] = {}
        for j = 1, c do
            create_matrix[i][j] = 0
        end
    end

    local copy_matrix = {}
    for i = 1, r do
        copy_matrix[i] = {}
        for j = 1, c do
            copy_matrix[i][j] = matrix[i][j]
        end
    end
end
