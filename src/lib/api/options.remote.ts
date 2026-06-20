import { query } from "$app/server";
import * as db from "$lib/server/database";
import { ZSubredditId } from "$lib/types/subreddit";
import { error } from "@sveltejs/kit";
import { isModeratorOf } from "./auth.remote";

export const getSubredditOptions = query(ZSubredditId.optional(), async (subreddit) => {
  if (!subreddit) return error (400);

  if (!(await isModeratorOf(subreddit))) return error(403);

  const sub = await db.getSubredditData(subreddit);

  if (!sub) {
    return error(404);
  }

  return sub;
});
