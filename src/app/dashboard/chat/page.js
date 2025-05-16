"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      // Format response
      // let raw = data.reply?.trim() || "⚠️ Failed to generate reply.";
      // let responseWithBold = raw
      //   .split("**")
      //   .map((chunk, i) =>
      //     i % 2 === 1 ? `<b>${chunk}</b>` : chunk
      //   )
      //   .join("");
      // let formatted = responseWithBold.split("*").join("<br/>");

      let raw = data.reply?.trim() || "⚠️ Failed to generate reply.";
      let responseWithBold = raw
        .split("**")
        .map((chunk, i) => (i % 2 === 1 ? `<b>${chunk}</b>` : chunk))
        .join("");

      // Optional: Handle italics using *italic* (avoid converting every * to <br/>)
      let responseWithItalics = responseWithBold
        .split("*")
        .map((chunk, i) => (i % 2 === 1 ? `<i>${chunk}</i>` : chunk))
        .join("");

      // Final sanitized/clean HTML (minimal use of <br/>)
      let formatted = responseWithItalics;

      // Show placeholder "isTyping" message
      const typingMsg = { sender: "bot", text: "", isTyping: true };
      setMessages((prev) => [...prev, typingMsg]);

      // Simulate typing delay
      let chars = formatted.split("");
      chars.forEach((char, i) => {
        setTimeout(() => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.sender === "bot" && last.isTyping) {
              last.text = formatted.slice(0, i + 1);
            }
            return [...updated];
          });
        }, 10 * i);
      });

      // Disable typing state after done
      setTimeout(
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.sender === "bot") {
              delete last.isTyping;
            }
            return [...updated];
          });
          setLoading(false);
        },
        10 * chars.length + 500
      );
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Server error. Please try again." },
      ]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className=" flex flex-col h-full bg-gray-200 rounded-lg">
      <div className="text-center text-2xl font-bold p-2 border-b-2 rounded-lg bg-blue-200 shadow-md">
        🤖 Gemini Chatbot
      </div>

      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 border-b-2"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mx-10 w-fit max-w-[70%] px-4 py-2 rounded-lg whitespace-pre-line break-words ${
              msg.sender === "user"
                ? "ml-auto bg-blue-500 text-white "
                : "mr-auto bg-gray-300 text-black "
            }`}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ))}

        {loading && (
          <div className="mr-auto bg-gray-200 text-gray-600 px-4 py-2 rounded-lg animate-pulse">
            Gemini is typing...
          </div>
        )}
      </div>

      <div className="rounded-lg   flex items-center border-t  space-x-2">
        <textarea
          rows={1}
          className="flex-1 resize-none p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
