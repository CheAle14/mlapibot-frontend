import { query } from "$app/server";
import * as db from "$lib/server/database";
import { ZSubredditId } from "$lib/types/subreddit";
import { error } from "@sveltejs/kit";
import * as z from "zod";
import { isModeratorOf } from "./auth.remote";

export const getTemplateStubs = query(ZSubredditId, async (subreddit) => {
  if (!(await isModeratorOf(subreddit))) return error(403);

  return await db.getSubredditTemplateStubs(subreddit);
});

export const getTemplateInfo = query(
  z.object({
    subreddit: ZSubredditId,
    template: z.int32(),
  }),
  async ({ subreddit, template }) => {
    if (!(await isModeratorOf(subreddit))) return error(403);

    const result = await db.getSubredditTemplate(subreddit, template);

    if (result) {
      return result;
    } else {
      error(404);
    }
  },
);
