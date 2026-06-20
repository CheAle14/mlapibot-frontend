import type { SidebarSubreddit } from "$lib/types/subreddit";
import { User } from "@lucide/svelte";
import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, parent, url, params }) => {
  if (!locals.user) {
    redirect(307, "/auth");
  }

  const { me, subs } = (await parent()) as {me: User | undefined, subs: SidebarSubreddit[]};

  if (!params.subreddit || !subs) {
    return redirect(307, '/');
  }

  const subreddit = subs.find(s => s.name === params.subreddit);

  if (!subreddit) {
    return redirect(307, '/');
  }


  return {
    me,
    subs,
    subreddit,
  };
};
