import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './ChatPage.css';

// CHANGE THIS to your backend URL
/*const SOCKET_URL = 'http://192.168.1.73:3000'; //use ip for testing
const API_URL = 'http://192.168.1.73:3000/api/chat';*/

const SOCKET_URL = 'http://localhost:3000';  // NOT your IP!
const API_URL = 'http://localhost:3000/api/chat';

function ChatPage({ onBackToHome }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Fake user IDs for testing (replace with real auth later)
  const urlParams = new URLSearchParams(window.location.search);
  const currentUserId = urlParams.get('user') || '1'; // Get ?user=X from URL . make dynamic later
  const otherUserId = urlParams.get('chatWith') || '2'; // Get ?chatWith=Y from URL

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Create/get conversation on mount
  useEffect(() => {
  async function initChat() {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId1: currentUserId,
          userId2: otherUserId,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to create conversation');
        return;
      }
      
      const conversation = await response.json();
      setConversationId(conversation.id);

      // Load existing messages
      const messagesRes = await fetch(`${API_URL}/conversations/${conversation.id}/messages`);
      
      if (messagesRes.ok) {
        const existingMessages = await messagesRes.json();
        // Ensure it's an array
        setMessages(Array.isArray(existingMessages) ? existingMessages : []);
      } else {
        setMessages([]); // Start with empty array if fetch fails
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages([]); // Start with empty array on error
    }
  }

  initChat();
}, []);

  // Join conversation room when socket connects
  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('joinConversation', { conversationId });

      // Listen for new messages
      socket.on('newMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || !conversationId) return;

    socket.emit('sendMessage', {
      conversationId,
      senderId: currentUserId,
      content: inputMessage,
    });

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button 
          onClick={onBackToHome} 
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <h2>User {currentUserId} chatting with User {otherUserId}</h2>
        <p className="chat-subtitle">MUN Marketplace Chat</p>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="message-input"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;