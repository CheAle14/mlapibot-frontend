import { command, query } from "$app/server";
import { env } from "$env/dynamic/private";
import * as db from "$lib/server/database";
import { ZPageReq, type PageResp } from "$lib/types/pagination";
import type { StaffReply, StaffReplyThread } from "$lib/types/staff_replies";
import { ZSubredditId } from "$lib/types/subreddit";
import { error } from "@sveltejs/kit";
import z from "zod";
import { isModeratorOf } from "./auth.remote";

export const fetchStaffReplyThreads = query(
  z.object({
    subreddit: ZSubredditId,
    page: ZPageReq,
  }),
  async ({
    subreddit,
    page,
  }): Promise<PageResp<StaffReplyThread>> => {
    if (!(await isModeratorOf(subreddit))) throw error(401);
    const threads = await db.getStaffReplyThreads(subreddit, page);
    return threads;
  },
);

export const fetchStaffRepliesInThread = query(
  z.object({
    subreddit: ZSubredditId,
    post_id: z.string(),
    page: ZPageReq,
  }),
  async ({ subreddit, post_id, page }): Promise<PageResp<StaffReply>> => {
    if (!(await isModeratorOf(subreddit))) throw error(401);

    if (!(await db.isStaffReplyThreadInSubreddit(subreddit, post_id))) throw error(401);

    const threads = await db.getStaffRepliesInThread(post_id, page);
    return threads;
  },
);

export const refreshStaffReplyThread = command(
  z.object({
    subreddit: ZSubredditId,
    post_id: z.string(),
  }),
  async ({subreddit, post_id}) => {
    if (!(await isModeratorOf(subreddit))) throw error(401);

    const response = await fetch(env.API_URL + `/refresh-staff-reply`, {
      method: "POST",
      body: JSON.stringify({
        subreddit_id: subreddit.subreddit_id,
        post_id
      }),
    });

    console.log(response);

    if (!response.ok) throw error(response.status);

    const data = (await response.json()) as {
      total_comments: number;
      total_staff_comments: number;
      new_staff_comments: number;
    };

    return data;
  },
);
