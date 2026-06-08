import { NextResponse } from "next/server";
import { z } from "zod";
import { isCleoEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const submissionSchema = z.object({
  type: z.enum(["lightning", "talk", "workshop"]),
  title: z.string().trim().min(1).max(70),
  description: z.string().trim().min(10).max(400),
  submitter_name: z.string().trim().min(1),
  team: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isCleoEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("talk_submissions")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    console.error("Submission insert failed:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
