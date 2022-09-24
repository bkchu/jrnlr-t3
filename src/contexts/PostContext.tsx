import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type PostContextType = {
  postId: string;
  setPostId: Dispatch<SetStateAction<string>>;
};
const PostContext = createContext<PostContextType>({} as PostContextType);

export const usePostContext = () => useContext(PostContext);

export const PostProvider = ({
  initialPostId,
  children,
}: {
  initialPostId: string;
  children: ReactNode;
}) => {
  const [postId, setPostId] = useState<string>(initialPostId);

  return (
    <PostContext.Provider value={{ postId, setPostId }}>
      {children}
    </PostContext.Provider>
  );
};
