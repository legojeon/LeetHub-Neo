local class = require('middleclass')

---@class ListNode
---@field data any
---@field prev ListNode|nil
---@field next ListNode|nil
local ListNode = class('ListNode')

function ListNode:initialize(data)
    self.data = data
    self.prev = nil
    self.next = nil
end

---@return string
function ListNode:__tostring()
    return string.format('[%s]', tostring(self.data))
end

---@class DoublyLinkedList
---@field head ListNode|nil
local DoublyLinkedList = class('DoublyLinkedList')

function DoublyLinkedList:initialize()
    self.head = nil
end

---@param data any
function DoublyLinkedList:append(data)
    if not self.head then
        self.head = ListNode:new(data)
        return
    end
    local curr = self.head
    while curr.next do
        curr = curr.next
    end
    local new_node = ListNode:new(data)
    curr.next = new_node
    new_node.prev = curr
end

---@param data any
function DoublyLinkedList:delete(data)
    if not self.head then
        return
    end
    if self.head.data == data then
        self.head = self.head.next
        if self.head then
            self.head.prev = nil
        end
        return
    end
    local curr = self.head
    while curr do
        if curr.data == data then
            local prev_node = curr.prev
            if prev_node then
                prev_node.next = curr.next
            end
            if curr.next then
                curr.next.prev = prev_node
            end
            return
        end
        curr = curr.next
    end
end

function DoublyLinkedList:reverse()
    local curr = self.head
    local prev = nil
    while curr do
        local nxt = curr.next
        curr.next = prev
        curr.prev = nxt
        prev = curr
        curr = nxt
    end
    self.head = prev
end

---@return string
function DoublyLinkedList:__tostring()
    if not self.head then
        return 'nil'
    end
    local nodes = {}
    local curr = self.head
    while curr do
        table.insert(nodes, tostring(curr))
        curr = curr.next
    end
    return table.concat(nodes, ' <-> ') .. ' <-> nil'
end
