import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ chatId, chatType }) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => base44.entities.Message.filter({ chat_id: chatId }, 'created_date'),
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const userMessage = await base44.entities.Message.create({
        chat_id: chatId,
        role: 'user',
        content: content
      });

      setIsProcessing(true);

      let assistantResponse;
      let imageUrl = null;

      if (chatType === 'image') {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: content
        });
        imageUrl = result.url;
        assistantResponse = `Image générée avec succès !`;
      } else if (chatType === 'search') {
        // Pour la recherche, on construit un prompt avec contexte
        let contextPrompt = content;
        if (messages.length > 0) {
          const recentMessages = messages.slice(-6);
          const conversationHistory = recentMessages
            .map(m => `${m.role === 'user' ? 'Utilisateur' : 'IA'}: ${m.content}`)
            .join('\n');
          contextPrompt = `Historique de la conversation:\n${conversationHistory}\n\nNouvelle question: ${content}`;
        }
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: contextPrompt,
          add_context_from_internet: true
        });
        assistantResponse = result;
      } else {
        // Pour le chat normal, on construit un prompt avec tout l'historique
        let fullPrompt = content;
        if (messages.length > 0) {
          const recentMessages = messages.slice(-10);
          const conversationHistory = recentMessages
            .map(m => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`)
            .join('\n');
          fullPrompt = `Tu es Neon IA, un assistant intelligent et utile. Voici l'historique de notre conversation:\n\n${conversationHistory}\n\nUtilisateur: ${content}\n\nAssistant:`;
        } else {
          fullPrompt = `Tu es Neon IA, un assistant intelligent et utile. Réponds de manière claire et détaillée.\n\nUtilisateur: ${content}\n\nAssistant:`;
        }
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          add_context_from_internet: false
        });
        assistantResponse = result;
      }

      const aiMessage = await base44.entities.Message.create({
        chat_id: chatId,
        role: 'assistant',
        content: assistantResponse,
        image_url: imageUrl
      });

      await base44.entities.Chat.update(chatId, {
        last_message: content.substring(0, 50)
      });

      return { userMessage, aiMessage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setIsProcessing(false);
      setInput("");
    },
    onError: () => {
      setIsProcessing(false);
    }
  });

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      sendMessageMutation.mutate(input.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPlaceholder = () => {
    if (chatType === 'image') return "Décrivez l'image que vous voulez générer...";
    if (chatType === 'search') return "Posez votre question pour rechercher sur internet...";
    return "Tapez votre message...";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950/50 to-purple-950/20">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {chatType === 'image' && "Générateur d'Images IA"}
                {chatType === 'search' && "Recherche IA"}
                {chatType === 'assistant' && "Assistant IA"}
              </h3>
              <p className="text-gray-400">
                {chatType === 'image' && "Décrivez l'image que vous souhaitez créer"}
                {chatType === 'search' && "Posez une question pour rechercher sur internet"}
                {chatType === 'assistant' && "Commencez une conversation - Je me souviendrai de tout !"}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-cyan-400"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {chatType === 'image' ? "Génération de l'image..." : "IA en train de répondre..."}
            </span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-purple-900/30 p-4 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={isProcessing}
            className="min-h-[60px] max-h-32 bg-slate-900/50 border-purple-900/30 text-white placeholder:text-gray-500 focus:border-cyan-500/50 resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 neon-glow"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
