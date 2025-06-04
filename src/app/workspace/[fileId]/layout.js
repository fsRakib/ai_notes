import  LiveblocksProvider from "@/lib/Providers/LiveblocksProvider";

export default function WorkSpaceLayout({ children }) {
  return (
    <LiveblocksProvider>
      {children}
    </LiveblocksProvider>
  );
}
