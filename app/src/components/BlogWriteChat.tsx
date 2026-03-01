import { useState, useRef, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import { parsePatch } from "~/lib/patch";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function looksLikeBlogPost(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const headingCount = (trimmed.match(/^#{1,6}\s+/gm) ?? []).length;
  return trimmed.startsWith("#") || headingCount >= 2;
}

function extractTitleFromMarkdown(text: string): string | undefined {
  const match = text.trim().match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

function truncateTitle(text: string, maxLen = 40): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen) + "…";
}

function PatchBlock({
  patchText,
  onApply,
  applyError,
  canApply,
}: {
  patchText: string;
  onApply: () => void;
  applyError?: string | null;
  canApply: boolean;
}) {
  const hunks = parsePatch(patchText);
  return (
    <div className="my-4 border border-emerald-500/30 rounded-lg overflow-hidden bg-black/60 w-full">
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/20 shrink-0">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Patch ({hunks.length} hunk{hunks.length !== 1 ? "s" : ""})
        </span>
        {canApply && (
          <button
            type="button"
            onClick={onApply}
            className="text-xs font-mono bg-emerald-500 text-black px-3 py-1 rounded hover:opacity-90 transition-all font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(52,211,153,0.3)]"
          >
            Apply patch
          </button>
        )}
      </div>
      {applyError && (
        <div className="px-3 py-2 bg-red-950/60 border-b border-red-500/30 text-red-400 text-xs shrink-0">
          {applyError}
        </div>
      )}
      <div className="font-mono text-sm overflow-x-auto overflow-y-hidden min-w-0 bg-black/80">
        <pre className="p-3 m-0 text-sm font-mono whitespace-pre min-w-max">
          {patchText.split("\n").map((line, i) => {
            const isRemove = line.startsWith("-") && !line.startsWith("---");
            const isAdd = line.startsWith("+") && !line.startsWith("+++");
            const isHeader = line.startsWith("@@");
            
            return (
              <div
                key={i}
                className={`whitespace-pre px-2 py-0.5 -mx-2 ${
                  isHeader
                    ? "text-emerald-400/60 bg-emerald-950/20"
                    : isRemove
                      ? "bg-red-950/40 text-red-300"
                      : isAdd
                        ? "bg-emerald-950/40 text-emerald-300"
                        : "text-muted-foreground/80"
                }`}
              >
                {line || " "}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

export function BlogWriteChat({
  token,
  currentDraft,
  onUseDraft,
  onApplyPatch,
  isEmbedded,
}: {
  token: string;
  currentDraft?: string;
  onUseDraft: (body: string, title?: string) => void;
  onApplyPatch?: (patch: string) => void | Promise<{ ok: boolean; error?: string }>;
  isEmbedded?: boolean;
}) {
  const chats = useQuery(api.blogChats.list, token ? { token } : "skip");
  const createChatMutation = useMutation(api.blogChats.create);
  const updateChatMutation = useMutation(api.blogChats.update);
  const removeChatMutation = useMutation(api.blogChats.remove);
  const chatAction = useAction(api.blogWrite.chat);

  const [currentChatId, setCurrentChatId] = useState<Id<"blogChats"> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChat = useQuery(
    api.blogChats.get,
    token && currentChatId ? { token, id: currentChatId } : "skip"
  );

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
    } else if (!currentChatId) {
      setMessages([]);
    }
  }, [currentChatId, currentChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop();
  const canUseAsDraft =
    lastAssistantMessage && looksLikeBlogPost(lastAssistantMessage.content);

  async function ensureChat(): Promise<Id<"blogChats">> {
    if (currentChatId) return currentChatId;
    const id = await createChatMutation({ token });
    setCurrentChatId(id);
    return id;
  }

  function handleNewChat() {
    setCurrentChatId(null);
    setMessages([]);
    setError(null);
    setShowChatList(false);
  }

  async function handleSelectChat(id: Id<"blogChats">) {
    setCurrentChatId(id);
    setShowChatList(false);
  }

  async function handleDeleteChat(e: React.MouseEvent, id: Id<"blogChats">) {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await removeChatMutation({ token, id });
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setApplyError(null);
    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    queueMicrotask(() => textareaRef.current?.focus());

    try {
      const chatId = await ensureChat();
      const { text: responseText } = await chatAction({
        token,
        currentDraft,
        messages: newMessages,
      });

      const assistantMessage: ChatMessage = { role: "assistant", content: responseText };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      const isFirstMessage = messages.length === 0;
      const chatTitle = isFirstMessage ? truncateTitle(text) : undefined;
      await updateChatMutation({
        token,
        id: chatId,
        messages: updatedMessages,
        ...(chatTitle !== undefined && { title: chatTitle }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages(messages);
    } finally {
      setLoading(false);
      queueMicrotask(() => textareaRef.current?.focus());
    }
  }

  function handleUseDraft() {
    if (!lastAssistantMessage) return;
    const body = lastAssistantMessage.content;
    const title = extractTitleFromMarkdown(body);
    onUseDraft(body, title);
  }

  return (
    <div className={`flex flex-col ${isEmbedded ? 'flex-1 h-full min-h-0' : 'h-[calc(100vh-12rem)] min-h-[400px] max-h-[600px]'}`}>
      <div className={`flex items-center gap-2 shrink-0 ${isEmbedded ? 'p-3 border-b border-emerald-500/10' : 'mb-4'}`}>
        <button
          type="button"
          onClick={() => setShowChatList((s) => !s)}
          className="min-h-[40px] px-3 py-1.5 text-xs font-mono border border-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/10 transition-colors"
        >
          {showChatList ? "Hide History" : "Chat History"}
        </button>
        <button
          type="button"
          onClick={handleNewChat}
          className="min-h-[40px] px-3 py-1.5 text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors ml-auto"
        >
          + New
        </button>
      </div>

      {showChatList && (
        <div className={`mb-4 p-3 border-b border-emerald-500/20 bg-black/40 max-h-40 overflow-y-auto shrink-0 ${isEmbedded ? 'mx-0' : ''}`}>
          {chats === undefined ? (
            <p className="text-muted text-sm font-mono">Loading...</p>
          ) : chats.length === 0 ? (
            <p className="text-muted text-sm font-mono">No chats yet.</p>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat) => (
                <li key={chat._id}>
                  <div className="flex items-center justify-between gap-2 group">
                    <button
                      type="button"
                      onClick={() => handleSelectChat(chat._id)}
                      className={`flex-1 min-h-[40px] px-3 py-1.5 text-left text-sm rounded truncate transition-colors ${
                        currentChatId === chat._id
                          ? "bg-emerald-500/20 text-emerald-50"
                          : "hover:bg-emerald-500/10 text-muted hover:text-foreground"
                      }`}
                    >
                      {chat.title}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      className="min-h-[40px] px-2 py-1.5 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs uppercase tracking-widest font-mono"
                    >
                      Del
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-muted text-sm text-center py-8 font-mono">
            {isEmbedded 
              ? (currentDraft?.trim()
                  ? "Ask me to edit the draft—fix typos, improve a paragraph, or rewrite the whole thing. I'll show a patch you can apply with one click."
                  : "Share a blog idea and I'll ask a few questions. Say \"write it\" when you're ready—then click \"Use as draft\" to put it in the editor.")
              : "Share a blog idea and I'll ask a few questions before writing. Say \"write it\" when you're ready."}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-3 min-w-0 ${
                msg.role === "user"
                  ? "max-w-[90%] bg-emerald-500/10 border border-emerald-500/20 text-emerald-50"
                  : "max-w-full bg-black/40 border border-emerald-500/10"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-emerald prose-sm max-w-none min-w-0">
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        const contentStr = String(children);
                        const hasPatchHeader = /(?:^|\n)@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/.test(contentStr);
                        const isPatch = (match && (match[1] === "patch" || match[1] === "diff")) || hasPatchHeader;
                        
                        if (isPatch) {
                          const patchText = contentStr.replace(/\n$/, "");
                          return (
                            <PatchBlock
                              patchText={patchText}
                              onApply={async () => {
                                setApplyError(null);
                                const result = await onApplyPatch?.(patchText);
                                if (result && !result.ok) {
                                  setApplyError(result.error ?? "Failed to apply patch");
                                }
                              }}
                              applyError={applyError}
                              canApply={!!onApplyPatch}
                            />
                          );
                        }
                        
                        const isInline = !match && !String(children).includes("\n");
                        return isInline ? (
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        ) : (
                          <pre className="border border-primary/20 bg-black/40 rounded-lg p-3">
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          </pre>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/80 text-xs font-mono uppercase tracking-widest">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`shrink-0 space-y-2 ${isEmbedded ? 'p-3 border-t border-emerald-500/20 bg-black/20' : 'pt-4'}`}>
        {canUseAsDraft && (
          <button
            type="button"
            onClick={handleUseDraft}
            className="w-full min-h-[44px] px-4 py-2 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          >
            Use as draft
          </button>
        )}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            rows={2}
            disabled={loading}
            className="flex-1 min-h-[44px] px-3 py-3 bg-black/40 border border-emerald-500/20 rounded text-foreground text-sm resize-none focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 transition-colors"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="min-h-[44px] min-w-[44px] px-4 py-3 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0"
          >
            Send
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-xs font-mono" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
