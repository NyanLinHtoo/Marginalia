import { PostForm } from "@/components/post-form";
import { createPost } from "@/actions/posts";

export default function NewPostPage() {
	return (
		<div>
			<h1 className="font-serif text-2xl font-semibold text-foreground">
				New post
			</h1>
			<PostForm action={createPost} submitLabel="Create post" />
		</div>
	);
}
