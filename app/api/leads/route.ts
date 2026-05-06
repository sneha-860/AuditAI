import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Lead } from "@/types";

export async function POST(request: Request) {
  const lead = (await request.json()) as Lead;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!lead.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: true, configured: false }, { status: 202 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from("leads").insert({
    email: lead.email,
    company_name: lead.companyName,
    name: lead.name,
    audit_input: lead.auditInput,
    audit_result: lead.auditResult
  }).select("id").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
