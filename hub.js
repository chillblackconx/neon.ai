import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Image, Search, Sparkles, Zap, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function Hub() {
  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-updated_date', 10),
    initialData: [],
  });

  const features = [
    {
      title: "Chat IA",
      description: "Conversations intelligentes avec l'IA",
      icon: MessageSquare,
      color: "from-cyan-500 to-blue-600",
      path: "ChatIA",
      stats: `${chats.filter(c => c.type === 'assistant').length} conversations`
    },
    {
      title: "Générateur d'Images",
      description: "Créez des images uniques avec l'IA",
      icon: Image,
      color: "from-purple-500 to-pink-600",
      path: "ImageGenerator",
      stats: `${chats.filter(c => c.type === 'image').length} images créées`
    },
    {
      title: "Générateur de Vidéos",
      description: "Créez des vidéos avec l'IA",
      icon: Video,
      color: "from-orange-500 to-red-600",
      path: "VideoGenerator",
      stats: `${chats.filter(c => c.type === 'video').length} vidéos créées`
    },
    {
      title: "Recherche IA",
      description: "Recherchez sur internet avec l'IA",
      icon: Search,
      color: "from-pink-500 to-rose-600",
      path: "SearchAI",
      stats: `${chats.filter(c => c.type === 'search').length} recherches`
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-cyan-400 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text neon-text">
              Neon IA
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Votre assistant IA tout-en-un pour générer, créer et découvrir
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(feature.path)}>
                <Card className="bg-slate-900/50 border-purple-900/30 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer neon-border backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 neon-glow`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">
                      {feature.description}
                    </p>
                    <div className="text-cyan-400 text-xs font-medium">
                      {feature.stats}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 neon-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Fonctionnalités</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
              <div>
                <h4 className="font-semibold text-white">Génération d'images</h4>
                <p className="text-gray-400 text-sm">Créez des images uniques avec des prompts détaillés</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-2"></div>
              <div>
                <h4 className="font-semibold text-white">Génération de vidéos</h4>
                <p className="text-gray-400 text-sm">Transformez vos idées en vidéos animées</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
              <div>
                <h4 className="font-semibold text-white">Recherche intelligente</h4>
                <p className="text-gray-400 text-sm">Obtenez des informations depuis internet</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-400 mt-2"></div>
              <div>
                <h4 className="font-semibold text-white">Mémoire contextuelle</h4>
                <p className="text-gray-400 text-sm">L'IA se souvient de toute votre conversation</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
