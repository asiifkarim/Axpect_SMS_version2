import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { Card, Row, Col, Button, Form, Modal, Badge, ListGroup, InputGroup, Alert } from 'react-bootstrap'
import { useMockDataStore } from '../../store/mockDataStore'
import { useUserStore } from '../../store/userStore'
import { toast } from 'react-toastify'

// Memoized Message Component to prevent unnecessary re-renders
const MessageComponent = memo(({ message, user, getUserInfo }) => {
  const sender = getUserInfo(message.sender_id)
  const isOwnMessage = message.sender_id === user.id
  
  // Memoize the timestamp to prevent re-computation
  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString()
  }, [message.timestamp])
  
  return (
    <div className={`mb-3 ${isOwnMessage ? 'text-end' : 'text-start'}`}>
      <div className={`d-inline-block ${isOwnMessage ? 'text-end' : 'text-start'}`}>
        {!isOwnMessage && (
          <div className="d-flex align-items-center mb-1">
            <img
              src={sender.profile_pic}
              alt={sender.name}
              className="rounded-circle me-2"
              style={{ width: '24px', height: '24px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/images/default-avatar.png'
              }}
            />
            <small className="text-muted fw-bold">{sender.name}</small>
          </div>
        )}
        <div
          className={`p-2 rounded ${
            isOwnMessage 
              ? 'bg-primary text-white' 
              : 'bg-white border'
          }`}
          style={{ maxWidth: '70%', wordWrap: 'break-word' }}
        >
          <div>{message.content}</div>
          <small className={`${isOwnMessage ? 'text-white-50' : 'text-muted'}`}>
            {formattedTime}
          </small>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.user.id === nextProps.user.id
  )
})

// Memoized Chat List Item Component
const ChatListItem = memo(({ chat, user, getUserInfo, getChatDisplayName, getChatAvatar, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(chat)
  }, [chat, onSelect])
  
  return (
    <ListGroup.Item
      action
      active={isSelected}
      onClick={handleClick}
      className="d-flex align-items-center p-3"
      style={{ cursor: 'pointer' }}
    >
      <div className="me-3">
        <img
          src={getChatAvatar(chat)}
          alt={getChatDisplayName(chat)}
          className="rounded-circle"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = '/images/default-avatar.png'
          }}
        />
      </div>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="mb-1">
            {getChatDisplayName(chat)}
            {chat.type === 'group' && (
              <i className="fas fa-users text-muted ms-1" style={{ fontSize: '0.8em' }}></i>
            )}
          </h6>
          <small className="text-muted">
            {new Date(chat.last_message_time).toLocaleDateString()}
          </small>
        </div>
        <p className="mb-1 text-truncate text-muted" style={{ fontSize: '0.9em' }}>
          {chat.last_message || 'No messages yet'}
        </p>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {chat.type === 'group' ? `${chat.members.length} members` : 'Direct message'}
          </small>
          {chat.unread_count > 0 && (
            <Badge bg="primary" pill>{chat.unread_count}</Badge>
          )}
        </div>
      </div>
    </ListGroup.Item>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.chat.id === nextProps.chat.id &&
    prevProps.chat.last_message === nextProps.chat.last_message &&
    prevProps.chat.last_message_time === nextProps.chat.last_message_time &&
    prevProps.chat.unread_count === nextProps.chat.unread_count &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.user.id === nextProps.user.id
  )
})

