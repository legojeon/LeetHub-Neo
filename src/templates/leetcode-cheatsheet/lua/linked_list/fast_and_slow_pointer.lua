function fn(head)
    local slow = head
    local fast = head
    local ans = 0

    while fast and fast.next do
        -- TODO: logic
        slow = slow.next
        fast = fast.next.next
    end

    return ans
end
