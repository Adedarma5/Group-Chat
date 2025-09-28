import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code)
      return NextResponse.json({ error: "Phone dan code dibutuhkan" }, { status: 400 });

    const { data: otpData, error } = await supabase
      .from("otps")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpData || otpData.code !== code)
      return NextResponse.json({ error: "OTP salah atau expired" }, { status: 400 });

    await supabase.from("otps").delete().eq("id", otpData.id);

    const { error: userError, data: initialUser } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (userError && userError.code !== "PGRST116")
      return NextResponse.json({ error: userError.message }, { status: 500 });

    let user = initialUser;

    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({ phone, created_at: new Date() })
        .select()
        .single();

      if (insertError || !newUser)
        return NextResponse.json({ error: "Gagal membuat user baru" }, { status: 500 });

      user = newUser;
    }

    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
