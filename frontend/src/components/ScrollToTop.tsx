'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, Move } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // 스크롤이 300px 이상일 때 버튼 표시
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 초기 체크
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    document.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      document.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // 초기 위치 설정 (우하단)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 80, // 오른쪽에서 80px
        y: window.innerHeight - 80  // 아래에서 80px
      });
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    const rect = document.querySelector('[data-scroll-button]')?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (isDragging) {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
      // 화면 경계 내에서만 이동
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      handleStart(e.clientX, e.clientY);
      e.preventDefault();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    e.preventDefault();
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed z-50 md:hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <button
        data-scroll-button
        onClick={scrollToTop}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="text-white rounded-full p-3 shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex flex-col items-center space-y-1 touch-manipulation"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minWidth: '48px',
          minHeight: '48px'
        }}
        aria-label="맨 위로 이동"
      >
        <ChevronUp className="w-5 h-5" />
        <Move className="w-3 h-3 opacity-60" data-drag-handle />
      </button>
    </div>
  );
}
