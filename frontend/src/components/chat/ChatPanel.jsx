import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api, { SOCKET_URL } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const ChatPanel = ({ selectedUser, onPresence }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!token) return undefined;
    const nextSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(nextSocket);
    nextSocket.on("presence:update", onPresence);
    nextSocket.on("chat:message", (message) => {
      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) return current;
        return [...current, message];
      });
    });
    nextSocket.on("chat:typing", ({ userId, typing }) => {
      setTypingUser(typing ? userId : null);
    });
    return () => nextSocket.disconnect();
  }, [token, onPresence]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser) return;
      const { data } = await api.get(`/chat/${selectedUser._id}/messages`);
      setMessages(data.messages);
    };
    loadMessages();
  }, [selectedUser]);

  const send = (event) => {
    event.preventDefault();
    if (!body.trim() || !selectedUser || !socket) return;
    socket.emit("chat:send", { recipientId: selectedUser._id, body: body.trim() });
    socket.emit("chat:typing", { recipientId: selectedUser._id, typing: false });
    setBody("");
  };

  const updateBody = (value) => {
    setBody(value);
    if (!socket || !selectedUser) return;
    socket.emit("chat:typing", { recipientId: selectedUser._id, typing: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("chat:typing", { recipientId: selectedUser._id, typing: false });
    }, 900);
  };

  return (
    <section className="flex h-[540px] flex-col rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-bold">Chat</h2>
        <p className="text-sm text-slate-500">
          {selectedUser ? `Talking with ${selectedUser.name}` : "Select a match to begin"}
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {selectedUser ? (
          messages.map((message) => {
            const mine = message.sender?._id === user?._id || message.sender === user?._id;
            return (
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`} key={message._id}>
                <div
                  className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${
                    mine ? "bg-ink text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            Your skill matches will appear beside this panel.
          </div>
        )}
      </div>
      {typingUser === selectedUser?._id && (
        <p className="px-4 pb-2 text-xs text-slate-500">{selectedUser.name} is typing...</p>
      )}
      <form className="flex gap-2 border-t border-slate-200 p-3" onSubmit={send}>
        <input
          className="focus-ring flex-1 rounded-lg border border-slate-200 px-3 py-2"
          disabled={!selectedUser}
          value={body}
          onChange={(event) => updateBody(event.target.value)}
          placeholder="Write a message"
        />
        <button
          className="focus-ring grid h-10 w-10 place-items-center rounded-lg bg-coral text-white disabled:opacity-50"
          disabled={!selectedUser}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
};

export default ChatPanel;
