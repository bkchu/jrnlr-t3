import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type PostContextType = {
  postId: number;
  setPostId: Dispatch<SetStateAction<number>>;
};
const PostContext = createContext<PostContextType>({} as PostContextType);

export const usePostContext = () => useContext(PostContext);

export const PostProvider = ({
  initialPostId,
  children,
}: {
  initialPostId: number;
  children: ReactNode;
}) => {
  const [postId, setPostId] = useState<number>(initialPostId);

  return (
    <PostContext.Provider value={{ postId, setPostId }}>
      {children}
    </PostContext.Provider>
  );
};
