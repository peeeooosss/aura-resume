'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, Clock, MessageSquare, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { VoiceEngine, getVoiceEngine } from '@/lib/voice/VoiceEngine';
import type { InterviewQuestion } from '@/lib/types/interview';

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
  score?: number;
  feedback?: string;
  questionNumber?: number;
}

interface InterviewSessionProps {
  sessionId: string;
  targetRole: string;
  totalQuestions: number;
  firstQuestion: InterviewQuestion;
  onComplete: (sessionId: string) => void;
}

export function InterviewSession({
  sessionId,
  targetRole,
  totalQuestions,
  firstQuestion,
  onComplete,
}: InterviewSessionProps) {
  const [conversation, setConversation] = useState<ChatMessage[]>([
    { role: 'ai', content: firstQuestion.question, questionNumber: 1 }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [currentQ, setCurrentQ] = useState(1);
  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const voiceRef = useRef<VoiceEngine | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    voiceRef.current = getVoiceEngine();
    const engine = voiceRef.current;

    engine.on({
      onResult: (text) => {
        setAnswer((prev) => (prev ? prev + ' ' + text : text));
      },
      onListeningStart: () => setIsListening(true),
      onListeningEnd: () => setIsListening(false),
      onSpeakStart: () => setIsSpeaking(true),
      onSpeakEnd: () => setIsSpeaking(false),
      onError: (err) => {
        console.error('Voice error:', err);
        setIsListening(false);
        setIsSpeaking(false);
        setTextMode(true);
      },
    });

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    speakText(firstQuestion.question);

    return () => {
      engine.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  function scrollToBottom() {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function speakText(text: string) {
    const engine = voiceRef.current;
    if (engine && engine.isVoiceSupported && !textMode) {
      engine.speak(text);
    }
  }

  function toggleListening() {
    const engine = voiceRef.current;
    if (!engine) return;
    if (isListening) {
      engine.stopListening();
    } else {
      engine.startListening();
    }
  }

  function stopSpeaking() {
    voiceRef.current?.stopSpeaking();
  }

  async function submitAnswer() {
    if (!answer.trim() || isEvaluating) return;

    const engine = voiceRef.current;
    if (engine) {
      engine.stopListening();
      engine.stopSpeaking();
    }

    const userMessage: ChatMessage = { role: 'user', content: answer.trim() };
    setConversation((prev) => [...prev, userMessage]);
    setAnswer('');
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: userMessage.content }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

      const feedbackMsg: ChatMessage = {
        role: 'ai',
        content: data.evaluation.feedback,
        score: data.evaluation.score,
      };
      setConversation((prev) => [...prev, feedbackMsg]);

      if (data.isComplete) {
        setIsComplete(true);
        setTimeout(() => onComplete(sessionId), 2500);
      } else {
        setTimeout(() => {
          const nextQ = data.nextQuestion;
          setCurrentQuestion(nextQ);
          setCurrentQ((prev) => prev + 1);

          const nextMsg: ChatMessage = {
            role: 'ai',
            content: nextQ.question,
            questionNumber: currentQ + 1,
          };
          setConversation((prev) => [...prev, nextMsg]);
          speakText(nextQ.question);
        }, 2500);
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      setConversation((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-slate-800 rounded-full">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-surface-900 dark:text-white">
              {currentQ}/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-slate-800 rounded-full">
            <Clock className="w-4 h-4 text-surface-400" />
            <span className="text-sm text-surface-500 dark:text-slate-400">{formatTime(elapsedTime)}</span>
          </div>
          {isComplete && (
            <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
              Complete
            </span>
          )}
        </div>
        <button
          onClick={() => setTextMode(!textMode)}
          className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={textMode ? 'Switch to voice' : 'Switch to text'}
        >
          {textMode ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-4 space-y-4 min-h-0"
      >
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3 max-w-[90%]',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                msg.role === 'ai'
                  ? 'bg-indigo-500/10 border border-indigo-500/20'
                  : 'bg-emerald-500/10 border border-emerald-500/20'
              )}
            >
              {msg.role === 'ai' ? (
                <Bot className="w-4 h-4 text-indigo-400" />
              ) : (
                <User className="w-4 h-4 text-emerald-400" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'rounded-2xl px-4 py-3',
                msg.role === 'ai'
                  ? 'bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700'
                  : 'bg-indigo-600 text-white'
              )}
            >
              {msg.questionNumber && (
                <p className="text-xs font-semibold text-indigo-400 mb-1.5">
                  Question {msg.questionNumber}
                </p>
              )}

              <p
                className={cn(
                  'text-sm leading-relaxed',
                  msg.role === 'ai' ? 'text-surface-900 dark:text-white' : 'text-white'
                )}
              >
                {msg.content}
              </p>

              {msg.score !== undefined && (
                <div className="mt-2 pt-2 border-t border-surface-300 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        msg.score >= 70
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : msg.score >= 40
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      )}
                    >
                      {msg.score}/100
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Evaluating indicator */}
        {isEvaluating && (
          <div className="flex gap-3 mr-auto max-w-[90%]">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-sm text-surface-400 dark:text-slate-500">Evaluating...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete && (
        <div className="mt-4 flex-shrink-0">
          {textMode ? (
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-4">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                className="w-full bg-transparent text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none resize-none text-sm leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    submitAnswer();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-200 dark:border-slate-800">
                <span className="text-xs text-surface-400 dark:text-slate-500">
                  {answer.length} characters
                </span>
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || isEvaluating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleListening}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    isListening
                      ? 'bg-rose-500/20 border-2 border-rose-500/50 animate-pulse'
                      : 'bg-indigo-500/10 border-2 border-indigo-500/30 hover:bg-indigo-500/20'
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6 text-rose-400" />
                  ) : (
                    <Mic className="w-6 h-6 text-indigo-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {answer ? (
                    <p className="text-sm text-surface-900 dark:text-white truncate">{answer}</p>
                  ) : (
                    <p className="text-sm text-surface-400 dark:text-slate-500">
                      {isListening ? 'Listening...' : 'Tap mic to speak'}
                    </p>
                  )}
                </div>

                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || isEvaluating}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
