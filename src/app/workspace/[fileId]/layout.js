import  LiveblocksProvider from "@/lib/Providers/LiveblocksProvider";
export const metadata = {
  title: "WorkSpace",
  description: "Generated by create next app",
};
export default function WorkSpaceLayout({ children }) {
  return (
    <LiveblocksProvider>
      {children}
    </LiveblocksProvider>
  );
}
