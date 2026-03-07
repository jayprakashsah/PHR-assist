import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, X, Minimize2, Maximize2, Mic, Shield, Heart, MapPin, Pill, AlertTriangle, Stethoscope } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
    { text: "What medications do I need to take today?", icon: Pill },
    { text: "Explain my cervical spine condition", icon: Stethoscope },
    { text: "When is my next appointment?", icon: Heart },
    { text: "Show me nearby hospitals", icon: MapPin },
    { text: "What should I do in an emergency?", icon: AlertTriangle },
];

// Smart mock responses based on the question context
function getMockResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('medication') || msg.includes('medicine') || msg.includes('take today')) {
        return "Based on your active prescriptions, you have the following medications today:\n\n💊 **Esonom** — Once a day, before food\n💊 **Wilmex** — Twice a day, after food\n💊 **Thiocos** — Twice a day, after food\n💊 **Neuron 50N forte** — Once a day, after evening meal\n\n3 days remaining for all medications. Would you like me to set a reminder?";
    }
    if (msg.includes('cervical') || msg.includes('spine') || msg.includes('neck')) {
        return "Your report from 31/7/2024 (B&B Hospital) shows: **Acute Cervical Spine Pain with Left-Sided Muscle Spasm and Stiffness**.\n\n📋 This condition involves:\n• Pain in the neck/cervical vertebrae region\n• Muscle spasm on the left side\n• Stiffness and limited range of motion\n\n⚠️ *This is a summary for informational purposes only. Always follow your doctor's prescribed treatment plan.*";
    }
    if (msg.includes('appointment') || msg.includes('next visit')) {
        return "📅 Based on your health records, your last appointment was on **31 July 2024** at B&B Hospital.\n\nYou currently have **3 upcoming appointments** scheduled. Would you like to:\n• View all appointments\n• Schedule a new one\n• Set a reminder for your next visit?";
    }
    if (msg.includes('hospital') || msg.includes('nearby') || msg.includes('location')) {
        return "🏥 I found hospitals near your current location:\n\n1. **S.V. Medical Centre** — 4.6 km away (Coimbatore)\n2. **Sri Venkateswara Hospital** — 4.7 km\n3. **City General Hospital** — 4.8 km\n\n⏱ Average wait time: ~15 minutes\n\nShall I open the Hospital Locator page for directions and real-time info?";
    }
    if (msg.includes('emergency') || msg.includes('sos') || msg.includes('help')) {
        return "🆘 **Emergency Guidance:**\n\n1. **Stay calm** and stay at your current location\n2. **Call 108** (Ambulance) or **112** (Emergency)\n3. Keep your phone **charged and nearby**\n4. Unlock your door for emergency services\n5. Have your **ID and medical info ready**\n\nYour emergency contact: **8877665544**\nYour blood type: **A+**\n\nFor immediate SOS dispatch, go to the Emergency page and press the red SOS button.";
    }
    if (msg.includes('health score') || msg.includes('score')) {
        return "💪 Your current health score is **85%** — up 5% from last month! Great progress!\n\n🏅 Achievements:\n• Health Champion (80% complete)\n• Regular Checkups (60% complete)\n• Emergency Ready (100% ✓)\n\nKeep up the good work! Would you like tips to improve your score further?";
    }
    if (msg.includes('blood') || msg.includes('blood type') || msg.includes('blood group')) {
        return "🩸 Your blood type is **A+** (A Positive).\n\nA+ is the second most common blood type. Donors compatible with A+: A+, A−, O+, O−\n\nThis information is stored in your emergency profile and shared with emergency services when you activate SOS.";
    }
    if (msg.includes('prescription') || msg.includes('reminder')) {
        return "💊 You have **4 active prescriptions** from your recent visit to B&B Hospital (31/7/2024):\n\n• **Esonom** (7 days, 3 remaining) — Before food\n• **Wilmex** (7 days, 3 remaining) — After food  \n• **Thiocos** (7 days, 3 remaining) — After food\n• **Neuron 50N forte** (7 days, 3 remaining) — After evening meal\n\nShall I navigate to your Reminders page for full details?";
    }
    const genericResponses = [
        "I'm your SmartPHR health assistant! I can help with:\n\n• 📋 Explaining your medical reports\n• 💊 Medication reminders and schedules\n• 🏥 Finding nearby hospitals\n• 🆘 Emergency guidance\n• 📅 Appointment information\n\nWhat would you like to know?",
        "That's a great question! Based on your health records, I'd recommend consulting with your primary physician for specific medical advice. Is there something specific about your reports or medications I can help clarify?",
        "I can see you have 6 health records and 12 prescriptions in your profile. Would you like me to help you understand a specific condition or medication from your history?",
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'ai',
            text: "👋 Hi! I'm your **SmartPHR Health Assistant**. I can help with your medications, explain medical reports, find hospitals, or guide you in emergencies!\n\nWhat can I do for you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showBadge, setShowBadge] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const userName = localStorage.getItem('userName') || 'there';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setShowBadge(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/chat', { message: text });
            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                text: response.data.reply || getMockResponse(text),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            // Graceful fallback to smart mock responses
            setTimeout(() => {
                const aiMsg = {
                    id: Date.now() + 1,
                    role: 'ai',
                    text: getMockResponse(text),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => [...prev, aiMsg]);
                setIsLoading(false);
            }, 800);
            return;
        }
        setIsLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestedQuestion = (text) => {
        sendMessage(text);
    };

    // Floating button (closed state)
    if (!isOpen) {
        return (
            <button id="smartphr-chat-btn" onClick={() => setIsOpen(true)} style={s.floatBtn}>
                <div style={s.floatBtnGlow} />
                <Bot size={28} color="#fff" />
                {showBadge && <span style={s.badge}>1</span>}
            </button>
        );
    }

    return (
        <div
            style={{
                ...s.window,
                height: isMinimized ? '62px' : '520px',
                width: isMinimized ? '280px' : '360px',
            }}
        >
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerLeft}>
                    <div style={s.headerAvatar}>
                        <Bot size={18} color="#9b59b6" />
                    </div>
                    <div>
                        <div style={s.headerTitle}>SmartPHR Health Assistant</div>
                        <div style={s.headerStatus}>
                            <span style={s.statusDot} /> Online
                        </div>
                    </div>
                </div>
                <div style={s.headerActions}>
                    <button onClick={() => setIsMinimized(!isMinimized)} style={s.headerBtn}>
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} style={s.headerBtn}>
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div style={s.messages}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    ...s.msgRow,
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {msg.role === 'ai' && (
                                    <div style={s.aiAvatar}>
                                        <Bot size={11} color="#9b59b6" />
                                    </div>
                                )}
                                <div style={{ maxWidth: '82%' }}>
                                    <div
                                        style={{
                                            ...s.bubble,
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #9b59b6, #8e44ad)'
                                                : '#f1f2f6',
                                            color: msg.role === 'user' ? '#fff' : '#2c3e50',
                                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '14px',
                                            borderBottomLeftRadius: msg.role === 'user' ? '14px' : '4px',
                                        }}
                                    >
                                        {msg.text.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                                                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                                                )}
                                                {i < msg.text.split('\n').length - 1 && <br />}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ ...s.timestamp, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
                                <div style={s.aiAvatar}>
                                    <Bot size={11} color="#9b59b6" />
                                </div>
                                <div style={{ ...s.bubble, background: '#f1f2f6', padding: '12px 16px' }}>
                                    <div style={s.typing}>
                                        <span style={s.dot} />
                                        <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                                        <span style={{ ...s.dot, animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Suggested questions (show after first AI message only) */}
                        {messages.length === 1 && !isLoading && (
                            <div style={s.suggestions}>
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button key={i} onClick={() => handleSuggestedQuestion(q.text)} style={s.suggBtn}>
                                        <q.icon size={12} color="#9b59b6" style={{ flexShrink: 0 }} />
                                        <span>{q.text}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} style={s.inputRow}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your health..."
                            style={s.input}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            style={{
                                ...s.sendBtn,
                                background: !input.trim() ? '#bdc3c7' : 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                            }}
                        >
                            <Send size={15} color="#fff" />
                        </button>
                    </form>

                    {/* Disclaimer */}
                    <div style={s.disclaimer}>
                        <Shield size={10} color="#95a5a6" />
                        <span>For informational purposes only. Not a substitute for professional medical advice.</span>
                    </div>
                </>
            )}

            <style>{`
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(155,89,182,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(155,89,182,0.6); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
        }
        #smartphr-chat-btn:hover { transform: scale(1.1) !important; }
      `}</style>
        </div>
    );
}

