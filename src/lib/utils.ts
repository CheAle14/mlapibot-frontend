import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type ParsedLink = {
	subreddit: string;
} | {
	subreddit: string;
	post_id: string;
	post_slug: string;
} | {
	subreddit: string;
	post_id: string;
	post_slug: string;
	comment_id: string;
}

export function parseRedditLink(link: string): ParsedLink | null {
	if (!link)
		return null;

	let url: URL;

	try {
		url = new URL(link);
	} catch {
		return null;
	}

	if (!url.hostname.endsWith("reddit.com"))
		return null;

	const pathSegments = url.pathname.split('/').filter(f => f.trim().length != 0);

	const [_r, subreddit, _comments, post_id, post_slug, comment_id] = pathSegments;

	return { comment_id, post_slug, post_id, subreddit };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
