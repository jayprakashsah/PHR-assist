import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, User, Bot, Sparkles, Heart, Shield, 
  MessageCircle, Mic, Paperclip, Smile, MoreVertical, 
  Stethoscope, Pill, Brain, Zap, Droplets,
  ChevronRight, ChevronLeft, Clock, Calendar, Bell,
  Settings, LogOut, HelpCircle, X
} from 'lucide-react';
import '../App.css';

function ChatAgent() {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      role: 'ai', 
      text: "Hello! I'm your SmartPHR Health Agent. I can help you understand your medical reports, check symptoms, or give lifestyle advice. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1024) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { 
      id: Date.now(),
      role: 'user', 
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: userMessage.text
      });

      const aiReply = { 
        id: Date.now() + 1,
        role: 'ai', 
        text: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiReply]);
      
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1,
        role: 'ai', 
        text: "⚠️ I'm sorry, I'm having trouble connecting to the server. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    { text: "What do my blood test results mean?", icon: Droplets },
    { text: "Symptoms of diabetes?", icon: Activity },
    { text: "Healthy diet tips", icon: Heart },
    { text: "Medication reminders", icon: Pill }
  ];

  const quickActions = [
    { icon: Calendar, label: "Schedule", color: "#3498db" },
    { icon: Bell, label: "Reminder", color: "#e74c3c" },
    { icon: Heart, label: "Health Score", color: "#2ecc71" },
    { icon: HelpCircle, label: "Help", color: "#9b59b6" }
  ];

  const recentTopics = [
    "Blood Pressure",
    "Diabetes Management",
    "Nutrition Guide",
    "Exercise Tips"
  ];

  return (
    <div style={styles.container}>
      {/* Main Chat Container */}
      <div style={{
        ...styles.chatContainer,
        width: windowWidth <= 768 ? '100%' : '1200px',
        height: windowWidth <= 768 ? '100vh' : '90vh',
        borderRadius: windowWidth <= 768 ? '0' : '24px',
      }}>
        
        {/* Sidebar */}
        {showSidebar && (
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <div style={styles.logo}>
                <Bot size={28} color="#9b59b6" />
                <span style={styles.logoText}>Smart<span style={{ color: '#9b59b6' }}>PHR</span></span>
              </div>
              <button style={styles.sidebarClose} onClick={() => setShowSidebar(false)}>
                <ChevronLeft size={20} color="#7f8c8d" />
              </button>
            </div>

            <div style={styles.userProfile}>
              <div style={styles.userAvatar}>
                <User size={24} color="#ffffff" />
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>Guest User</span>
                <span style={styles.userStatus}>Free Plan</span>
              </div>
            </div>

            <div style={styles.quickActions}>
              <h4 style={styles.sidebarTitle}>Quick Actions</h4>
              <div style={styles.actionGrid}>
                {quickActions.map((action, index) => (
                  <button key={index} style={styles.actionButton}>
                    <div style={{ ...styles.actionIcon, backgroundColor: `${action.color}20` }}>
                      <action.icon size={18} color={action.color} />
                    </div>
                    <span style={styles.actionLabel}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.recentTopics}>
              <h4 style={styles.sidebarTitle}>Recent Topics</h4>
              {recentTopics.map((topic, index) => (
                <div key={index} style={styles.topicItem}>
                  <ChevronRight size={14} color="#9b59b6" />
                  <span style={styles.topicText}>{topic}</span>
                </div>
              ))}
            </div>

            <div style={styles.sidebarFooter}>
              <button style={styles.footerButton}>
                <Settings size={16} color="#7f8c8d" />
                <span>Settings</span>
              </button>
              <button style={{ ...styles.footerButton, color: '#e74c3c' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div style={styles.mainArea}>
          
          {/* Chat Header */}
          <div style={styles.chatHeader}>
            <div style={styles.headerLeft}>
              {windowWidth <= 1024 && (
                <button 
                  onClick={() => setShowSidebar(!showSidebar)}
                  style={styles.menuButton}
                >
                  <ChevronRight size={20} color="#9b59b6" />
                </button>
              )}
              <div style={styles.headerInfo}>
                <div style={styles.headerAvatar}>
                  <Bot size={20} color="#9b59b6" />
                </div>
                <div>
                  <h2 style={styles.headerTitle}>AI Health Assistant</h2>
                  <div style={styles.headerStatus}>
                    <span style={styles.statusDot}></span>
                    <span>Online • Ready to help</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.headerRight}>
              <button style={styles.headerButton}>
                <MoreVertical size={20} color="#7f8c8d" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={styles.messagesArea}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{
                  ...styles.messageWrapper,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'ai' && (
                  <div style={styles.messageAvatar}>
                    <Bot size={14} color="#9b59b6" />
                  </div>
                )}

                <div style={{ maxWidth: '70%' }}>
                  <div style={{ 
                    ...styles.messageBubble,
                    backgroundColor: msg.role === 'user' ? '#9b59b6' : '#f0f2f5',
                    color: msg.role === 'user' ? '#ffffff' : '#1a1a1a',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                  }}>
                    <div style={styles.messageText}>{msg.text}</div>
                  </div>
                  <div style={{
                    ...styles.messageTime,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={styles.userMessageAvatar}>
                    <User size={14} color="#ffffff" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div style={styles.loadingWrapper}>
                <div style={styles.loadingAvatar}>
                  <Bot size={14} color="#9b59b6" />
                </div>
                <div style={styles.loadingBubble}>
                  <div style={styles.typingIndicator}>
                    <span style={styles.typingDot}></span>
                    <span style={{...styles.typingDot, animationDelay: '0.2s'}}></span>
                    <span style={{...styles.typingDot, animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Suggested Questions */}
            {messages.length === 1 && !isLoading && (
              <div style={styles.suggestedContainer}>
                <p style={styles.suggestedTitle}>Suggested questions:</p>
                <div style={styles.suggestedGrid}>
                  {suggestedQuestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(item.text)}
                      style={styles.suggestedButton}
                    >
                      <item.icon size={16} color="#9b59b6" />
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={styles.inputArea}>
            <button style={styles.attachButton}>
              <Paperclip size={20} color="#7f8c8d" />
            </button>

            <form onSubmit={handleSend} style={styles.inputForm}>
              <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your health question here..."
                disabled={isLoading}
                style={styles.input}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                style={{
                  ...styles.sendButton,
                  backgroundColor: !input.trim() ? '#e0e0e0' : '#9b59b6',
                  cursor: !input.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={18} color="white" />
              </button>
            </form>

            <button style={styles.micButton}>
              <Mic size={20} color="#7f8c8d" />
            </button>
          </div>

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            <Shield size={12} color="#95a5a6" />
            <span>AI responses are for informational purposes only. Always consult with a healthcare provider.</span>
          </div>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  chatContainer: {
    display: 'flex',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    margin: '0 auto',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#fafbfc',
    borderRight: '1px solid #eaeef2',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  sidebarClose: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #eaeef2',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #eaeef2',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#3498db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  userStatus: {
    fontSize: '12px',
    color: '#7f8c8d',
  },
  sidebarTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  quickActions: {
    marginBottom: '24px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #eaeef2',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#2c3e50',
  },
  recentTopics: {
    flex: 1,
  },
  topicItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    marginBottom: '4px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    color: '#2c3e50',
    fontSize: '13px',
  },
  topicText: {
    color: '#34495e',
  },
  sidebarFooter: {
    borderTop: '1px solid #eaeef2',
    paddingTop: '16px',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    color: '#7f8c8d',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  chatHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #eaeef2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  menuButton: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #eaeef2',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#f0e6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0,
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '2px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2ecc71',
    animation: 'pulse 2s infinite',
  },
  headerRight: {
    display: 'flex',
    gap: '8px',
  },
  headerButton: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #eaeef2',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  messagesArea: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#fafbfc',
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    animation: 'slideIn 0.3s ease',
  },
  messageAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#f0e6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userMessageAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#9b59b6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.5',
    wordWrap: 'break-word',
  },
  messageTime: {
    fontSize: '11px',
    color: '#95a5a6',
    marginTop: '4px',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  loadingAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#f0e6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBubble: {
    backgroundColor: '#f0f2f5',
    padding: '12px 20px',
    borderRadius: '16px 16px 16px 4px',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#9b59b6',
    animation: 'typing 1.4s infinite ease-in-out',
  },
  suggestedContainer: {
    marginTop: '8px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #eaeef2',
  },
  suggestedTitle: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '12px',
  },
  suggestedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px',
  },
  suggestedButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #eaeef2',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2c3e50',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  inputArea: {
    padding: '20px 24px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #eaeef2',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  attachButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '1px solid #eaeef2',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  micButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '1px solid #eaeef2',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  inputForm: {
    flex: 1,
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #eaeef2',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  disclaimer: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #eaeef2',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: '#95a5a6',
  },
};

export default ChatAgent;