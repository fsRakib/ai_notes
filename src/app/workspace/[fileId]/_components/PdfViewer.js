import React from "react";

function PdfViewer({ fileUrl }) {
  return (
    <div className="relative h-[90vh]">
      <iframe
        src={`${fileUrl}#toolbar=0`}
        className="w-full h-full border rounded-lg shadow-sm"
        title="PDF Viewer"
      />
    </div>
  );
}

export default PdfViewer;