const s = {
    floatBtn: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(155,89,182,0.4)',
        zIndex: 9999,
        animation: 'chatPulse 3s ease-in-out infinite',
        transition: 'transform 0.2s ease',
    },
    floatBtnGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, rgba(155,89,182,0.4) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        animation: 'glowPulse 2s ease-in-out infinite',
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        background: '#e74c3c',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 'bold',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #fff',
    },
    window: {
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        zIndex: 9999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        border: '1.5px solid rgba(155,89,182,0.25)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #f8f9fa, #f0e6ff)',
        borderBottom: '1px solid #e8dcf5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    headerAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: 'rgba(155,89,182,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid rgba(155,89,182,0.3)',
    },
    headerTitle: { fontSize: '13px', fontWeight: '700', color: '#2c3e50', lineHeight: 1.2 },
    headerStatus: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        color: '#27ae60',
        marginTop: '2px',
    },
    statusDot: {
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#2ecc71',
    },
    headerActions: { display: 'flex', gap: '4px' },
    headerBtn: {
        width: '26px',
        height: '26px',
        borderRadius: '7px',
        background: 'rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.08)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7f8c8d',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        padding: '14px 14px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: '#fafbfc',
    },
    msgRow: { display: 'flex', alignItems: 'flex-start', gap: '6px' },
    aiAvatar: {
        width: '22px',
        height: '22px',
        borderRadius: '7px',
        background: 'rgba(155,89,182,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(155,89,182,0.25)',
        flexShrink: 0,
        marginTop: '2px',
    },
    bubble: {
        padding: '10px 13px',
        borderRadius: '14px',
        fontSize: '12.5px',
        lineHeight: 1.55,
        wordBreak: 'break-word',
    },
    timestamp: { fontSize: '10px', color: '#b2bec3', marginTop: '3px' },
    typing: { display: 'flex', gap: '4px', alignItems: 'center' },
    dot: {
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#9b59b6',
        animation: 'dotBounce 1.4s infinite ease-in-out',
    },
    suggestions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        marginTop: '4px',
    },
    suggBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '8px 12px',
        background: '#fff',
        border: '1px solid #e0d5f0',
        borderRadius: '20px',
        fontSize: '11.5px',
        color: '#34495e',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.2s',
    },
    inputRow: {
        display: 'flex',
        gap: '8px',
        padding: '10px 12px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        padding: '9px 13px',
        borderRadius: '20px',
        border: '1.5px solid #e0d5f0',
        fontSize: '12.5px',
        outline: 'none',
        background: '#fafbfc',
        transition: 'border-color 0.2s',
    },
    sendBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.2s',
    },
    disclaimer: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 14px',
        background: '#f8f9fa',
        borderTop: '1px solid #f0f0f0',
        fontSize: '9.5px',
        color: '#95a5a6',
        flexShrink: 0,
    },
};
