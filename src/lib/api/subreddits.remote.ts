import { command, form, query } from "$app/server";
import { env } from "$env/dynamic/private";
import * as db from "$lib/server/database";
import { assertSubredditId, ZSubredditId, type ApiRemovalReason, type Subreddit } from "$lib/types/subreddit";
import { error } from "@sveltejs/kit";
import * as z from "zod";
import { isAdmin, isModeratorOf } from "./auth.remote";

export const createSubreddit = form(
  z.object({
    id: z.string(),
    name: z.string(),
  }),
  async ({ id, name }) => {
    if (!(await isAdmin())) return error(403);

    const sub: Subreddit = {
      id,
      name,
      last_sync: new Date().toISOString(),
      seq_num: 0,
      mod_json_schema: 0,
      removal_reasons: {},
      mod_scams: {
        enabled: false,
      },
      mod_ai_slop: {
        enabled: false,
        report: false,
      },
      mod_staff_reply: {
        enabled: false,
        flair_id: "",
        ignore_post_title_contains: [],
      },
      mod_status: {
        enabled: false,
        min_impact: "none",
        distinguish: false,
      },
      mod_related_title: {
        enabled: false,
        reason: "",
        check_img_posts: false,
      },
      mod_complex_comments: {
        enabled: false,
      },
      mod_comments_code: {
        enabled: false,
      },
      mod_comments_cdn: {
        enabled: false,
      },
    };

    await db.createSubreddit(sub);

    return sub;
  },
);

export const addSubredditModerator = form(
  z.object({
    subreddit_id: z.string(),
    username: z.string(),
  }),
  async ({ subreddit_id, username }) => {
    if (!(await isAdmin())) return error(403);

    await db.addModerator(assertSubredditId(subreddit_id), username);
  },
);

export const getSubredditModerators = query(ZSubredditId, async (subreddit) => {
  if(!(await isModeratorOf(subreddit))) return error(403);
  
  return await db.getSubredditModerators(subreddit);
});

export const refreshSubredditModerators = command(ZSubredditId, async (subreddit) => {
  if(!(await isModeratorOf(subreddit))) return error(403);

  const response = await fetch(env.API_URL + "/refresh-subreddit-moderators", {
    method: 'POST',
    body: JSON.stringify(subreddit)
  });

  if (!response.ok)
    return error(500);
});

interface FetchRemovalReasonsResponse {
  reasons: ApiRemovalReason[]
}

export const fetchRemovalReasons = query(ZSubredditId, async (subreddit) => {
  if (!(await isModeratorOf(subreddit))) return error(403);

  const response = await fetch(env.API_URL + '/removal-reasons', {
    method: 'POST',
    body: JSON.stringify(subreddit),
  });

  const { reasons } = (await response.json()) as FetchRemovalReasonsResponse;

  return reasons;
});

export const getVagueWords = query(ZSubredditId, async (subreddit) => {
  if (!(await isModeratorOf(subreddit))) return error(403);

  return await db.getSubredditVagueWords(subreddit);
});

export const setVagueWords = command(z.object({
  subreddit: ZSubredditId,
  words: z.set(z.string()),
}), async ({subreddit, words}) => {
  if (!(await isModeratorOf(subreddit))) return error(403);

  const asArray = words.values().reduce((acc, b) => {
    acc.push(b);
    return acc;
  }, [] as string[]);

  await db.setSubredditVagueWords(subreddit, asArray);
  getVagueWords(subreddit).set(words);
});