import { useAction } from "convex/react";
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

function EditorExtension({ editor, setLink }) {
  const { fileId } = useParams();

  const SearchAI = useAction(api.myActions.search);

  const onAiClick = async () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    console.log("selected text: ", selectedText);

    const result = await SearchAI({
      query: selectedText,
      fileId: fileId,
    });

    const UnformatedAns = JSON.parse(result);
    // console.log("Unformated Ans: ", result);

    let AllUnformattedAns = "";
    UnformatedAns &&
      UnformatedAns.forEach((element) => {
        AllUnformattedAns += element.pageContent;
      });

    const PROMPT =
      "For question: " +
      selectedText +
      " and with the given content as answer," +
      "please give appropriate answer in HTML format. The answer content is: " +
      AllUnformattedAns;

    const AiModelResult = await chatSession.sendMessage(PROMPT);
    console.log("AiModelResult: ", AiModelResult.response.text());

    const FinalAns = AiModelResult.response
      .text()
      .replace("```", "")
      .replace("html", "")
      .replace("```", "");
    const AllText = editor.getHTML();
    editor.commands.setContent(
      AllText + "<p><strong>Answer: </strong>" + FinalAns + "</p>"
    );
  };
  return (
    editor && (
      <div className="p-5">
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
          </div>
        </div>
      </div>
    )
  );
}

export default EditorExtension;
