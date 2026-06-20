import * as db from "$lib/server/database";
import type { SubredditPost } from "$lib/types/posts";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, parent }) => {
  const { subreddit } = await parent();

  const post_id = parseInt(params.post_id, 10);
  const post = await db.getSubredditPost(subreddit.id, post_id);

  if (!post) {
    error(404);
  }

  return { post: post as SubredditPost };
};
