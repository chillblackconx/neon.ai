import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatSidebar({ chats, selectedChatId, onSelectChat, onNewChat, isLoading, title = "Conversations" }) {
  return (
    <div className="w-80 border-r border-purple-900/30 bg-slate-950/50 backdrop-blur-xl overflow-y-auto">
      <div className="p-4 border-b border-purple-900/30 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-10">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 neon-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau chat
        </Button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          {title}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card
                    onClick={() => onSelectChat(chat.id)}
                    className={`p-3 cursor-pointer transition-all duration-300 ${
                      selectedChatId === chat.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50 neon-border"
                        : "bg-slate-900/30 border-purple-900/20 hover:border-purple-500/30 hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        selectedChatId === chat.id ? "text-cyan-400" : "text-gray-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate ${
                          selectedChatId === chat.id ? "text-cyan-300" : "text-white"
                        }`}>
                          {chat.title}
                        </h4>
                        {chat.last_message && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {chat.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {!isLoading && chats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune conversation
          </div>
        )}
      </div>
    </div>
  );
}
