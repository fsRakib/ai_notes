import { useOthers } from "@liveblocks/react/suspense";
import Image from "next/image";

export const ActiveCollaborators = () => {
  // https://liveblocks.io/docs/api-reference/liveblocks-react#useOthers
  const others = useOthers();

  const collaborators = others.map((other) => other.info);

  return (
    <ul className="hidden items-center justify-end -space-x-2 ge sm:flex">
      {collaborators.map((collaborator) => (
        <li key={collaborator.id}>
          <Image
            src={collaborator.avatar}
            alt={collaborator.name}
            width={100}
            height={100}
            className="inline-block size-8 rounded-full ring-2 ring-purple-300"
            style={{ border: `3px solid ${collaborator.color}` }}
          />
        </li>
      ))}
    </ul>
  );
};
