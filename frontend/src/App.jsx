import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Cpu, AlertCircle, Sun, Moon, Copy, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import gsap from 'gsap';

// --- Interactive GSAP Background Component ---
const AnimatedBackground = ({ theme }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.innerHTML = ''; 
    
    const numOrbs = 6;
    const orbs = [];
    const isDark = theme === 'dark';
    const color = isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)';
    
    for (let i = 0; i < numOrbs; i++) {
      const orb = document.createElement('div');
      orb.style.position = 'absolute';
      orb.style.width = '300px';
      orb.style.height = '300px';
      orb.style.borderRadius = '50%';
      orb.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;
      orb.style.filter = 'blur(60px)';
      gsap.set(orb, { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
      container.appendChild(orb);
      orbs.push(orb);
    }

    const floatAnimations = orbs.map((orb, i) => {
      return gsap.to(orb, {
        x: `+=${Math.random() * 250 - 125}`,
        y: `+=${Math.random() * 250 - 125}`,
        duration: 10 + i * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    const xSetters = orbs.map(orb => gsap.quickTo(orb, "x", { duration: 1.5, ease: "power3.out" }));
    const ySetters = orbs.map(orb => gsap.quickTo(orb, "y", { duration: 1.5, ease: "power3.out" }));
    let idleTimeout;

    const handleMouseMove = (e) => {
      clearTimeout(idleTimeout);
      floatAnimations.forEach(anim => anim.pause());
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      orbs.forEach((orb, i) => {
        const offsetX = (i % 2 === 0 ? 1 : -1) * (i * 45);
        const offsetY = (i % 3 === 0 ? 1 : -1) * (i * 35);
        xSetters[i](mouseX - 150 + offsetX); 
        ySetters[i](mouseY - 150 + offsetY);
      });

      idleTimeout = setTimeout(() => {
        orbs.forEach((orb, i) => {
           gsap.to(orb, {
            x: `+=${Math.random() * 200 - 100}`,
            y: `+=${Math.random() * 200 - 100}`,
            duration: 12 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            overwrite: "auto"
          });
        });
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimeout);
      floatAnimations.forEach(anim => anim.kill());
      gsap.killTweensOf(orbs);
    };
  }, [theme]); 

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />;
};

// --- Simulated Telemetry Log Component ---
const TelemetryLog = ({ theme }) => {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  const simulationSteps = [
    "Initializing LangChain Multi-Agent Pipeline...",
    "Booting SearchAgent: Online and listening.",
    "Querying global databases and academic journals...",
    "Scraping content from top 14 verified sources...",
    "Parsing raw HTML and extracting text nodes...",
    "Booting SynthesisAgent: Online.",
    "Cross-referencing data points for factual consistency...",
    "Evaluating source bias and credibility...",
    "Drafting preliminary findings...",
    "Booting FormattingAgent: Online.",
    "Structuring data into markdown tables and headers...",
    "Finalizing comprehensive report payload..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId;

    const addNextLog = () => {
      if (currentIndex < simulationSteps.length) {
        setLogs(prev => [...prev, `> ${simulationSteps[currentIndex]}`]);
        currentIndex++;
        // Randomize the delay to make it feel like real computing work (800ms to 2500ms)
        const nextDelay = Math.floor(Math.random() * 1700) + 800;
        timeoutId = setTimeout(addNextLog, nextDelay);
      }
    };

    // Start simulation
    timeoutId = setTimeout(addNextLog, 600);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        width: '100%',
        backgroundColor: theme === 'dark' ? '#050505' : '#f1f5f9',
        border: `1px solid ${theme === 'dark' ? '#2A2A2A' : '#cbd5e1'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: '"Fira Code", monospace',
        fontSize: '0.85rem',
        color: theme === 'dark' ? '#10b981' : '#059669', // Matrix green vibe
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '160px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme === 'dark' ? '#888' : '#64748b', borderBottom: `1px solid ${theme === 'dark' ? '#222' : '#e2e8f0'}`, paddingBottom: '8px', marginBottom: '4px' }}>
        <Activity size={14} />
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Agent Telemetry Stream</span>
      </div>
      {logs.map((log, index) => (
        <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          {log}
        </motion.div>
      ))}
      {/* Blinking cursor */}
      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
        _
      </motion.div>
      <div ref={logEndRef} />
    </motion.div>
  );
};

// --- Main Application Component ---
export default function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [focusedInput, setFocusedInput] = useState(false);
  const messagesEndRef = useRef(null);

  const theme = isDark ? themes.dark : themes.light;

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
    document.body.style.transition = "background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, theme.bg]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResearchSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await res.json();
      let finalContent = data.result;
      
      if (typeof finalContent === 'object' && finalContent !== null) {
         finalContent = finalContent.report || finalContent.output || finalContent.text || JSON.stringify(finalContent, null, 2);
      }

      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, role: 'agent', content: String(finalContent) }
      ]);
      
    } catch (error) {
      console.error("Connection error:", error);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, role: 'error', content: "Failed to connect to the backend. Ensure uvicorn is running on port 8000." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bg }}>
      <AnimatedBackground theme={isDark ? 'dark' : 'light'} />
      
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4, damping: 25 }}
        style={{ ...styles.chatBox, backgroundColor: theme.chatBg, borderColor: theme.border, position: 'relative' }}
      >
        <motion.div
          style={{
            position: 'absolute', inset: 0, borderRadius: '16px', padding: '1px',
            background: `linear-gradient(135deg, ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}, ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'})`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none',
            opacity: isDark ? 0.6 : 0.3,
          }}
          animate={{ opacity: isDark ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Header */}
        <motion.div 
          style={{ ...styles.header, backgroundColor: theme.headerBg, borderColor: theme.border, position: 'relative', zIndex: 2 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex', alignItems: 'center' }}>
            <Terminal size={22} color={theme.icon} />
          </motion.div>
          <motion.h1 style={{ ...styles.headerTitle, color: theme.text }} animate={{ letterSpacing: ['0.3px', '1px', '0.3px'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            Synagent Terminal
          </motion.h1>
          <div style={styles.headerControls}>
            <motion.div 
              style={styles.statusDot(isLoading)}
              animate={{ boxShadow: isLoading ? ['0 0 12px #eab308', '0 0 24px #eab308', '0 0 12px #eab308'] : ['0 0 12px #22c55e', '0 0 20px #22c55e', '0 0 12px #22c55e'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.button 
              onClick={() => setIsDark(!isDark)} style={{ ...styles.iconButton, color: theme.text }}
              whileHover={{ scale: 1.15, rotate: 180 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </div>
        </motion.div>
        
        {/* Chat Area */}
        <div style={{ ...styles.responseArea, position: 'relative', zIndex: 1 }}>
          {messages.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, type: 'spring' }} style={{ ...styles.emptyState, color: theme.subText }}>
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <Cpu size={56} color={theme.border} style={{ marginBottom: '20px' }} />
              </motion.div>
              <motion.p animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                System initialized. Awaiting multi-agent deployment.
              </motion.p>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50, scale: 0.8, rotateX: 90 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, x: msg.role === 'user' ? 50 : -50, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index === messages.length - 1 ? 0.05 : 0 }}
                style={{ ...styles.messageWrapper, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', perspective: '1000px' }}
              >
                <motion.div 
                  style={styles.bubble(msg.role, theme)}
                  whileHover={{ scale: 1, boxShadow: msg.role === 'agent' ? `0 10px 40px ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)'}` : 'none' }}
                >
                  {msg.role === 'error' && (
                    <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }} style={{ display: 'inline-block', marginRight: '8px' }}>
                      <AlertCircle size={16} />
                    </motion.div>
                  )}
                  {msg.role === 'agent' ? (
                    <motion.div className="markdown-body" style={{ color: theme.text }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </motion.div>
                  ) : (
                    msg.content
                  )}
                  {msg.role === 'agent' && (
                    <motion.button 
                      onClick={() => handleCopy(msg.id, msg.content)} style={{ ...styles.copyButton, color: theme.subText, backgroundColor: theme.headerBg }}
                      whileHover={{ scale: 1.2, rotate: 180 }} whileTap={{ scale: 0.85 }}
                    >
                      <motion.div animate={copiedId === msg.id ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                        {copiedId === msg.id ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} />}
                      </motion.div>
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            ))}
            
            {/* The Telemetry Component replaces the generic loading dots */}
            {isLoading && (
              <motion.div 
                key="telemetry-wrapper"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
                style={{ width: '100%', maxWidth: '85%', alignSelf: 'flex-start' }}
              >
                <TelemetryLog theme={isDark ? 'dark' : 'light'} />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <motion.form 
          onSubmit={handleResearchSubmit} 
          style={{ ...styles.form, backgroundColor: theme.headerBg, borderColor: theme.border, position: 'relative', zIndex: 2 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <motion.div 
            style={{ ...styles.inputContainer, backgroundColor: theme.inputBg, borderColor: theme.border, position: 'relative' }}
            animate={{ borderColor: focusedInput ? (isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)') : theme.border, boxShadow: focusedInput ? `0 0 20px ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)'}` : '0 0 0px rgba(59, 130, 246, 0)' }}
            transition={{ duration: 0.3 }}
          >
            {focusedInput && (
              <motion.div style={{ position: 'absolute', inset: -1, borderRadius: '12px', background: `linear-gradient(135deg, ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)'}, ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'})`, pointerEvents: 'none', zIndex: -1 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} />
            )}
            <motion.div animate={{ scale: focusedInput ? 1.1 : 1, x: focusedInput ? 4 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
              <Sparkles size={16} color={theme.icon} />
            </motion.div>
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onFocus={() => setFocusedInput(true)} onBlur={() => setFocusedInput(false)} placeholder="Initialize research parameters..." style={{ ...styles.input, color: theme.text }} disabled={isLoading} />
            <motion.button 
              type="submit" disabled={isLoading || !prompt.trim()} style={styles.button(isLoading || !prompt.trim(), theme)}
              whileHover={(isLoading || !prompt.trim()) ? {} : { scale: 1.1, boxShadow: `0 0 20px ${isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}` }}
              whileTap={(isLoading || !prompt.trim()) ? {} : { scale: 0.9 }}
            >
              <motion.div animate={{ x: isLoading ? [0, 5, -5, 0] : 0 }} transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}><Send size={18} /></motion.div>
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}

// --- Theme Configurations ---
const themes = {
  dark: { bg: '#0a0e27', chatBg: '#0f1427', headerBg: '#1a1f3a', border: '#2d3561', text: '#f0f4f8', subText: '#8892b0', icon: '#8892b0', userBubble: '#1e3a8a', userText: '#f0f4f8', agentBubble: '#1a1f3a', inputBg: '#0a0e27', btnActiveBg: '#3b82f6', btnActiveText: '#ffffff', btnDisabledBg: '#1a1f3a' },
  light: { bg: '#f8fafc', chatBg: '#ffffff', headerBg: '#f1f5f9', border: '#cbd5e1', text: '#0f172a', subText: '#475569', icon: '#64748b', userBubble: '#3b82f6', userText: '#ffffff', agentBubble: '#f1f5f9', inputBg: '#f8fafc', btnActiveBg: '#3b82f6', btnActiveText: '#ffffff', btnDisabledBg: '#e2e8f0' }
};

// --- Static Styling ---
const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', padding: '20px', boxSizing: 'border-box' },
  chatBox: { width: '100%', maxWidth: '950px', borderRadius: '20px', borderStyle: 'solid', borderWidth: '1px', boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.4), 0 0 30px -5px rgba(59, 130, 246, 0.1)', display: 'flex', flexDirection: 'column', height: '88vh', overflow: 'hidden', backdropFilter: 'blur(10px)' },
  header: { display: 'flex', alignItems: 'center', padding: '20px 28px', borderBottomStyle: 'solid', borderBottomWidth: '1px', zIndex: 10, backdropFilter: 'blur(5px)' },
  headerTitle: { margin: '0 0 0 16px', fontSize: '1.15rem', fontWeight: '700', letterSpacing: '0.5px', flex: 1, background: 'linear-gradient(135deg, currentColor 0%, currentColor 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  headerControls: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  statusDot: (isLoading) => ({ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isLoading ? '#f59e0b' : '#10b981', transition: 'all 0.5s ease' }),
  responseArea: { flex: 1, padding: '32px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', scrollBehavior: 'smooth' },
  emptyState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '500' },
  messageWrapper: { display: 'flex', width: '100%' },
  bubble: (role, theme) => ({ position: 'relative', maxWidth: '100%', padding: '14px 18px', borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: role === 'user' ? theme.userBubble : role === 'error' ? 'rgba(239, 68, 68, 0.1)' : theme.agentBubble, color: role === 'user' ? theme.userText : role === 'error' ? '#ef4444' : theme.text, fontSize: '0.95rem', lineHeight: '1.6', border: role === 'agent' ? `1px solid ${theme.border}` : role === 'user' ? 'none' : `1px solid ${theme.border}`, backdropFilter: 'blur(5px)' }),
  copyButton: { position: 'absolute', top: '-14px', right: '-14px', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  form: { padding: '20px 28px', borderTopStyle: 'solid', borderTopWidth: '1px', backdropFilter: 'blur(5px)' },
  inputContainer: { display: 'flex', alignItems: 'center', borderStyle: 'solid', borderWidth: '1px', borderRadius: '14px', padding: '10px 4px', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', backdropFilter: 'blur(5px)' },
  input: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '12px 16px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' },
  button: (disabled, theme) => ({ backgroundColor: disabled ? theme.btnDisabledBg : theme.btnActiveBg, color: disabled ? theme.subText : theme.btnActiveText, border: 'none', borderRadius: '10px', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', marginRight: '4px' })
};