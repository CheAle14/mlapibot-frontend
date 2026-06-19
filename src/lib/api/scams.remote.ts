import { command, query } from "$app/server";
import { env } from "$env/dynamic/private";
import * as db from "$lib/server/database";
import type { GotAnalysis, GotRedditPost } from "$lib/types/api";
import { error } from "@sveltejs/kit";
import * as z from "zod";
import { isModeratorOf } from "./auth.remote";

export const getSubredditScams = query(z.string(), async (subreddit) => {
  if (!(await isModeratorOf(subreddit))) return error(403);
  return await db.getSubredditScamRules(subreddit);
});

export const fetchRedditSubmission = command(z.httpUrl(), async (link) => {
  console.log("Fetching", link);
  const result = await fetch(env.API_URL + "/get-reddit", {
    method: "POST",
    body: JSON.stringify({ link }),
  });

  const post = (await result.json()) as GotRedditPost;
  console.log("Got:", post);

  if (!(await isModeratorOf(post.subreddit_id))) return error(403);

  return post;
});

export const fetchScamAnalysisResult = command(
  z.object({
    subreddit_id: z.string(),
    title: z.string(),
    links: z.array(z.string()).optional(),
    body: z.string().optional(),
  }),
  async (data) => {
    if (!(await isModeratorOf(data.subreddit_id))) return error(403);

    console.log("Sending for analysis", data);
    const result = await fetch(env.API_URL + "/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!result.ok) {
      console.error(result);
      throw result;
    } else {
      return (await result.json()) as GotAnalysis;
    }
  },
);
