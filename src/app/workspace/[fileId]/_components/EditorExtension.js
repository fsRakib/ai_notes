import { useAction, useMutation } from "convex/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Link,
  List,
  Sparkle,
  Underline,
} from "lucide-react";
import React from "react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { chatSession } from "../../../../../config/AIModel";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Eye, EyeOff } from "lucide-react";

function EditorExtension({ editor, setLink, pdfVisible, setPdfVisible }) {
  const { fileId } = useParams();
  const SearchAI = useAction(api.myActions.search);
  const saveNotes = useMutation(api.notes.AddNotes);
  const { user } = useUser();

  async function typeWriterEffect(editor, text, options = {}) {
    const { delay = 10, initialDelay = 50, lineDelay = 20 } = options;

    await new Promise((resolve) => setTimeout(resolve, initialDelay));

    async function insertBoldContentWithDelay(editor, text, delay) {
      try {
        editor.chain().focus().run();

        const boldHtml = `<strong>${text}</strong>`;

        for (let i = 0; i < text.length; i++) {
          editor.commands.insertContent(`<strong>${text[i]}</strong>`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error("Bold insertion error:", error);

        editor.commands.insertContent(`<strong>${text}</strong>`);
      }
    }

    async function insertContentWithDelay(editor, text, delay) {
      for (let i = 0; i < text.length; i++) {
        editor.commands.insertContent(text[i]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const lines = text.split("\n");
    let inList = false;
    let currentNestLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inList) {
          editor.commands.enter();
          await new Promise((resolve) => setTimeout(resolve, lineDelay));
        }
        continue;
      }

      const isBoldMarkdownHeading = /^\*\*(.+?)\*\*$/.test(line);
      const isColonHeading =
        line.endsWith(":") && !line.startsWith("-") && !line.startsWith("--");
      const isHeading = isBoldMarkdownHeading || isColonHeading;

      if (isHeading) {
        if (inList) {
          editor.commands.toggleBulletList();
          inList = false;
          currentNestLevel = 0;

          editor.commands.enter();
          await new Promise((resolve) => setTimeout(resolve, lineDelay));
        }

        let headingText;
        if (isBoldMarkdownHeading) {
          headingText = line.replace(/^\*\*(.+?)\*\*$/, "$1").trim();
        } else {
          headingText = line.replace(/:$/, "").trim();
        }

        await insertBoldContentWithDelay(editor, headingText, delay);

        if (i < lines.length - 1) {
          editor.commands.enter();
          await new Promise((resolve) => setTimeout(resolve, lineDelay));
        }
        continue;
      }

      const listMatch = line.match(/^(-+)\s/);
      const targetNestLevel = listMatch ? listMatch[1].length : 0;

      if (listMatch) {
        if (!inList) {
          editor.commands.clearNodes();
          editor.commands.toggleBulletList();
          inList = true;
          currentNestLevel = 1;
        } else {
          editor.commands.enter();
        }

        while (currentNestLevel < targetNestLevel) {
          editor.commands.sinkListItem("listItem");
          currentNestLevel++;
        }
        while (currentNestLevel > targetNestLevel) {
          editor.commands.liftListItem("listItem");
          currentNestLevel--;
        }

        const content = line.slice(listMatch[0].length);
        await insertContentWithDelay(editor, content, delay);
        continue;
      }

      if (inList) {
        editor.commands.toggleBulletList();
        inList = false;
        currentNestLevel = 0;

        editor.commands.enter();
        await new Promise((resolve) => setTimeout(resolve, lineDelay));
      }

      await insertContentWithDelay(editor, line, delay);
      if (i < lines.length - 1) {
        editor.commands.enter();
        await new Promise((resolve) => setTimeout(resolve, lineDelay));
      }
    }
  }

  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const loadingMessages = [
    "Just a sec...",
    "Generating your response...",
    "Thinking hard...",
    "Almost there...",
    "Processing your request...",
    "Crafting the perfect answer...",
    "Working on it...",
    "Hang tight...",
    "Computing magic...",
    "Brewing your response...",
  ];

  const getRandomLoadingMessage = () => {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  };

  const startLoadingAnimation = (editor) => {
    let messageStartPos = null;
    let currentMessageLength = 0;

    const updateLoadingMessage = () => {
      const message = getRandomLoadingMessage();

      if (messageStartPos !== null && currentMessageLength > 0) {
        const endPos = messageStartPos + currentMessageLength;
        const transaction = editor.state.tr
          .delete(messageStartPos, endPos)
          .insertText(message, messageStartPos);

        editor.view.dispatch(transaction);
        currentMessageLength = message.length;
      } else {
        messageStartPos = editor.state.selection.from;
        editor.commands.insertContent(message);
        currentMessageLength = message.length;
      }

      setTimeout(() => {
        const editorElement = editor.view.dom;
        const textNodes = editorElement.querySelectorAll("p");
        const lastParagraph = textNodes[textNodes.length - 1];

        if (lastParagraph && lastParagraph.textContent.trim() === message) {
          lastParagraph.className = "";

          const text = lastParagraph.textContent;
          lastParagraph.innerHTML = "";

          text.split("").forEach((char, index) => {
            const span = document.createElement("span");
            span.textContent = char === " " ? "\u00A0" : char; // Use non-breaking space
            span.className =
              "inline-block text-blue-500 font-medium animate-bounce";
            span.style.animationDelay = `${index * 0.1}s`;
            span.style.animationDuration = "1s";
            span.style.animationIterationCount = "infinite";
            lastParagraph.appendChild(span);
          });

          // Add overall styling to the paragraph
          lastParagraph.classList.add("italic");
        }
      }, 50);
    };

    updateLoadingMessage();
    const interval = setInterval(updateLoadingMessage, 2000);

    return {
      interval,
      cleanup: () => {
        clearInterval(interval);
        if (messageStartPos !== null && currentMessageLength > 0) {
          const endPos = messageStartPos + currentMessageLength;
          const transaction = editor.state.tr.delete(messageStartPos, endPos);
          editor.view.dispatch(transaction);
        }
      },
    };
  };

  const onAiClick = async () => {
    if (isAiLoading) return;

    setIsAiLoading(true);
    toast("AI is getting your answer...");

    let loadingAnimation = null;

    try {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " "
      );

      if (!selectedText.trim()) {
        toast.error("Please select some text to ask about");
        return;
      }

      editor
        .chain()
        .focus()
        .insertContent(
          `<p><strong>Question:</strong> ${selectedText}</p><p><strong>Answer:<br/></p>`
        )
        .run();
      loadingAnimation = startLoadingAnimation(editor);
      const result = await SearchAI({
        query: selectedText,
        fileId: fileId,
      });

      const UnformattedAns = JSON.parse(result);
      const AllUnformattedAns =
        UnformattedAns?.map((el) => el.pageContent).join(" ") || "";

      const PROMPT = `
      You are a technical documentation assistant. Provide clear, concise answers in well-structured markdown format using ONLY the information from the provided document.

      ## Response Requirements:
      1. Use **bold** for section headings (no # symbols)
      2. Use bullet points (-) for lists
      3. Keep paragraphs short (1-3 sentences)
      4. Remove unnecessary blank lines
      5. If multiple topics exist, separate them with clear headings

      ## Document Context:
      ${AllUnformattedAns}

      ## Question:
      ${selectedText}

      Format your answer like this example:

      **Main Topic**
      - Primary point
      -- Sub point
      -- Another sub point
      - Second point

      **Secondary Topic**
      - Detail 1
      - Detail 2
      `;

      let markdownRaw;
      try {
        const AiModelResult = await chatSession.sendMessage(PROMPT);
        console.log("AI Model AiModelResult:", AiModelResult);

        markdownRaw = await AiModelResult.response.text();
        console.log("AI Model markdownRaw:", markdownRaw);
      } catch (error) {
        if (
          error.message.includes("429") ||
          error.message.includes("Quota exceeded")
        ) {
          toast.error(
            "AI usage limit reached. Free tier allows limited requests per minute. Please wait a moment before trying again."
          );
          return;
        }
        throw error;
      }
      if (loadingAnimation) {
        loadingAnimation.cleanup();
        loadingAnimation = null;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));

      const markdownCleaned = markdownRaw
        .replace(/```(markdown|md)?/gi, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      await typeWriterEffect(editor, markdownCleaned);

      // Save the final content
      await saveNotes({
        notes: editor.getHTML(),
        fileId: fileId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI response. Please try again later.");
    } finally {
      if (loadingAnimation) {
        loadingAnimation.cleanup();
      }
      setIsAiLoading(false);
    }
  };

  return (
    editor && (
      <div className="p-5 ProseMirror">
        <div className="control-group">
          <div className="button-group flex gap-3">
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 }) ? "text-blue-600" : ""
              }
            >
              H1
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 }) ? "text-blue-600" : ""
              }
            >
              H2
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive("heading", { level: 3 }) ? "text-blue-600" : ""
              }
            >
              H3
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "text-blue-600" : ""}
            >
              <Bold />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "text-blue-600" : ""}
            >
              <Italic />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={editor.isActive("highlight") ? "text-blue-600" : ""}
            >
              <Highlighter />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "text-blue-600" : ""}
            >
              <Underline />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={
                editor.isActive({ textAlign: "left" }) ? "text-blue-600" : ""
              }
            >
              <AlignLeft />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={
                editor.isActive({ textAlign: "center" }) ? "text-blue-600" : ""
              }
            >
              <AlignCenter />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={
                editor.isActive({ textAlign: "right" }) ? "text-blue-600" : ""
              }
            >
              <AlignRight />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              className={
                editor.isActive({ textAlign: "justify" }) ? "text-blue-600" : ""
              }
            >
              <AlignJustify />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "text-blue-600" : ""}
            >
              <List />
            </button>

            <button
              onClick={setLink}
              className={editor.isActive("link") ? "text-blue-600" : ""}
            >
              <Link />
            </button>
            <button
              onClick={() => onAiClick()}
              className={`hover:text-blue-600 ${isAiLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
              disabled={isAiLoading}
              title={isAiLoading ? "Generating response..." : "Ask AI"}
            >
              <Sparkle />
            </button>

            <button
              onClick={() => setPdfVisible(!pdfVisible)}
              className="hover:text-blue-600 "
              title={pdfVisible ? "Hide PDF Viewer" : "Show PDF Viewer"}
            >
              {pdfVisible ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default EditorExtension;
