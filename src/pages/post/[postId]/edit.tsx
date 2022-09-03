import { useRouter } from "next/router";
import { EditPost } from "../../../components/EditPost";
import NoSSR from "../../../components/NoSSR";

const Edit = () => {
  const router = useRouter();

  return (
    <NoSSR>
      <EditPost postId={router.query.postId as string} />
    </NoSSR>
  );
};

export default Edit;
