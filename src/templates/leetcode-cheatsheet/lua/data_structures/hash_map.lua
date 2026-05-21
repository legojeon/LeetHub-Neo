local class = require('middleclass')

---@class HashMap
---@field size integer
---@field bucket table
local HashMap = class('HashMap')

---@param size integer
function HashMap:initialize(size)
    self.size = size or 100000
    self.bucket = {}

    local mt = getmetatable(self)

    ---@param t HashMap
    ---@param k any
    ---@return any
    mt.__index = function(t, k)
        local class_member = HashMap[k]
        if class_member ~= nil then
            return class_member
        end
        return t.bucket[t:_hash(k)]
    end

    ---@param t HashMap
    ---@param k any
    ---@param v any
    mt.__newindex = function(t, k, v)
        t.bucket[t:_hash(k)] = v
    end
end

---@param key any
---@return integer
function HashMap:_hash(key)
    local s = tostring(key)
    local h = 0
    for i = 1, #s do
        h = (h * 31 + s:byte(i)) % self.size
    end
    return h + 1
end
