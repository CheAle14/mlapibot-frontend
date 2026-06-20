import { getRequestEvent, query } from "$app/server";
import * as db from "$lib/server/database";
import { ZSubredditId } from "$lib/types/subreddit";

export const isAdmin = query(async () => {
  const { locals } = getRequestEvent();
  return locals.user?.admin ?? false;
});

export const isModeratorOf = query(ZSubredditId, async (subreddit) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    return false;
  }

  return (
    locals.user.admin ||
    (await db.isUserModeratorOf(subreddit, locals.user.name))
  );
});
