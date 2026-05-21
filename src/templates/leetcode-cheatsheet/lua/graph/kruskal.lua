---@param n integer
---@param edges { [1]: number, [2]: integer, [3]: integer }[]
---@return table[]
function kruskal_mst(n, edges)
    local mst = {}
    local uf = UnionFind.new(n)
    table.sort(edges, function(a, b) return a[1] < b[1] end)

    for _, edge in ipairs(edges) do
        local w, u, v = edge[1], edge[2], edge[3]
        if not uf:connected(u, v) then
            uf:union(u, v)
            table.insert(mst, {w, u, v})
        end
    end

    return mst
end
