import React, { useState, useEffect } from 'react';
import type { Message } from '../types';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-blue-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-blue-500 after:shadow-[0_0_10px_theme(colors.blue.500)]">
        {children}
    </h2>
);

const InboxItem: React.FC<{ title: string; excerpt: string; time: string; isRead: boolean }> = ({ title, excerpt, time, isRead }) => (
    <div className={`p-4 border-l-4 ${isRead ? 'border-gray-700' : 'border-blue-500 bg-blue-500/10'} rounded-r-lg mb-4 transition-colors`}>
        <div className="flex justify-between items-center">
            <h3 className={`font-bold ${isRead ? 'text-gray-400' : 'text-white'}`}>{title}</h3>
            <span className="text-xs text-gray-500">{new Date(time).toLocaleString()}</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{excerpt}</p>
    </div>
);

interface InboxProps {
    userEmail: string;
}

const Inbox: React.FC<InboxProps> = ({ userEmail }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const allMessages: Message[] = JSON.parse(localStorage.getItem('messages') || '[]');
        const userMessages = allMessages
            .filter(msg => msg.to === userEmail && msg.from === 'admin')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setMessages(userMessages);
    }, [userEmail]);

    return (
        <section className="bg-gray-800/50 p-8 rounded-lg border border-blue-500/30 w-full max-w-4xl mx-auto">
        <SectionHeader>Inbox</SectionHeader>
        {messages.length > 0 ? (
            <div>
                {messages.map(msg => (
                    <InboxItem
                        key={msg.id}
                        title="Message from Admin"
                        excerpt={msg.content}
                        time={msg.timestamp}
                        isRead={msg.isRead}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-10">
                <p className="text-gray-400">Your inbox is empty. No messages from the admin yet.</p>
            </div>
        )}
        </section>
    );
};

export default Inbox;