const SocialRoutes = memo(() => {
  const { 
    messages, 
    chats, 
    employees, 
    managers,
    addMessage, 
    addChat, 
    updateChat, 
    deleteChat,
    addChatMember,
    removeChatMember,
    markMessageAsRead
  } = useMockDataStore()
  
  const { user, role } = useUserStore()
  
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [chatType, setChatType] = useState('all') // all, groups, dms
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showCreateDMModal, setShowCreateDMModal] = useState(false)
  const [showChatSettingsModal, setShowChatSettingsModal] = useState(false)
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    description: '',
    isPrivate: false,
    selectedMembers: []
  })
  const [dmRecipient, setDmRecipient] = useState('')

  // Ref to prevent unnecessary re-renders during updates
  const isUpdatingRef = useRef(false)

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Memoize expensive computations
  const allUsers = useMemo(() => {
    return [...employees, ...managers].filter(u => u.id !== user?.id)
  }, [employees, managers, user?.id])

  // Memoize filtered chats to prevent unnecessary re-renders
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const matchesSearch = chat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const isMember = chat.members.includes(user?.id)
      const matchesType = chatType === 'all' || chat.type === chatType
      
      return matchesSearch && isMember && matchesType
    })
  }, [chats, debouncedSearchTerm, chatType, user?.id])

  // Memoize chat messages with more aggressive optimization
  const getChatMessages = useCallback((chatId) => {
    if (!chatId || isUpdatingRef.current) return []
    
    return messages
      .filter(msg => msg.chat_id === chatId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [messages])

  // Memoize current chat messages to prevent re-computation
  const currentChatMessages = useMemo(() => {
    if (!selectedChat) return []
    return getChatMessages(selectedChat.id)
  }, [selectedChat, getChatMessages])

  // Memoize user info lookup
  const getUserInfo = useCallback((userId) => {
    const userInfo = [...employees, ...managers].find(u => u.id === userId)
    return userInfo || { name: 'Unknown User', profile_pic: '/images/default-avatar.png' }
  }, [employees, managers])

  // Memoize chat display name
  const getChatDisplayName = useCallback((chat) => {
    if (chat.type === 'dm') {
      const otherMember = chat.members.find(id => id !== user?.id)
      const otherUser = getUserInfo(otherMember)
      return otherUser.name
    }
    return chat.name
  }, [user?.id, getUserInfo])

  // Memoize chat avatar
  const getChatAvatar = useCallback((chat) => {
    if (chat.type === 'dm') {
      const otherMember = chat.members.find(id => id !== user?.id)
      const otherUser = getUserInfo(otherMember)
      return otherUser.profile_pic
    }
    return chat.avatar || '/images/default-group.png'
  }, [user?.id, getUserInfo])

  // Handle sending message with aggressive optimization
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedChat || isUpdatingRef.current) return

    isUpdatingRef.current = true
    const messageContent = newMessage.trim()
    
    // Clear input immediately to prevent visual lag
    setNewMessage('')

    // Create message object
    const message = {
      chat_id: selectedChat.id,
      sender_id: user.id,
      content: messageContent,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text',
      read_by: [user.id]
    }

    // Use a more aggressive batching strategy
    const updateChatData = {
      last_message: messageContent,
      last_message_time: new Date().toISOString()
    }

    // Batch all updates in a single frame
    requestAnimationFrame(() => {
      // Use setTimeout to ensure updates happen in the next tick
      setTimeout(() => {
        addMessage(message)
        updateChat(selectedChat.id, updateChatData)
        
        // Reset the updating flag after a longer delay
        setTimeout(() => {
          isUpdatingRef.current = false
          toast.success('Message sent!')
        }, 200)
      }, 0)
    })
  }, [newMessage, selectedChat, user.id, addMessage, updateChat])

  // Handle creating new group
  const handleCreateGroup = useCallback(() => {
    if (!newGroupForm.name.trim() || newGroupForm.selectedMembers.length === 0) {
      toast.error('Please provide group name and select at least one member')
      return
    }

    const groupChat = {
      name: newGroupForm.name.trim(),
      type: 'group',
      description: newGroupForm.description.trim(),
      created_by: user.id,
      members: [user.id, ...newGroupForm.selectedMembers],
      avatar: null,
      is_private: newGroupForm.isPrivate,
      created_at: new Date().toISOString(),
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count: 0
    }

    addChat(groupChat)
    setShowCreateGroupModal(false)
    setNewGroupForm({ name: '', description: '', isPrivate: false, selectedMembers: [] })
    toast.success('Group created successfully!')
  }, [newGroupForm, user.id, addChat])

  // Handle creating DM
  const handleCreateDM = useCallback(() => {
    if (!dmRecipient) {
      toast.error('Please select a recipient')
      return
    }

    // Check if DM already exists
    const existingDM = chats.find(chat => 
      chat.type === 'dm' && 
      chat.members.includes(user.id) && 
      chat.members.includes(parseInt(dmRecipient))
    )

    if (existingDM) {
      setSelectedChat(existingDM)
      setShowCreateDMModal(false)
      setDmRecipient('')
      toast.info('DM already exists, opening existing conversation')
      return
    }

    const recipient = getUserInfo(parseInt(dmRecipient))
    const dmChat = {
      name: `${user.name} & ${recipient.name}`,
      type: 'dm',
      description: `Direct message between ${user.name} and ${recipient.name}`,
      created_by: user.id,
      members: [user.id, parseInt(dmRecipient)],
      avatar: null,
      is_private: true,
      created_at: new Date().toISOString(),
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count: 0
    }

    addChat(dmChat)
    setShowCreateDMModal(false)
    setDmRecipient('')
    toast.success('DM created successfully!')
  }, [dmRecipient, chats, user.id, user.name, getUserInfo, addChat])

  // Handle member selection for group
  const handleMemberToggle = useCallback((memberId) => {
    setNewGroupForm(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter(id => id !== memberId)
        : [...prev.selectedMembers, memberId]
    }))
  }, [])

  // Stable chat selection handler
  const handleChatSelect = useCallback((chat) => {
    setSelectedChat(chat)
  }, [])

  // Role-based permissions
  const canCreateGroup = role === 'ceo' || role === 'manager'
  const canDeleteChat = (chat) => chat.created_by === user.id || role === 'ceo'
  const canAddMembers = (chat) => chat.created_by === user.id || role === 'ceo'

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row">
          {/* Chat List Sidebar */}
          <div className="col-md-4">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">
                    <i className="fas fa-comments mr-2"></i>
                    Messages
                  </h3>
                  <div className="btn-group">
                    {canCreateGroup && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setShowCreateGroupModal(true)}
                        title="Create Group"
                      >
                        <i className="fas fa-users"></i>
                      </Button>
                    )}
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => setShowCreateDMModal(true)}
                      title="Start DM"
                    >
                      <i className="fas fa-user-plus"></i>
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {/* Search and Filter */}
                <div className="p-3 border-bottom">
                  <Form.Control
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <Form.Select
                    value={chatType}
                    onChange={(e) => setChatType(e.target.value)}
                    size="sm"
                  >
                    <option value="all">All Chats</option>
                    <option value="group">Groups</option>
                    <option value="dm">Direct Messages</option>
                  </Form.Select>
                </div>

                {/* Chat List */}
                <div style={{ height: '500px', overflowY: 'auto' }}>
                  {filteredChats.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="fas fa-comment-slash fa-2x text-muted mb-2"></i>
                      <p className="text-muted">No conversations found</p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {filteredChats.map(chat => (
                        <ChatListItem
                          key={chat.id}
                          chat={chat}
                          user={user}
                          getUserInfo={getUserInfo}
                          getChatDisplayName={getChatDisplayName}
                          getChatAvatar={getChatAvatar}
                          isSelected={selectedChat?.id === chat.id}
                          onSelect={handleChatSelect}
                        />
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-md-8">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {selectedChat ? (
                      <div className="d-flex align-items-center">
                        <img
                          src={getChatAvatar(selectedChat)}
                          alt={getChatDisplayName(selectedChat)}
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = '/images/default-avatar.png'
                          }}
                        />
                        <div>
                          <h4 className="mb-0">{getChatDisplayName(selectedChat)}</h4>
                          <small className="text-muted">
                            {selectedChat.type === 'group' 
                              ? `${selectedChat.members.length} members` 
                              : 'Direct message'}
                          </small>
                        </div>
                      </div>
                    ) : (
                      <h4 className="mb-0">Select a conversation</h4>
                    )}
                  </div>
                  {selectedChat && (
                    <div className="btn-group">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setShowChatSettingsModal(true)}
                        title="Chat Settings"
                      >
                        <i className="fas fa-cog"></i>
                      </Button>
                      {canDeleteChat(selectedChat) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this chat?')) {
                              deleteChat(selectedChat.id)
                              setSelectedChat(null)
                              toast.success('Chat deleted successfully!')
                            }
                          }}
                          title="Delete Chat"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0" style={{ height: '500px' }}>
                {selectedChat ? (
                  <>
                    {/* Messages */}
                    <div 
                      className="p-3" 
                      style={{ 
                        height: '400px', 
                        overflowY: 'auto',
                        backgroundColor: '#f8f9fa',
                        contain: 'layout style paint',
                        willChange: 'auto'
                      }}
                    >
                      {currentChatMessages.map(message => (
                        <MessageComponent
                          key={message.id}
                          message={message}
                          user={user}
                          getUserInfo={getUserInfo}
                        />
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-top p-3 bg-white">
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          variant="primary"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <i className="fas fa-paper-plane"></i>
                        </Button>
                      </InputGroup>
                    </div>
                  </>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center">
                      <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">Select a conversation to start messaging</h5>
                      <p className="text-muted">
                        {canCreateGroup ? 'Create a group or start a direct message' : 'Start a direct message'}
                      </p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Create Group Modal */}
        <Modal show={showCreateGroupModal} onHide={() => setShowCreateGroupModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-users mr-2"></i>
              Create New Group
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Group Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={newGroupForm.name}
                      onChange={(e) => setNewGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter group name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Privacy</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Private Group"
                      checked={newGroupForm.isPrivate}
                      onChange={(e) => setNewGroupForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={newGroupForm.description}
                      onChange={(e) => setNewGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter group description"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Label>Add Members *</Form.Label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '10px' }}>
                    {allUsers.map(user => (
                      <Form.Check
                        key={user.id}
                        type="checkbox"
                        id={`member-${user.id}`}
                        label={`${user.name} (${user.user_type === '1' ? 'CEO' : user.user_type === '2' ? 'Manager' : 'Employee'})`}
                        checked={newGroupForm.selectedMembers.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateGroupModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateGroup}>
              <i className="fas fa-plus mr-1"></i>
              Create Group
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Create DM Modal */}
        <Modal show={showCreateDMModal} onHide={() => setShowCreateDMModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-user-plus mr-2"></i>
              Start Direct Message
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={dmRecipient}
                onChange={(e) => setDmRecipient(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.user_type === '1' ? 'CEO' : user.user_type === '2' ? 'Manager' : 'Employee'})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateDMModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateDM}>
              <i className="fas fa-paper-plane mr-1"></i>
              Start DM
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Chat Settings Modal */}
        <Modal show={showChatSettingsModal} onHide={() => setShowChatSettingsModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-cog mr-2"></i>
              Chat Settings - {selectedChat?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedChat && (
              <div>
                <h6>Chat Information</h6>
                <p><strong>Type:</strong> {selectedChat.type === 'group' ? 'Group Chat' : 'Direct Message'}</p>
                <p><strong>Members:</strong> {selectedChat.members.length}</p>
                <p><strong>Created:</strong> {new Date(selectedChat.created_at).toLocaleDateString()}</p>
                
                {selectedChat.type === 'group' && (
                  <div className="mt-3">
                    <h6>Group Members</h6>
                    <div className="list-group">
                      {selectedChat.members.map(memberId => {
                        const member = getUserInfo(memberId)
                        return (
                          <div key={memberId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <img
                                src={member.profile_pic}
                                alt={member.name}
                                className="rounded-circle me-2"
                                style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/images/default-avatar.png'
                                }}
                              />
                              <span>{member.name}</span>
                            </div>
                            {memberId === selectedChat.created_by && (
                              <Badge bg="primary">Admin</Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowChatSettingsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
})

export default SocialRoutes