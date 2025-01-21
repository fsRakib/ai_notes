import { NextResponse } from "next/server";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

const pdfURL =
  "https://fiery-ostrich-412.convex.cloud/api/storage/4d99404b-1af9-4a39-bfc9-46bd7d4540e1";

export async function GET(req) {
  //load pdf file
  const response = await fetch(pdfURL);
  const data = await response.blob();
  const loader = new WebPDFLoader(data);
  const docs = await loader.load();

  let pdfTextContent = "";
  docs.forEach((doc) => {
    pdfTextContent = pdfTextContent + doc.pageContent;
  });

  //split text content into small chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 21,
    chunkOverlap: 20,
  });
  const output = await textSplitter.createDocuments([pdfTextContent]);

  let splitterList = [];
  output.forEach((doc) => {
    splitterList.push(doc.pageContent);
  });
  return NextResponse.json({ result: splitterList });
}
