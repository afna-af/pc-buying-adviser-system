import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { Send, Bot, User, Cpu, Sparkles, Plus, Trash2 } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { toast } from "sonner";

import api, { formatApiError } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const MODELS = [
  {
    value: "claude",
    label: "Claude Sonnet 4.5",
    color: "text-cyan-400",
  },
  {
    value: "gpt",
    label: "GPT-5.2",
    color: "text-emerald-300",
  },
  {
    value: "gemini",
    label: "Gemini 3 Flash",
    color: "text-fuchsia-300",
  },
];

const STARTERS = [
  "I have a $1500 budget for 1440p gaming. What should I build?",
  "Best workstation under $3000 for video editing in DaVinci Resolve?",
  "Compare AMD 9800X3D vs Intel Ultra 9 285K for gaming.",
  "I'm a CS student. Budget $900. What's a good dev/light gaming rig?",
];

export default function Chat() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const auth = useAuth();
  const user = auth?.user;

  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(params.get("session") || null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("claude");
  const [sending, setSending] = useState(false);

  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const loadSessions = async () => {
    if (!user) return;

    try {
      const response = await api.get("/chat/sessions");
      setSessions(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (sid) => {
    if (!sid) {
      setMessages([]);
      return;
    }

    try {
      const response = await api.get(`/chat/sessions/${sid}/messages`);

      setMessages(response.data || []);

      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    loadMessages(sessionId);
  }, [sessionId]);

  const send = async (text = "") => {
    const content = (text || input).trim();

    if (!content || sending) {
      return;
    }

    setInput("");
    setSending(true);

    const tempUser = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUser]);

    setTimeout(scrollToBottom, 30);

    try {
      const response = await api.post("/chat", {
        message: content,
        session_id: sessionId,
        model,
      });

      const data = response.data;

      if (!sessionId && data?.session_id) {
        setSessionId(data.session_id);

        navigate(`/chat?session=${data.session_id}`, { replace: true });

        loadSessions();
      }

      if (data?.reply) {
        setMessages((prev) => [...prev, data.reply]);
      }

      setTimeout(scrollToBottom, 30);
    } catch (e) {
      toast.error(
        formatApiError(e?.response?.data?.detail) || "AI request failed",
      );

      setMessages((prev) => prev.filter((msg) => msg.id !== tempUser.id));
    } finally {
      setSending(false);
    }
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([]);

    navigate("/chat", {
      replace: true,
    });
  };

  const deleteSession = async (sid) => {
    try {
      await api.delete(`/chat/sessions/${sid}`);

      setSessions((prev) => prev.filter((session) => session.id !== sid));

      if (sid === sessionId) {
        newChat();
      }
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[280px_1fr] gap-6 min-h-[calc(100vh-72px)]">
      {/* Sidebar */}
      <aside className="hidden lg:block" data-testid="chat-sidebar">
        <div className="card-tech rounded-xl p-4 sticky top-24">
          <Button
            onClick={newChat}
            className="btn-neon w-full mb-4"
            data-testid="new-chat-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          {!user && (
            <p className="text-xs text-zinc-500 mb-4">
              Sign in to save chat history.
            </p>
          )}

          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSessionId(session.id)}
                data-testid={`session-${session.id}`}
                className={`group flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer text-sm transition ${
                  sessionId === session.id
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                    : "hover:bg-white/5 text-zinc-300"
                }`}
              >
                <span className="truncate flex-1">{session.title}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition text-zinc-500 hover:text-rose-400"
                  data-testid={`delete-session-${session.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <div
        className="card-tech rounded-xl flex flex-col h-[calc(100vh-120px)]"
        data-testid="chat-main"
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-black" />
            </div>

            <div>
              <p className="font-heading font-semibold text-white">
                RIGS.AI Advisor
              </p>

              <p className="text-[11px] text-zinc-500 label-mono">
                PC BUYING EXPERT
              </p>
            </div>
          </div>

          {/* Model Select */}
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger
              className="w-[200px] bg-black/50 border-white/10"
              data-testid="model-picker"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-zinc-900 border-white/10">
              {MODELS.map((m) => (
                <SelectItem
                  key={m.value}
                  value={m.value}
                  data-testid={`model-option-${m.value}`}
                >
                  <span className={m.color}>●</span> {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-4"
          data-testid="messages-container"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center pulse-glow mb-5">
                <Sparkles className="w-7 h-7 text-black" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                What are you building?
              </h2>

              <p className="text-zinc-400 text-sm mb-8">
                Tell me your budget, use case, and preferences.
              </p>

              <div className="grid sm:grid-cols-2 gap-2 w-full">
                {STARTERS.map((starter, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => send(starter)}
                    data-testid={`starter-${index}`}
                    className="text-left text-sm p-3 rounded-lg border border-white/5 hover:border-cyan-400/40 bg-black/30 text-zinc-300 hover:text-white transition"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => <Message key={message.id} m={message} />)
          )}

          {/* Thinking */}
          {sending && (
            <div
              className="flex items-center gap-2 text-zinc-500 text-sm"
              data-testid="thinking-indicator"
            >
              <Bot className="w-4 h-4" />
              Thinking
              <span className="blink">●</span>
              <span className="blink" style={{ animationDelay: "0.2s" }}>
                ●
              </span>
              <span className="blink" style={{ animationDelay: "0.4s" }}>
                ●
              </span>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-white/5 p-4 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your perfect build..."
            className="bg-black/60 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/30"
            data-testid="chat-input"
            disabled={sending}
          />

          <Button
            type="submit"
            className="btn-neon"
            disabled={sending || !input.trim()}
            data-testid="chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

/* Message Component */
function Message({ m }) {
  const isUser = m.role === "user";

  return (
    <div
      className={`flex gap-3 fade-up ${isUser ? "flex-row-reverse" : ""}`}
      data-testid={`msg-${m.role}`}
    >
      <div
        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
          isUser
            ? "bg-fuchsia-500/20 border border-fuchsia-400/40"
            : "bg-cyan-400/10 border border-cyan-400/40"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-fuchsia-300" />
        ) : (
          <Bot className="w-4 h-4 text-cyan-400" />
        )}
      </div>

      <div
        className={`rounded-xl px-4 py-3 max-w-[78%] text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-white"
            : "bg-black/40 border border-white/5 text-zinc-200"
        }`}
      >
        {m.content}
      </div>
    </div>
  );
}
