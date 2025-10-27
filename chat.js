import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";

export default function ChatIA() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const queryClient = useQueryClient();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-updated_date'),
    initialData: [],
  });

  const assistantChats = chats.filter(chat => chat.type === 'assistant');

  const createChatMutation = useMutation({
    mutationFn: async () => {
      const chat = await base44.entities.Chat.create({
        title: `Conversation ${assistantChats.length + 1}`,
        type: 'assistant',
        last_message: ''
      });
      return chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSelectedChatId(chat.id);
    },
  });

  const selectedChat = assistantChats.find(chat => chat.id === selectedChatId) || assistantChats[0];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatSidebar
        chats={assistantChats}
        selectedChatId={selectedChat?.id}
        onSelectChat={setSelectedChatId}
        onNewChat={() => createChatMutation.mutate()}
        isLoading={isLoading}
      />
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow chatId={selectedChat.id} chatType="assistant" />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Créez une nouvelle conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
}
