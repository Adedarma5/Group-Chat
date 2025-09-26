import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone dibutuhkan" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase.from("otps").insert({ phone, code: otp });
    if (error) return NextResponse.json({ error: "Gagal simpan OTP" }, { status: 500 });

    console.log(`OTP untuk ${phone} = ${otp}`); 
    return NextResponse.json({ message: "OTP terkirim", otp }); 
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
