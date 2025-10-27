import React from "react";
import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-pink-600'
      } neon-glow`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      <Card className={`max-w-2xl p-4 ${
        isUser
          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
          : 'bg-slate-900/50 border-purple-900/30'
      }`}>
        {message.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={message.image_url} 
              alt="Generated" 
              className="w-full h-auto max-h-96 object-contain rounded-lg"
            />
          </div>
        )}
        <p className="text-white whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </Card>
    </motion.div>
  );
}
