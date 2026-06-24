import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function POST(req: NextRequest) {
    try {
          const body = await req.json();
          const events = body.events || [];

          for (const event of events) {
                  const source = event.source;

                  // รับ groupId เมื่อมีคนพิมพ์ในกลุ่ม
                  if (source?.type === 'group' && source?.groupId) {
                            const groupId = source.groupId;
                            const userId = source.userId || null;

                            // บันทึก groupId ลง Supabase ตาราง suppliers
                            // (log ไว้ก่อน เพื่อให้ admin ดูแล้วนำไปใส่ใน supplier)
                            console.log('[WEBHOOK] group event, groupId:', groupId, 'userId:', userId);

                            // เก็บลง webhook_logs (ถ้ามี) หรือ log ไว้ใน console
                            // admin จะไปดู logs บน Vercel แล้วเอา groupId ไปใส่ใน suppliers
                          }

                  // รับ event ประเภทอื่น (user, room)
                  if (source?.type === 'user') {
                            console.log('[WEBHOOK] user event, userId:', source.userId);
                          }
                }

          return NextResponse.json({ ok: true });
        } catch (err) {
          console.error('[WEBHOOK] error:', err);
          return NextResponse.json({ ok: false }, { status: 200 });
        }
  }

// LINE webhook verification (GET)
export async function GET() {
    return NextResponse.json({ ok: true });
  }
