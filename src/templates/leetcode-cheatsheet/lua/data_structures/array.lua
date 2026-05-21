local class = require('middleclass')

---@class Array
---@field size integer
---@field data table
local Array = class('Array')

---@param size integer
function Array:initialize(size)
    self.size = size
    self.data = {}
end

---@param index integer
---@return any
function Array:get(index)
    return self.data[index]
end

---@param index integer
---@param value any
function Array:set(index, value)
    self.data[index] = value
end

---@return integer
function Array:len()
    return self.size
end

---@return string
function Array:__tostring()
    local parts = {}
    for i = 1, self.size do
        table.insert(parts, tostring(self.data[i] or 'nil'))
    end
    return '[' .. table.concat(parts, ', ') .. ']'
end
