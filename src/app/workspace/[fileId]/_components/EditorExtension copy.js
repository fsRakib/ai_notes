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
import { marked } from "marked";
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

  async function convertMarkdownToHTML(markdown) {
    return marked.parse(markdown); // returns HTML string
  }

async function typeWriterEffect(editor, text, options = {}) {
  const { delay = 10, initialDelay = 50, lineDelay = 20 } = options;

  await new Promise((resolve) => setTimeout(resolve, initialDelay));

  const lines = text.split("\n");
  let inList = false;
  let currentNestLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Skip empty lines unless we're in a list
      if (inList) {
        editor.commands.enter();
        await new Promise((resolve) => setTimeout(resolve, lineDelay));
      }
      continue;
    }

    // Detect bold headings (lines that are standalone and not part of lists)
    const isHeading =
      (!inList && line.startsWith("**") && line.endsWith("**")) ||
      (line.endsWith(":") && !line.startsWith("-") && !line.startsWith("--"));

    if (isHeading) {
      // Exit list if we're in one
      if (inList) {
        editor.commands.toggleBulletList();
        inList = false;
        currentNestLevel = 0;
      }

      // Clean heading text (remove ** markers if present)
      const headingText = line.replace(/\*\*/g, "").trim();

      // Apply bold formatting
      editor.commands.toggleBold();
      await insertContentWithDelay(editor, headingText, delay);
      editor.commands.toggleBold();

      // Add line break
      if (i < lines.length - 1) {
        editor.commands.enter();
        await new Promise((resolve) => setTimeout(resolve, lineDelay));
      }
      continue;
    }

    // Detect list items
    const listMatch = line.match(/^(-+)\s/);
    const targetNestLevel = listMatch ? listMatch[1].length : 0;

    if (listMatch) {
      // Start list if not in one
      if (!inList) {
        editor.commands.toggleBulletList();
        inList = true;
        currentNestLevel = 1;
      } else {
        // New item in existing list
        editor.commands.enter();
      }

      // Adjust nesting level
      while (currentNestLevel < targetNestLevel) {
        editor.commands.sinkListItem("listItem");
        currentNestLevel++;
      }
      while (currentNestLevel > targetNestLevel) {
        editor.commands.liftListItem("listItem");
        currentNestLevel--;
      }

      // Insert the content
      const content = line.slice(listMatch[0].length);
      await insertContentWithDelay(editor, content, delay);
      continue;
    }

    // Regular content
    if (inList) {
      // Continue in list context
      await insertContentWithDelay(editor, line, delay);
    } else {
      // Regular paragraph
      await insertContentWithDelay(editor, line, delay);
      if (i < lines.length - 1) {
        editor.commands.enter();
        await new Promise((resolve) => setTimeout(resolve, lineDelay));
      }
    }
  }
}

  async function insertContentWithDelay(editor, text, delay) {
    for (let i = 0; i < text.length; i++) {
      editor.commands.insertContent(text[i]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const onAiClick = async () => {
    if (isAiLoading) return;

    setIsAiLoading(true);
    toast("AI is getting your answer...");

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

      // Insert question first
      editor
        .chain()
        .focus()
        .insertContent(
          `<p><strong>Question:</strong> ${selectedText}</p><p><strong>Answer:<br/></strong></p>`
        )
        .run();

      // Step 1: Search relevant content from vector DB
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
          // THIS IS WHERE TO PUT YOUR NEW ERROR MESSAGE
          toast.error(
            "AI usage limit reached. Free tier allows limited requests per minute. Please wait a moment before trying again."
          );
          return;
        }
        throw error;
      }

      // Minimal cleanup
      const markdownCleaned = markdownRaw
        .replace(/```(markdown|md)?/gi, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      // Apply typewriter effect
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
