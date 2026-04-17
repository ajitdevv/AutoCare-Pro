import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Missing auth token", status: 401 };

  const sb = adminClient();
  const { data: userData, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userData?.user) return { error: "Invalid session", status: 401 };

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403 };
  return { sb, user: userData.user };
}

export async function POST(request) {
  try {
    const ctx = await requireAdmin(request);
    if (ctx.error) return Response.json({ error: ctx.error }, { status: ctx.status });

    const body = await request.json();
    const { email, password, full_name, role = "admin" } = body || {};

    if (!email || !password) {
      return Response.json({ error: "email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!["admin", "customer", "technician"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const { data: created, error: createErr } = await ctx.sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

    if (createErr) {
      return Response.json({ error: createErr.message }, { status: 400 });
    }

    const newId = created?.user?.id;
    if (newId) {
      await ctx.sb
        .from("profiles")
        .upsert({ id: newId, email, full_name: full_name || "", role }, { onConflict: "id" });
    }

    return Response.json({ success: true, user: { id: newId, email, role } });
  } catch (err) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const ctx = await requireAdmin(request);
    if (ctx.error) return Response.json({ error: ctx.error }, { status: ctx.status });

    const { user_id, role } = (await request.json()) || {};
    if (!user_id || !role) {
      return Response.json({ error: "user_id and role are required" }, { status: 400 });
    }
    if (!["admin", "customer", "technician"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const { error } = await ctx.sb.from("profiles").update({ role }).eq("id", user_id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const ctx = await requireAdmin(request);
    if (ctx.error) return Response.json({ error: ctx.error }, { status: ctx.status });

    const url = new URL(request.url);
    const user_id = url.searchParams.get("user_id");
    if (!user_id) return Response.json({ error: "user_id is required" }, { status: 400 });
    if (user_id === ctx.user.id) {
      return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const { error } = await ctx.sb.auth.admin.deleteUser(user_id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
