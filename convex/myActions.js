import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { api } from "./_generated/api.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

export const ingest = action({
  args: {
    splitText: v.any(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    await ConvexVectorStore.fromTexts(
      args.splitText, //Array
      args.fileId, //string

      new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyCCWQLkRwew7URK-b_FZpP2J2RPgtr_blA",
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }),
      { ctx }
    );
    return "Completed...";
  },
});

export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyCCWQLkRwew7URK-b_FZpP2J2RPgtr_blA",
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }),
      { ctx }
    );

    const resultOne = await await vectorStore.similaritySearch(args.query, 1);
    console.log("ResultOne: ", resultOne);

    return JSON.stringify(resultOne);
  },
});

//////////////////////////////
// export const search = action({
//   args: {
//     query: v.string(),
//     fileId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     console.log("Search Request Received:", args);

//     const vectorStore = new ConvexVectorStore(
//       new GoogleGenerativeAIEmbeddings({
//         apiKey: "AIzaSyCCWQLkRwew7URK-b_FZpP2J2RPgtr_blA",
//         model: "text-embedding-004",
//         taskType: TaskType.RETRIEVAL_DOCUMENT,
//         title: "Document title",
//       }),
//       { ctx }
//     );

//     //     const resultOne = await(
// //       await vectorStore.similaritySearch(args.query, 1)
// //     ).filter((q) => q.metadata.fileId == args.fileId);
// //     console.log(resultOne);

//     // Search
//     const results = await (await vectorStore.similaritySearch(args.query, 1)).filter((q) => q.metadata.fileId == args.fileId);

//     console.log("Raw Search Results:", results);

//     // Filter results for matching fileId
//     const filteredResults = results.filter((q) => q.metadata.fileId == args.fileId);

//     console.log("Filtered Search Results:", filteredResults);

//     return JSON.stringify(filteredResults);
//   },
// });
