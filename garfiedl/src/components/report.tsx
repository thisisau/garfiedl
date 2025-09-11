import { MouseEventHandler } from "react";
import { useStateObj } from "../functions/hooks";
import { Post } from "../types/posts";
import Button from "./input/button";
import { TextInput } from "./input/input";
import { OnlinePost, PostPreview, SimplePost } from "./post";

export function ReportPost(props: {
  post: Post;
  author: { id: string | null; displayName: string };
  onSubmit?: (info: { reason: string }) => void;
}) {
  const [info, updateInfo] = useStateObj({
    reason: "",
  });

  return (
    <div className="post-report">
      <SimplePost post={props.post} author={props.author} />
      <TextInput
        textArea
        placeholder="Add a reason for this report…"
        defaultValue={info.reason}
        onUpdate={(val) => updateInfo((info) => (info.reason = val))}
        onBlur={(val) => updateInfo((info) => (info.reason = val.trim()))}
        maxLength={1200}
      />
      <Button
        onClick={() => {
          if (props.onSubmit) props.onSubmit(info);
        }}
      >
        Submit Report
      </Button>
    </div>
  );
}
