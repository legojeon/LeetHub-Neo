local class = require('middleclass')

---@class ListNode
---@field data any
---@field next ListNode|nil
local ListNode = class('ListNode')

function ListNode:initialize(data)
    self.data = data
    self.next = nil
end

---@class LinkedList
---@field head ListNode|nil
local LinkedList = class('LinkedList')

function LinkedList:initialize()
    self.head = nil
end

---@param data any
function LinkedList:append(data)
    if not self.head then
        self.head = ListNode:new(data)
        return
    end
    local curr = self.head
    while curr.next do
        curr = curr.next
    end
    curr.next = ListNode:new(data)
end
