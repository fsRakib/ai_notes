import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function GET(req) {
  const reqUrl = req.url;
  const { searchParams } = new URL(reqUrl);
  const pdfURL = searchParams.get("pdfUrl");
  console.log("api/pdf-loader/route.js pdfURL", pdfURL);

  try {
    // Step 1: Fetch the PDF as a Blob
    const response = await fetch(pdfURL);
    const data = await response.blob();

    // Step 2: Load PDF into LangChain WebPDFLoader
    const loader = new WebPDFLoader(data);
    const docs = await loader.load(); // returns [{ pageContent, metadata }, ...]

    // Step 3: Split using LangChain Text Splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    // Print a preview in the server log
    splitDocs.forEach((doc, idx) => {
      console.log(`Chunk ${idx + 1}: ===>`, doc.pageContent.slice(0, 200)); // preview first 200 chars
    });

    // Step 4: Extract content from split docs
    const chunks = splitDocs.map((doc) => doc.pageContent);


    const totalTokens = chunks.reduce(
      (acc, chunk) => acc + chunk.split(" ").length,
      0
    );
    console.log("Estimated total tokens:", totalTokens);


    return NextResponse.json({ result: chunks });
  } catch (err) {
    console.error("PDF loader error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }

  // //load pdf file
  // const response = await fetch(pdfURL);
  // const data = await response.blob();
  // const loader = new WebPDFLoader(data);
  // const docs = await loader.load();

  // let pdfTextContent = "";
  // docs.forEach((doc) => {
  //   pdfTextContent = pdfTextContent + doc.pageContent;
  // });

  // //split text content into small chunks
  // const textSplitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 1000,
  //   chunkOverlap: 200,
  // });
  // const output = await textSplitter.createDocuments([pdfTextContent]);

  // let splitterList = [];
  // output.forEach((doc) => {
  //   splitterList.push(doc.pageContent);
  // });
  // return NextResponse.json({ result: splitterList });
}
