import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import NeonButton from './common/NeonButton';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-red-500 after:shadow-[0_0_10px_theme(colors.red.500)]">
        {children}
    </h2>
);

interface MessageProps {
    userEmail: string;
}

const MessageComponent: React.FC<MessageProps> = ({ userEmail }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getAllMessages = (): Message[] => JSON.parse(localStorage.getItem('messages') || '[]');
    
    const saveAllMessages = (allMessages: Message[]) => {
        localStorage.setItem('messages', JSON.stringify(allMessages));
    };

    useEffect(() => {
        const allMessages = getAllMessages();
        const conversation = allMessages
            .filter(msg => (msg.from === userEmail && msg.to === 'admin') || (msg.from === 'admin' && msg.to === userEmail))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(conversation);
    }, [userEmail]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const allMessages = getAllMessages();
        const message: Message = {
            id: Date.now(),
            from: userEmail,
            to: 'admin',
            content: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        
        const updatedMessages = [...allMessages, message];
        saveAllMessages(updatedMessages);
        setMessages([...messages, message]);
        setNewMessage('');
    };

    return (
        <section className="bg-gray-800/50 p-8 rounded-lg border border-red-500/30 h-full w-full max-w-4xl mx-auto flex flex-col" style={{maxHeight: '70vh'}}>
            <SectionHeader>Message Admin</SectionHeader>
            <div className="flex-grow bg-black/20 p-4 rounded-lg overflow-y-auto mb-4">
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.from === userEmail ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.from === userEmail ? 'bg-cyan-800' : 'bg-gray-700'}`}>
                                <p className="text-white">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.from === userEmail ? 'text-right' : 'text-left'} text-gray-400`}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No messages yet. Say hello!</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-3 bg-gray-900/70 border-2 border-red-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                />
                <NeonButton type="submit" color="red">
                    Send
                </NeonButton>
            </form>
        </section>
    );
};

export default MessageComponent;
