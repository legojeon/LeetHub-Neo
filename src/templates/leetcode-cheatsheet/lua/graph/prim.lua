---@param n integer
---@param edges table
---@return table[]
function prim_mst(n, edges)
    local mst = {}
    local uf = UnionFind.new(n)
    local heap = MinHeap.new(edges)

    while #heap > 0 do
        local edge = heap:pop()
        local w, u, v = edge[1], edge[2], edge[3]

        if not uf:connected(u, v) then
            uf:union(u, v)
            table.insert(mst, {w, u, v})
        end
    end

    return mst
end
