import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Send, Mic, MicOff, Bookmark, ThumbsUp, ThumbsDown,
  ExternalLink, Sparkles, RotateCcw, Headphones, Bot, Square,
  Maximize2, Minimize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askAssistant, askAssistantVoice, canRecordVoice } from '../../lib/assistantApi';
import { buildChatHistory } from '../../lib/chatHistory';
import { quickSuggestions } from '../../data/aiResponses';

let msgCounter = 0;
const genId = () => `msg_${++msgCounter}_${Date.now()}`;

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className={`typing-dot w-2 h-2 bg-gray-400 rounded-full animation-delay-${i * 100}`} />
      ))}
    </div>
  );
}

function MessageBubble({ msg, onSave, onRate, lang, t, variant = 'default', animate = true }) {
  const [rated, setRated] = useState(null);
  const [saved, setSaved] = useState(false);
  const { saveAnswer } = useApp();
  const stitch = variant === 'stitch';

  const handleSave = () => {
    saveAnswer({ id: msg.id, question: msg.question, answer: msg.content, links: msg.links });
    setSaved(true);
  };

  const handleRate = (rating) => {
    setRated(rating);
    onRate?.(msg.id, rating);
  };

  if (msg.role === 'user') {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className={`max-w-[85%] px-3 sm:px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            stitch
              ? 'bg-primary-container text-on-primary rounded-br-sm rtl:rounded-br-none rtl:rounded-bl-sm ml-4 rtl:ml-0 rtl:mr-4'
              : 'rounded-br-sm bg-gold text-white shadow-sm'
          }`}
        >
          {msg.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${lang === 'ar' ? 'justify-end' : 'justify-start'} gap-2`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          stitch ? 'bg-primary-container' : 'bg-gold-gradient shadow-gold'
        } ${lang === 'ar' ? 'order-last' : ''}`}
      >
        {stitch ? <Bot className="w-4 h-4 text-on-primary" /> : <Sparkles className="w-4 h-4 text-white" />}
      </div>

      <div className="max-w-[85%] space-y-2">
        <div
          className={`px-3 sm:px-4 py-3 rounded-2xl shadow-sm ${
            stitch
              ? 'bg-surface-container text-on-surface rounded-tr-none mr-4 rtl:mr-0 rtl:ml-4'
              : 'rounded-bl-sm bg-gray-100 text-gray-800'
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
            {msg.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className={`font-bold mt-2 mb-1 ${stitch ? 'text-on-surface' : 'text-gray-900'}`}>{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('- ') || line.match(/^[•·]/)) {
                return <p key={i} className="ml-2 flex gap-2"><span className="text-primary">•</span>{line.replace(/^[-•·]\s*/, '')}</p>;
              }
              if (line.match(/^\*\*\d+\./)) {
                return <p key={i} className={`font-semibold mt-1 ${stitch ? 'text-on-surface' : 'text-gray-800'}`}>{line.replace(/\*\*/g, '')}</p>;
              }
              return line ? <p key={i}>{line}</p> : <br key={i} />;
            })}
          </div>
          {msg.links && msg.links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 pt-3 border-t ${stitch ? 'border-outline-variant/20' : 'border-gray-200'}`}
            >
              <p className={`text-xs font-semibold mb-2 ${stitch ? 'text-on-surface-variant' : 'text-gray-500'}`}>
                {lang === 'ar' ? 'انتقل مباشرة' : 'Quick links'}
              </p>
              <motion.div className="flex flex-wrap gap-2">
                {msg.links.map((link, i) => {
                  const internal = link.url?.startsWith('/');
                  const className = stitch
                    ? 'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-surface-container-highest transition-colors border border-outline-variant/15'
                    : 'inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gold/10 text-gold-dark text-xs font-medium hover:bg-gold/20 transition-colors duration-200 border border-gold/20';
                  if (internal) {
                    return (
                      <Link key={i} to={link.url} className={className}>
                        {link.label}
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
          {msg.showHumanSupport && (
            <div className={`mt-3 pt-3 border-t ${stitch ? 'border-outline-variant/20' : 'border-gray-200'}`}>
              <Link
                to="/support"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  stitch
                    ? 'bg-surface-container text-primary hover:bg-surface-container-highest'
                    : 'bg-saudiGreen text-white hover:bg-saudiGreen-dark'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                {t('ai.humanSupport')}
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-1 flex-wrap">
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors duration-200 ${
              saved
                ? 'text-primary bg-primary/10'
                : stitch
                  ? 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            {saved ? t('common.saved') : t('ai.saveAnswer')}
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <span className={`text-xs ${stitch ? 'text-on-surface-variant' : 'text-gray-400'}`}>{t('ai.helpful')}</span>
            <button
              onClick={() => handleRate('up')}
              className={`p-1 rounded-lg transition-colors ${rated === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRate('down')}
              className={`p-1 rounded-lg transition-colors ${rated === 'down' ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const SCROLL_NEAR_BOTTOM_PX = 96;

export default function AIAssistant({ compact = false, variant = 'default', fullscreen = false }) {
  const { t } = useTranslation();
  const { language } = useApp();
  const lang = language;
  const [messages, setMessages] = useState([
    {
      id: genId(),
      role: 'ai',
      content: t('ai.greeting'),
      links: [],
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesScrollRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const messagesRef = useRef(messages);
  const sendMessageRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordMaxTimerRef = useRef(null);
  const voiceModeRef = useRef(canRecordVoice() ? 'record' : 'speech');

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollChatToBottom = useCallback((behavior = 'auto') => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < SCROLL_NEAR_BOTTOM_PX;
  }, []);

  useEffect(() => {
    if (stickToBottomRef.current) {
      scrollChatToBottom('auto');
    }
  }, [messages, scrollChatToBottom]);

  useEffect(() => {
    if (isTyping && stickToBottomRef.current) {
      scrollChatToBottom('auto');
    }
  }, [isTyping, scrollChatToBottom]);

  useEffect(() => {
    if (!canRecordVoice() && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      rec.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript?.trim();
        setIsListening(false);
        if (transcript) sendMessageRef.current?.(transcript);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    } else {
      setRecognition(null);
    }
  }, [lang]);

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (recordMaxTimerRef.current) {
      clearTimeout(recordMaxTimerRef.current);
      recordMaxTimerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        stopMediaStream();
      }
    }
    setIsRecording(false);
  }, [stopMediaStream]);

  useEffect(() => () => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {}
    }
    if (recordMaxTimerRef.current) {
      clearTimeout(recordMaxTimerRef.current);
    }
    stopMediaStream();
  }, [stopMediaStream]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el && !isRecording) {
        el.focus({ preventScroll: true });
      }
    });
  }, [isRecording]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const stopRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);
    focusInput();
  }, [focusInput]);

  const sendMessage = useCallback(async (text) => {
    const query = (text || input).trim();
    if (!query || isTyping) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const history = buildChatHistory(messagesRef.current);

    stickToBottomRef.current = true;
    const userMsg = { id: genId(), role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    focusInput();
    requestAnimationFrame(() => scrollChatToBottom('auto'));

    try {
      const server = await askAssistant(query, lang, history, controller.signal);

      if (server.reason === 'aborted') return;

      const fallbackAnswer = lang === 'ar'
        ? 'تعذر الاتصال بالمساعد الآن. جرّب لاحقاً أو تواصل مع الدعم.'
        : 'Could not reach the assistant right now. Try again later or contact support.';

      let answer = fallbackAnswer;
      let links = [];
      let showHumanSupport = true;

      if (server.ok) {
        answer = server.answer;
        links = server.links;
        showHumanSupport = server.showHumanSupport;
      } else if (server.reason === 'groq_not_configured') {
        answer = lang === 'ar'
          ? 'المساعد يحتاج مفتاح Groq. من لوحة التحكم: إدارة الموقع ← مفتاح API.'
          : 'Assistant needs a Groq API key. Admin → Site Settings → API key.';
      }

      setMessages((prev) => [...prev, {
        id: genId(),
        role: 'ai',
        question: query,
        content: answer,
        links,
        showHumanSupport,
      }]);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsTyping(false);
      focusInput();
    }
  }, [input, lang, isTyping, scrollChatToBottom, focusInput]);

  sendMessageRef.current = sendMessage;

  const sendVoiceNote = useCallback(async (blob) => {
    if (!blob?.size || isTyping) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const history = buildChatHistory(messagesRef.current);
    stickToBottomRef.current = true;
    setIsTyping(true);
    requestAnimationFrame(() => scrollChatToBottom('auto'));

    try {
      const server = await askAssistantVoice(blob, lang, history, controller.signal);
      if (server.reason === 'aborted') return;

      const fallbackAnswer = lang === 'ar'
        ? 'تعذر الاتصال بالمساعد الآن. جرّب لاحقاً أو تواصل مع الدعم.'
        : 'Could not reach the assistant right now. Try again later or contact support.';

      let userText = lang === 'ar' ? '(لم يُفهم الصوت)' : '(Voice not understood)';
      let answer = fallbackAnswer;
      let links = [];
      let showHumanSupport = true;

      if (server.reason === 'transcribe_failed') {
        userText = lang === 'ar' ? '🎤 (تسجيل صوتي)' : '🎤 (Voice note)';
        answer = lang === 'ar'
          ? 'لم أتمكن من فهم التسجيل. تحدث بوضوح 2–3 ثوانٍ بالعربية أو الإنجليزية، ثم أوقف التسجيل. يمكنك أيضاً كتابة سؤالك.'
          : 'I could not understand the recording. Speak clearly for 2–3 seconds, then stop. You can also type your question.';
        showHumanSupport = false;
      } else if (server.ok) {
        userText = server.transcript || userText;
        answer = server.answer;
        links = server.links;
        showHumanSupport = server.showHumanSupport;
      } else if (server.reason === 'groq_not_configured') {
        answer = lang === 'ar'
          ? 'المساعد يحتاج مفتاح Groq. من لوحة التحكم: إدارة الموقع ← مفتاح API.'
          : 'Assistant needs a Groq API key. Admin → Site Settings → API key.';
      }

      setMessages((prev) => [
        ...prev,
        { id: genId(), role: 'user', content: userText, fromVoice: true },
        {
          id: genId(),
          role: 'ai',
          question: userText,
          content: answer,
          links,
          showHumanSupport,
        },
      ]);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsTyping(false);
      focusInput();
    }
  }, [lang, isTyping, scrollChatToBottom, focusInput]);

  const startRecording = useCallback(async () => {
    if (isTyping || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        mediaRecorderRef.current = null;
        stopMediaStream();
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        setIsRecording(false);
        if (blob.size > 1500) sendVoiceNote(blob);
        else {
          setMessages((prev) => [...prev, {
            id: genId(),
            role: 'ai',
            content: lang === 'ar'
              ? 'التسجيل قصير جداً. تحدث 2–3 ثوانٍ على الأقل ثم اضغط الميكروفون لإيقاف التسجيل.'
              : 'Recording too short. Speak at least 2–3 seconds, then tap the mic to stop.',
            showHumanSupport: false,
          }]);
        }
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      recordMaxTimerRef.current = setTimeout(() => stopRecording(), 60000);
    } catch {
      stopMediaStream();
      setIsRecording(false);
    }
  }, [isTyping, isRecording, lang, sendVoiceNote, stopMediaStream, stopRecording]);

  const toggleVoice = () => {
    if (isTyping) return;
    if (voiceModeRef.current === 'record') {
      if (isRecording) stopRecording();
      else startRecording();
      return;
    }
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      recognition.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    stopRequest();
    stopRecording();
    setMessages([{
      id: genId(),
      role: 'ai',
      content: t('ai.greeting'),
      links: [],
    }]);
  };

  const suggestions = quickSuggestions[lang] || quickSuggestions.en;
  const stitch = variant === 'stitch';

  const shellClass = fullscreen
    ? 'flex flex-col h-full min-h-0 overflow-hidden bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-card border border-outline-variant/15'
    : stitch
      ? compact
        ? 'flex flex-col min-h-[480px] max-h-[78vh] bg-surface-container-lowest rounded-3xl shadow-card border border-outline-variant/15 overflow-hidden'
        : 'flex flex-col flex-1 min-h-0 h-full overflow-hidden'
      : `flex flex-col bg-white rounded-2xl shadow-card-hover border border-gray-100 overflow-hidden ${compact ? 'h-[500px]' : 'h-[620px]'}`;

  const headerActions = (
    <>
      {!fullscreen && (
        <Link
          to="/assistant"
          className="text-on-surface-variant hover:text-primary p-2 rounded-xl hover:bg-surface-container transition-colors"
          title={t('ai.fullscreen')}
          aria-label={t('ai.fullscreen')}
        >
          <Maximize2 className="w-4 h-4" />
        </Link>
      )}
      {fullscreen && (
        <Link
          to="/"
          className="text-on-surface-variant hover:text-primary p-2 rounded-xl hover:bg-surface-container transition-colors"
          title={t('ai.exitFullscreen')}
          aria-label={t('ai.exitFullscreen')}
        >
          <Minimize2 className="w-4 h-4" />
        </Link>
      )}
      <button
        type="button"
        onClick={clearChat}
        className="text-on-surface-variant hover:text-primary p-2 rounded-xl hover:bg-surface-container transition-colors"
        title={t('ai.clearChat')}
        aria-label={t('ai.clearChat')}
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className={shellClass}>
      {stitch ? (
        <div className={`flex items-center justify-between shrink-0 border-b border-outline-variant/15 ${fullscreen ? 'px-4 py-3' : 'px-1 mb-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary-container flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-on-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gold text-base leading-tight">{t('ai.title')}</h3>
              <p className="text-xs text-on-surface-variant">{t('ai.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {headerActions}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-950 to-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold animate-pulse-slow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t('ai.title')}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-[10px]">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {!fullscreen && (
              <Link
                to="/assistant"
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                title={t('ai.fullscreen')}
                aria-label={t('ai.fullscreen')}
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={clearChat}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
              title={t('ai.clearChat')}
              aria-label={t('ai.clearChat')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div
        ref={messagesScrollRef}
        onScroll={handleMessagesScroll}
        className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain [overflow-anchor:none] ${stitch ? 'px-3 sm:px-4 py-3' : 'p-4'}`}
      >
        <div className="flex flex-col justify-end min-h-full gap-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} lang={lang} t={t} variant={variant} animate={false} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stitch ? 'bg-primary-container' : 'bg-gold-gradient shadow-gold'}`}>
              {stitch ? <Bot className="w-4 h-4 text-on-primary" /> : <Sparkles className="w-4 h-4 text-white" />}
            </div>
            <div className={`rounded-2xl rounded-bl-sm ${stitch ? 'bg-surface-container' : 'bg-gray-100'}`}>
              <TypingIndicator />
            </div>
          </div>
        )}
        </div>
      </div>
      {messages.length <= 1 && (
        <div className={`shrink-0 px-3 sm:px-4 pb-2 ${stitch ? '' : 'px-4'}`}>
          <p className={`text-xs mb-2 ${stitch ? 'text-on-surface-variant' : 'text-gray-400'}`}>{t('ai.suggestions')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((s, i) => (
              <button
                type="button"
                key={i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => sendMessage(s)}
                className={
                  stitch
                    ? 'px-3 py-1.5 rounded-full bg-surface-container text-[10px] font-bold text-primary hover:bg-surface-container-highest transition-colors border border-outline-variant/10 text-start'
                    : 'px-3 py-1.5 rounded-lg bg-gold/10 text-gold-dark text-xs font-medium hover:bg-gold/20 transition-colors duration-200 border border-gold/20 text-start'
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`shrink-0 border-t border-outline-variant/15 ${fullscreen ? 'px-3 sm:px-4 py-3' : stitch ? 'py-3' : 'px-4 py-3 border-gray-100'}`}>
        <div
          className={`flex items-end gap-2 rounded-xl transition-all duration-200 px-3 py-2 ${
            stitch
              ? 'bg-surface-container border-none focus-within:ring-2 focus-within:ring-primary/20'
              : 'bg-gray-50 border border-gray-200 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20'
          }`}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? t('ai.recording') : isListening ? t('ai.listening') : isTyping ? t('ai.thinking') : t('ai.placeholder')}
            disabled={isRecording}
            readOnly={isListening}
            autoFocus
            rows={1}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className={`flex-1 bg-transparent resize-none outline-none text-sm max-h-24 leading-relaxed ${
              stitch ? 'text-on-surface placeholder-on-surface-variant/60' : 'text-gray-800 placeholder-gray-400'
            }`}
            style={{ height: 'auto', minHeight: '24px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
            }}
          />
          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleVoice}
              disabled={isTyping}
              title={isRecording ? t('ai.stopRecording') : t('ai.voiceNote')}
              aria-label={isRecording ? t('ai.stopRecording') : t('ai.voiceNote')}
              className={`p-1.5 rounded-lg transition-all duration-200 disabled:opacity-40 ${
                isRecording || isListening
                  ? 'bg-red-500 text-white pulse-ring'
                  : stitch
                    ? 'text-primary hover:bg-surface-container-highest'
                    : 'text-gray-400 hover:text-gold hover:bg-gold/10'
              }`}
            >
              {isRecording || isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            {isTyping ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={stopRequest}
                className={`p-1.5 rounded-lg text-white transition-colors ${
                  stitch ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                }`}
                title={t('ai.stop')}
                aria-label={t('ai.stop')}
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className={`p-1.5 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                  stitch ? 'bg-primary hover:bg-primary-container' : 'bg-gold hover:bg-gold-dark'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {stitch && !fullscreen && (
          <Link
            to="/support"
            className="mt-3 block w-full py-3 bg-surface-container text-primary font-bold rounded-xl text-xs text-center hover:bg-surface-container-highest transition-colors"
          >
            {t('stitch.connectHuman')}
          </Link>
        )}
        {stitch && fullscreen && (
          <Link
            to="/support"
            className="mt-2 block text-center text-xs font-semibold text-primary hover:underline"
          >
            {t('stitch.connectHuman')}
          </Link>
        )}
      </div>
    </div>
  );
}
