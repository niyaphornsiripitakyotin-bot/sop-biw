import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { orderId, isAmendment } = await req.json();
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'No LINE token' }, { status: 500 });
  const { data: order } = await supabase.from('app_orders')
    .select('*, branches(name), app_users(name), suppliers(name, line_target_id, line_target_type), order_items(quantity, unit_price, items(name, unit))')
    .eq('id', orderId).single();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  const branch = (order.branches as any)?.name || '';
  const user = (order.app_users as any)?.name || '';
  const supplier = order.suppliers as any;
  const items = order.order_items as any[];
  const prefix = isAmendment ? String.fromCharCode(9888) + ' แก้ไขออร์เดอร์\n' : '';
  const itemLines = items.map((oi: any) => {
    const price = oi.unit_price > 0 ? ' ราคา ' + oi.unit_price : '';
    return '• ' + oi.items.name + ': ' + oi.quantity + ' ' + oi.items.unit + price;
  }).join('\n');
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', hour12: false });
  const message = prefix + String.fromCharCode(128230) + ' ออร์เดอร์ใหม่\nสาขา: ' + branch + '\nผู้สั่ง: ' + user + '\nเวลา: ' + now + '\n\n' + itemLines;
  const targetId = supplier?.line_target_id;
  if (!targetId) return NextResponse.json({ ok: true, note: 'No LINE target' });
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: targetId, messages: [{ type: 'text', text: message }] })
  });
  return NextResponse.json({ ok: true });
}