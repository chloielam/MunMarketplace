import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FaUserCircle, FaTimes, FaCommentDots, FaStore, FaSpinner } from 'react-icons/fa';
import api from "../services/api";
import { getUserListings } from '../services/items';
import { authUtils } from '../services/auth';
import { API_BASE_URL, SOCKET_URL } from "../config";

// Avatar Fallback Component
const UserIcon = ({ size = 40, color = 'text-gray-400' }) => (
    <FaUserCircle size={size} className={color} />
);

const emptyConversation = {
    id: null,
    otherUser: { id: null, name: 'Select a Chat', email: '' },
    product: {},
    messages: [],
    role: 'N/A'
};

function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const currentUser = authUtils.getSessionUser();

    // Initial context from navigation (e.g., clicking 'Message Seller')
    const initialChatContext = location.state?.chatContext;
    const { product: initialProduct } = initialChatContext || {};

    const currentUserId = currentUser?.id;

    // Active chat states
    const [activeConvo, setActiveConvo] = useState(emptyConversation);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [initialProductTemp, setInitialProductTemp] = useState(initialProduct)

    // Conversation List states
    const [allConversations, setAllConversations] = useState([]);
    const [viewMode, setViewMode] = useState(initialChatContext ? 'Buyer' : 'Seller');

    // Loading states
    const [isLoadingConvo, setIsLoadingConvo] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(true);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const previousConversationIdRef = useRef(null);

    // --- Helper Functions ---
    const renderAvatar = (url, sizeClass = 'w-10 h-10') => {
        if (url && typeof url === 'string') {
            return <img className={`${sizeClass} rounded-full object-cover`} src={url} alt="User Avatar" />;
        }
        const iconSize = sizeClass.includes('w-8') ? 28 : 40;
        return <UserIcon size={iconSize} color="text-gray-400" />;
    };

    const onBackToHome = () => {
        navigate('/');
    };

    // --- API Functions ---

    // 1. Fetch User Details (Mocking /api/users/:userId endpoint)
    const fetchUserDetails = useCallback(async (userId) => {
        if (!userId) return null;
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            if (!response.ok) return null;
            const userData = await response.json();

            return {
                id: userData.user_id,
                name: `${userData.first_name} ${userData.last_name || ''}`.trim() || `User ${userData.user_id.slice(0, 8)}`,
                email: userData.mun_email,
                avatar: userData.profilePictureUrl || null
            };
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    }, []);

    // 2. Fetch Product Details (Mocking /api/listings/:listingId endpoint)
    const fetchProductDetails = useCallback(async (listingId) => {
        if (!listingId) return {};
        try {
            const response = await fetch(`${API_BASE_URL}/listings/${listingId}`);
            if (!response.ok) {
                console.warn(`Product details not found for ID: ${listingId}`);
                return { id: listingId, title: 'Product Not Found', price: 0 };
            }
            const productData = await response.json();

            return {
                id: productData.id,
                title: productData.title,
                description: productData.description,
                price: productData.price,
                currency: productData.currency || '$',
                status: productData.status,
                campus: productData.campus,
                imageUrls: productData.imageUrls || [],
                seller_id: productData.seller_id
            };
        } catch (error) {
            console.error('Error fetching product details:', error);
            return { id: listingId, title: 'Error Loading Product', price: 0 };
        }
    }, []);

    // 3. Fetch All Conversations (The Inbox)
    const fetchAllConversations = useCallback(async () => {
        console.log(currentUserId, "currentUserId===")

        if (!currentUserId) return;
        setIsLoadingList(true);

        try {
            console.log(currentUserId, "currentUserId===")
            // API Call: GET /chat/users/:userId/conversations
            const allConvosRes = await fetch(`${API_BASE_URL}/chat/users/${currentUserId}/conversations`);

            if (!allConvosRes.ok) throw new Error("Failed to fetch all conversations.");
            const rawConvos = await allConvosRes.json();

            const listingsData = await getUserListings();

            const ownedListingIds = new Set(listingsData.map(l => l.id));
            const listingDetailsMap = new Map(listingsData.map(l => [l.id, l]));

            let finalConversations = [];

            for (const convo of rawConvos) {
                let role = 'Buyer';
                let productDetails = {
                    id: null,
                    title: 'General Chat',
                    price: null,
                    status: 'ACTIVE',
                };

                if (convo.listingId) {
                    const isSellerConvo = ownedListingIds.has(convo.listingId);
                    role = isSellerConvo ? 'Seller' : 'Buyer';

                    if (listingDetailsMap.has(convo.listingId)) {
                        productDetails = listingDetailsMap.get(convo.listingId);
                    } else {
                        // Fetch details if not one of the user's own listings (e.g., if user is the buyer)
                        productDetails = await fetchProductDetails(convo.listingId);
                    }
                }

                const otherUserId = convo.participantIds.find(id => id !== currentUserId);
                const otherUserDetails = await fetchUserDetails(otherUserId);

                if (!otherUserDetails) {
                    console.warn(`Skipping conversation ${convo.id}: Could not fetch other user details.`);
                    continue;
                }

                finalConversations.push({
                    id: convo.id,
                    listingId: convo.listingId,
                    product: productDetails,
                    otherUser: otherUserDetails,
                    lastMessage: convo.lastMessage || 'Start a new chat!',
                    lastMessageAt: convo.lastMessageAt ? new Date(convo.lastMessageAt) : new Date(convo.createdAt),
                    role: role // 'Buyer' or 'Seller'
                });
            }

            finalConversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

            const convoIds = new Set();
            const uniqueConversations = finalConversations.filter(convo => {
                if (convoIds.has(convo.id)) {
                    return false; // Skip duplicate
                }
                convoIds.add(convo.id);
                return true;
            });

            uniqueConversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

            setAllConversations(uniqueConversations);

            // setAllConversations(finalConversations);

        } catch (error) {
            console.error('Error fetching conversations list:', error);
        } finally {
            setIsLoadingList(false);
        }
    }, [currentUserId, fetchUserDetails, fetchProductDetails]);

    // 4. Handle Conversation Selection
    const handleConvoClick = useCallback(async (convo) => {
        if (convo.id === activeConvo.id && convo.id) return;

        
        setInitialProductTemp({
            ...convo,
            seller_id: convo?.product?.seller_id,
            id: convo?.listingId,
        })

        setIsLoadingConvo(true);
        setActiveConvo(convo);
        setConversationId(convo.id);

        try {
            // Refetch details for the selected user to ensure data freshness
            const otherUserDetails = await fetchUserDetails(convo.otherUser.id);
            setActiveConvo(prev => ({ ...prev, otherUser: otherUserDetails || convo.otherUser }));

            if (convo.id) {
                // API Call: GET /chat/conversations/:id/messages
                const messagesRes = await fetch(`${API_BASE_URL}/chat/conversations/${convo.id}/messages`);
                if (messagesRes.ok) {
                    const existingMessages = await messagesRes.json();
                    setMessages(Array.isArray(existingMessages) ? existingMessages : []);
                } else {
                    setMessages([]);
                }
            } else {
                setMessages([]);
            }

        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setIsLoadingConvo(false);
        }
    }, [activeConvo.id, fetchUserDetails]);

    // 5. Create or Get Conversation (Used when clicking 'Message Seller')
    const createOrGetConversation = useCallback(async (targetListingId, sellerId) => {
        if (!currentUserId || !targetListingId || !sellerId) return null;

        // Check if conversation already exists in our fetched list
        const existingConvo = allConversations.find(c =>
            c.listingId === targetListingId && c.otherUser.id === sellerId
        );

        if (existingConvo) {
            return existingConvo;
        }

        setIsLoadingConvo(true);
        try {
            // API Call: POST /chat/conversations (backend handles get or create logic)
            const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId1: currentUserId,
                    userId2: sellerId,
                    listingId: targetListingId,
                }),
            });

            if (!response.ok) throw new Error("Failed to create new conversation.");

            const newConvoData = await response.json();

            // Populate full context for the new conversation object
            const sellerDetails = await fetchUserDetails(sellerId);
            const productDetails = await fetchProductDetails(targetListingId);

            const newConvo = {
                id: newConvoData.id,
                listingId: targetListingId,
                product: productDetails,
                otherUser: sellerDetails,
                lastMessage: 'New chat started.',
                lastMessageAt: new Date(),
                role: 'Buyer'
            };

            // Add new conversation to the list and return it
            // setAllConversations(prev => [newConvo, ...prev]);
            return newConvo;

        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        } finally {
            setIsLoadingConvo(false);
        }
    }, [currentUserId, allConversations, fetchUserDetails, fetchProductDetails]);

    // --- Effects ---

    // 1. Initial Load: Fetch conversations
    useEffect(() => {
        if (currentUserId) {
            fetchAllConversations();
        }
    }, [currentUserId, fetchAllConversations]);

    // 2. Initial Context: Auto-select chat from product page
    useEffect(() => {
        // Only run if a product context was passed and we haven't selected a chat yet
        if (initialChatContext && initialProduct && currentUserId && !activeConvo.id) {
            const initChatSetup = async () => {
                const targetListingId = initialProduct.id;
                const sellerId = initialProduct.seller_id;

                const targetConvo = await createOrGetConversation(targetListingId, sellerId);

                if (targetConvo) {
                    handleConvoClick(targetConvo);
                } else {
                    console.error("Could not load or create initial conversation.");
                }
            };

            initChatSetup();
        }
    }, [initialChatContext, initialProduct, currentUserId, activeConvo.id, handleConvoClick, createOrGetConversation]);

    // 3. Socket Setup (Runs once on mount)
    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        socketRef.current = newSocket;

        return () => {
            // Cleanup on unmount
            newSocket.close();
            socketRef.current = null;
        };
    }, []);

    // 4. Socket Message Listeners and Room Management (Runs when conversationId changes)
    useEffect(() => {
        if (!socketRef.current || !currentUserId) return;

        // Cleanup function for this effect
        const cleanupSocket = () => {
            // Leave previous room if exists
            if (previousConversationIdRef.current && socketRef.current.connected) {
                socketRef.current.emit('leaveConversation', {
                    conversationId: previousConversationIdRef.current
                });
            }
        };

        if (conversationId) {
            // 1. Leave old room and join new room
            cleanupSocket(); // Leave the old room before joining the new one
            socketRef.current.emit('joinConversation', { conversationId });
            previousConversationIdRef.current = conversationId;

            // 2. Listen for new messages
            const handleNewMessage = (message) => {
                // Ensure the message belongs to the current conversation
                if (message.conversationId !== conversationId) return;

                // Update messages state
                setMessages((prev) => {
                    // Simple check for duplicates (using ID is best, fallback on content/sender/time)
                    const exists = prev.some(msg =>
                        msg.id === message.id ||
                        (msg.content === message.content &&
                            msg.senderId === message.senderId &&
                            Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
                    );
                    if (exists) return prev;
                    return [...prev, message];
                });

                // Update conversation list item's last message
                setAllConversations(prevConvos => {
                    const newConvos = prevConvos.map(convo => {
                        if (convo.id === message.conversationId) {
                            return {
                                ...convo,
                                lastMessage: message.content,
                                lastMessageAt: new Date(message.createdAt)
                            };
                        }
                        return convo;
                    });
                    // Re-sort the list so the new conversation bubbles to the top
                    newConvos.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
                    return newConvos;
                });
            };

            socketRef.current.on('newMessage', handleNewMessage);

            return () => {
                if (socketRef.current) { 
                    socketRef.current.off('newMessage', handleNewMessage);
                }
                // Perform socket cleanup upon effect teardown
                if (socketRef.current) cleanupSocket();
            };
        }

        return cleanupSocket;

    }, [conversationId, currentUserId]);

    // 5. Scroll to bottom
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    // --- Interaction Handlers ---

    // Send message using the REST API (robust approach)
    const sendMessage = async () => {
        if (!inputMessage.trim() || !conversationId) return;

        const messageContent = inputMessage.trim();
        setInputMessage(''); // Clear input immediately

        try {
            console.log({
                conversationId,
                senderId: currentUserId,
                content: messageContent,
                userId: currentUserId,
                listingId: initialProductTemp.id
            }, "send in BE")
           
            socketRef.current.emit('sendMessage', {
                conversationId,
                senderId: currentUserId,
                content: messageContent,
                sellerId: initialProductTemp.seller_id,
                listingId: initialProductTemp.id
            });

            // const response = await api.post(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {

            //     body: JSON.stringify({
            //         senderId: currentUserId,
            //         content: messageContent,
            //     }),
            // });

            // if (!response.ok) {
            //     console.error("Failed to save message to database.");
            // }
            // Message will be received via socket listener from backend broadcast (handleNewMessage)

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const filteredConvos = allConversations.filter(convo => convo.role === viewMode);

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-red-500 text-lg">Error: Current user data is missing. Please log in.</p>
            </div>
        );
    }


    return (
        <div className="flex h-[90vh] max-w-7xl mx-auto my-5 rounded-xl shadow-2xl overflow-hidden bg-white">

            {/* Left Panel: Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className={`bg-mun-red border-b border-gray-700 text-center shadow-md flex flex-col`}>

                    {/* Current User Info */}
                    <div className="flex items-center justify-start p-4 space-x-2 border-b border-white/50">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white overflow-hidden">
                            {renderAvatar(currentUser?.profilePictureUrl, 'w-full h-full')}
                        </div>
                        <div className="flex flex-col gap-0 items-start">
                            <div className="text-base font-semibold text-white leading-none">{currentUser.firstName || 'User'}</div>
                            <div className="text-xs font-normal text-white opacity-80">{currentUser.email}</div>
                        </div>
                    </div>

                    {/* View Mode Tabs */}
                    <div className="flex w-full text-sm font-semibold">
                        <button
                            onClick={() => setViewMode('Buyer')}
                            className={`flex-1 p-2 transition-colors flex items-center justify-center space-x-2 ${viewMode === 'Buyer' ? 'bg-white text-red-700 rounded-tl-md' : 'bg-red-800 hover:bg-red-900 text-white'}`}
                        >
                            <FaCommentDots className="text-lg" />
                            <span>Buying</span>
                        </button>
                        <button
                            onClick={() => setViewMode('Seller')}
                            className={`flex-1 p-2 transition-colors flex items-center justify-center space-x-2 ${viewMode === 'Seller' ? 'bg-white text-red-700 rounded-tr-md' : 'bg-red-800 hover:bg-red-900 text-white'}`}
                        >
                            <FaStore className="text-lg" />
                            <span>Selling</span>
                        </button>
                    </div>
                </div>

                {/* Conversation List */}
                <div className="overflow-y-auto flex-grow">
                    {isLoadingList ? (
                        <div className="p-4 text-center text-gray-500">
                            <FaSpinner className="animate-spin inline mr-2" /> Loading chats...
                        </div>
                    ) : filteredConvos.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No conversations found in {viewMode} view.
                        </div>
                    ) : (
                        filteredConvos.map(convo => (
                            <div
                                key={convo.id}
                                onClick={() => handleConvoClick(convo)}
                                className={`flex p-4 border-b border-gray-200 cursor-pointer transition-colors items-center 
                                    ${activeConvo.id === convo.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                    {renderAvatar(convo.otherUser.avatar)}
                                </div>
                                <div className="flex flex-col overflow-hidden flex-1">
                                    <strong className="text-sm font-semibold text-gray-800 truncate">{convo.otherUser.name}</strong>
                                    <span className="text-xs text-gray-500 truncate">Re: {convo.product.title || 'General Chat'}</span>
                                    <span className="text-xs text-gray-400 truncate">{convo.lastMessage}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Chat Window */}
            <div className="flex-grow flex flex-col">

                {/* Chat Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 border border-gray-300 overflow-hidden">
                            {renderAvatar(activeConvo.otherUser.avatar)}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-800">
                                {activeConvo.otherUser.name}
                            </p>
                            <p className={`text-xs text-mun-red font-semibold`}>
                                {activeConvo.otherUser.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onBackToHome}
                        className={`text-gray-500 hover:text-red-700 font-semibold p-2 rounded-lg transition-colors`}
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Product Context Bar */}
                {activeConvo.product.id && activeConvo.product.title && (
                    <div className="p-4 bg-white border-b border-gray-300 flex justify-center">
                        <div className="w-full max-w-md border-2 border-gray-200 rounded-lg shadow-xl p-3 bg-gray-50">
                            <img
                                src={activeConvo.product.imageUrls?.[0] || "https://via.placeholder.com/400x200?text=No+Image"}
                                alt={activeConvo.product.title || 'Product'}
                                className="w-full h-40 object-cover rounded-md mb-2 border border-gray-300"
                            />
                            <h4 className="text-xl font-extrabold text-gray-900 leading-tight">{activeConvo.product.title || 'Product Title'}</h4>
                            <span className={`text-2xl font-black text-mun-red block my-1`}>
                                {activeConvo.product.currency || '$'} {activeConvo.product.price?.toFixed(2) || '0.00'}
                            </span>
                            <div className="flex justify-between text-xs pt-2 border-t border-gray-200 text-gray-500">
                                <span>Status: <span className={`font-bold ${activeConvo.product.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{activeConvo.product.status || 'N/A'}</span></span>
                                <span>Campus: <span className="font-bold">{activeConvo.product.campus || 'N/A'}</span></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Container */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-100 flex flex-col space-y-3">
                    {isLoadingConvo ? (
                        <div className="m-auto text-gray-500">
                            <FaSpinner className="animate-spin inline mr-2" /> Loading conversation...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="m-auto text-center text-gray-500">
                            {activeConvo.id || initialChatContext ? (
                                <>
                                    <p>This is the start of your chat about <strong>{activeConvo.product.title || 'this item'}</strong>.</p>
                                    <p className="text-sm">Type your first message below!</p>
                                </>
                            ) : (
                                <p className="text-lg">Select a conversation from the left to start chatting.</p>
                            )}
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${msg.senderId === currentUserId
                                            ? `bg-blue-600 text-white rounded-br-none`
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                        }`}
                                >
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <span className={`text-xs mt-1 block text-right ${msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Container */}
                <div className="flex p-4 border-t border-gray-200 bg-white">
                    <input
                        type="text"
                        placeholder={`Message ${activeConvo.otherUser.name}...`}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-700 mr-3 transition duration-150"
                        disabled={!conversationId || isLoadingConvo || activeConvo.product.status !== 'ACTIVE'}
                    />
                    <button
                        onClick={sendMessage}
                        className={`bg-mun-red hover:bg-mun-gold text-white font-bold py-3 px-6 rounded-full transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        disabled={!conversationId || !inputMessage.trim() || isLoadingConvo || activeConvo.product.status !== 'ACTIVE'}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;