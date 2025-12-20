'use client';

import { Plus, Mic, ArrowUp } from 'lucide-react';
import { useState } from 'react';

export default function ChatInput() {
  const [isPlusHovered, setIsPlusHovered] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);

  return (
    <div className="relative w-full mx-auto px-4">
      <div className="bg-[#141414] rounded-[28px] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shadow-2xl border border-[#444444]">
        {/* Plus Button */}
        <button 
          onMouseEnter={() => setIsPlusHovered(true)}
          onMouseLeave={() => setIsPlusHovered(false)}
          style={{
            transform: isPlusHovered ? 'scale(1.1) rotate(90deg)' : 'scale(1) rotate(0deg)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: isPlusHovered ? '#555555' : '#444444',
            boxShadow: isPlusHovered ? '0 4px 12px rgba(255, 255, 255, 0.1)' : 'none'
          }}
          className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] flex items-center justify-center active:scale-90"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Pregunta lo que quieras"
          className="flex-1 bg-transparent border-none outline-none text-[#9ca3af] placeholder:text-[#9ca3af] text-sm sm:text-base font-normal min-w-0"
        />

        {/* Botón mricroono */}
        <button 
          onMouseEnter={() => setIsMicHovered(true)}
          onMouseLeave={() => setIsMicHovered(false)}
          style={{
            transform: isMicHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: isMicHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
          className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-90"
        >
          <Mic 
            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            style={{
              transform: isMicHovered ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </button>

        {/* Enviar Botón */}
        <button 
          onMouseEnter={() => setIsSendHovered(true)}
          onMouseLeave={() => setIsSendHovered(false)}
          style={{
            transform: isSendHovered ? 'translateY(-3px) scale(1.05)' : 'translateY(0) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: isSendHovered ? '#f5f5f5' : '#ffffff',
            boxShadow: isSendHovered 
              ? '0 8px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 255, 255, 0.15)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] flex items-center justify-center active:translate-y-0 active:scale-95"
        >
          <ArrowUp 
            className="w-4 h-4 sm:w-5 sm:h-5 text-black"
            style={{
              transform: isSendHovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </button>
      </div>
    </div>
  );
}
