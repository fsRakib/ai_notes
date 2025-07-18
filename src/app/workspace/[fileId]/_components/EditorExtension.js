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
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui

function EditorExtension({ editor, setLink, pdfVisible, setPdfVisible }) {
  const { fileId } = useParams();
  const SearchAI = useAction(api.myActions.search);
  const saveNotes = useMutation(api.notes.AddNotes);
  const { user } = useUser();

  async function convertMarkdownToHTML(markdown) {
    return marked.parse(markdown); // returns HTML string
  }

  const onAiClick = async () => {
    toast("AI is getting your answer...");

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    console.log("selected text:", selectedText);

    // Step 1: Search relevant content from vector DB
    const result = await SearchAI({
      query: selectedText,
      fileId: fileId,
    });
    console.log("Search Result:", result);

    const UnformattedAns = JSON.parse(result);
    const AllUnformattedAns =
      UnformattedAns?.map((el) => el.pageContent).join(" ") || "";

    // Step 2: Send to LLM with markdown-only prompt
    const PROMPT = `
You are given a question and supporting content extracted from a document.

Task:
- Provide a clean, well-structured markdown answer.
- Group key points logically using headings or bullet points.
- Clearly state who is responsible (if applicable).
- Respond ONLY in valid markdown — no HTML, no backticks, no raw code blocks.

Question: ${selectedText}

Content: ${AllUnformattedAns}
`;

    const AiModelResult = await chatSession.sendMessage(PROMPT);
    const markdownRaw = await AiModelResult.response.text();
    console.log("AI Markdown Output:", markdownRaw);

    // Step 3: Minimal cleanup 
    const markdownCleaned = markdownRaw
      .replace(/```(markdown|md)?/gi, "") 
      .replace(/&nbsp;/g, " ")
      .trim();

    // Step 4: Convert Markdown to HTML (TipTap needs HTML)
    const mdToHtml = await convertMarkdownToHTML(markdownCleaned);

    // Step 5: Insert clean output into the editor
    editor
      .chain()
      .focus()
      .insertContent(
        `<p><strong>Question:</strong> ${selectedText}</p><p><strong>Answer:</strong></p>${mdToHtml}`
      )
      .run();

    // Step 6: Save note to DB
    saveNotes({
      notes: editor.getHTML(),
      fileId: fileId,
      createdBy: user?.primaryEmailAddress?.emailAddress,
    });
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
              className={"hover:text-blue-600"}
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
