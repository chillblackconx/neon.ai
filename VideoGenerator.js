import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Video, Send, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatSidebar from "../components/chat/ChatSidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoGenerator() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-updated_date'),
    initialData: [],
  });

  const videoChats = chats.filter(chat => chat.type === 'video');

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () => selectedChatId ? base44.entities.Message.filter({ chat_id: selectedChatId }, 'created_date') : [],
    initialData: [],
    enabled: !!selectedChatId,
  });

  const createChatMutation = useMutation({
    mutationFn: async () => {
      const chat = await base44.entities.Chat.create({
        title: `Vidéo ${videoChats.length + 1}`,
        type: 'video',
        last_message: ''
      });
      return chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSelectedChatId(chat.id);
    },
  });

  const generateVideoMutation = useMutation({
    mutationFn: async (prompt) => {
      await base44.entities.Message.create({
        chat_id: selectedChatId,
        role: 'user',
        content: prompt
      });

      setIsProcessing(true);

      // Générer une série d'images pour créer une vidéo
      const images = [];
      const frames = 4; // 4 images pour la séquence
      
      for (let i = 0; i < frames; i++) {
        const framePrompt = `${prompt}, frame ${i + 1} of ${frames}, cinematic sequence, high quality`;
        const result = await base44.integrations.Core.GenerateImage({
          prompt: framePrompt
        });
        images.push(result.url);
      }

      // Créer un message avec toutes les images
      const videoMessage = `Vidéo générée avec ${frames} images ! Voici la séquence :`;
      
      await base44.entities.Message.create({
        chat_id: selectedChatId,
        role: 'assistant',
        content: videoMessage,
        video_url: JSON.stringify(images) // Stocker les URLs des images comme une "vidéo"
      });

      await base44.entities.Chat.update(selectedChatId, {
        last_message: prompt.substring(0, 50)
      });

      return images;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setIsProcessing(false);
      setInput("");
    },
    onError: () => {
      setIsProcessing(false);
    }
  });

  const handleGenerate = () => {
    if (input.trim() && !isProcessing && selectedChatId) {
      generateVideoMutation.mutate(input.trim());
    }
  };

  const selectedChat = videoChats.find(chat => chat.id === selectedChatId) || videoChats[0];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatSidebar
        chats={videoChats}
        selectedChatId={selectedChat?.id}
        onSelectChat={setSelectedChatId}
        onNewChat={() => createChatMutation.mutate()}
        isLoading={isLoading}
        title="Vidéos"
      />

      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950/50 to-purple-950/20">
        {!selectedChat ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Créez une nouvelle génération pour commencer
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <Alert className="bg-orange-500/10 border-orange-500/30">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-orange-300">
                  Note : La génération vidéo crée une séquence de 4 images animées. Le processus prend environ 20-30 secondes.
                </AlertDescription>
              </Alert>

              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <Video className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Générateur de Vidéos IA
                    </h3>
                    <p className="text-gray-400">
                      Décrivez la vidéo que vous souhaitez créer
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                        : 'bg-gradient-to-br from-orange-500 to-red-600'
                    } neon-glow`}>
                      {message.role === 'user' ? 
                        <span className="text-white font-bold">U</span> : 
                        <Video className="w-5 h-5 text-white" />
                      }
                    </div>

                    <Card className={`max-w-3xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
                        : 'bg-slate-900/50 border-orange-500/30'
                    }`}>
                      {message.video_url && (
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          {JSON.parse(message.video_url).map((url, index) => (
                            <div key={index} className="rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Frame ${index + 1}`}
                                className="w-full h-auto"
                              />
                              <p className="text-xs text-gray-400 mt-1 text-center">Frame {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-white whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-orange-400"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Génération de la vidéo en cours... Cela peut prendre jusqu'à 30 secondes</span>
                </motion.div>
              )}
            </div>

            <div className="border-t border-purple-900/30 p-4 bg-slate-950/50 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Décrivez la vidéo que vous voulez générer..."
                  disabled={isProcessing}
                  className="min-h-[60px] max-h-32 bg-slate-900/50 border-purple-900/30 text-white placeholder:text-gray-500 focus:border-orange-500/50 resize-none"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!input.trim() || isProcessing}
                  className="px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 neon-glow"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
