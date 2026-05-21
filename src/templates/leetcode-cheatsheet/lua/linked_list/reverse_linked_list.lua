function fn(head)
    local prev = nil
    local curr = head

    while curr do
        local nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    end

    return prev
end
