import * as db from "$lib/server/database";
import { json } from "@sveltejs/kit";

export async function GET() {
    const user = await db.getUserByCookie("thisCookieDoesNotExist");
    return json({
        ok: user === undefined
    });
}