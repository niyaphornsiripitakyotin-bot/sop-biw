'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
type Supplier = { id:string;name:string;line_target_id:string;line_target_type:string };
type Item = { id:string;name:string;unit:string;price:number;supplier_id:string };
type User = { id:string;name:string;role:string;branch_id:string };

export default function OrderPage() {
  const [user,setUser]=useState<User|null>(null);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [items,setItems]=useState<Item[]>([]);
  const [selSup,setSelSup]=useState<Supplier|null>(null);
  const [qtys,setQtys]=useState<Record<string,string>>({});
  const [prices,setPrices]=useState<Record<string,string>>({});
  const [sending,setSending]=useState(false);
  const [success,setSuccess]=useState(false);
  const router=useRouter();

  useEffect(()=>{
    const u=localStorage.getItem('user');
    if(!u){router.push('/');return;}
    setUser(JSON.parse(u));
    supabase.from('suppliers').select('*').order('name').then(({data})=>setSuppliers(data||[]));
  },[]);

  useEffect(()=>{
    if(selSup){
      supabase.from('items').select('*').eq('supplier_id',selSup.id).eq('is_active',true).order('name')
        .then(({data})=>{setItems(data||[]);setQtys({});setPrices({});});
    }
  },[selSup]);

  const submitOrder=async()=>{
    if(!user||!selSup)return;
    const orderItems=items.filter(i=>qtys[i.id]&&parseFloat(qtys[i.id])>0);
    if(!orderItems.length){alert('กรุณากรอกจำนวนสินค้าอย่างน้อย 1 รายการ');return;}
    setSending(true);
    const {data:order}=await supabase.from('app_orders').insert({
      branch_id:user.branch_id,supplier_id:selSup.id,ordered_by:user.id,status:'sent',note:''
    }).select().single();
    if(order){
      await supabase.from('order_items').insert(orderItems.map(i=>({
        order_id:order.id,item_id:i.id,
        quantity:parseFloat(qtys[i.id]),
        unit_price:prices[i.id]?parseFloat(prices[i.id]):i.price
      })));
      await fetch('/api/send-line',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:order.id,isAmendment:false})});
    }
    setSending(false);setSuccess(true);
    setTimeout(()=>{setSuccess(false);setSelSup(null);setQtys({});},2000);
  };

  if(!user)return <div style={{padding:'20px',textAlign:'center'}}>กำลังโหลด...</div>;
  return(
    <div style={{maxWidth:'480px',margin:'0 auto',padding:'16px',minHeight:'100vh'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',padding:'12px 16px',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div><div style={{fontWeight:'700'}}>🦆 สั่งของ</div><div style={{fontSize:'12px',color:'#999'}}>{user.name}</div></div>
        <button onClick={()=>{localStorage.removeItem('user');router.push('/');}} style={{fontSize:'13px',color:'#999',background:'none',border:'none',cursor:'pointer'}}>ออก</button>
      </div>
      {success&&<div style={{background:'#d4edda',color:'#155724',padding:'16px',borderRadius:'12px',textAlign:'center',marginBottom:'16px',fontWeight:'600'}}>✅ ส่งออร์เดอร์สำเร็จ!</div>}
      {!selSup?(
        <div>
          <h2 style={{fontSize:'15px',fontWeight:'600',marginBottom:'12px',color:'#666'}}>เลือกซัพพลายเออร์</h2>
          {suppliers.map(s=>(
            <button key={s.id} onClick={()=>setSelSup(s)}
              style={{display:'block',width:'100%',padding:'16px',marginBottom:'10px',background:'#fff',border:'none',borderRadius:'12px',textAlign:'left',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',fontSize:'15px',fontWeight:'600'}}>
              {s.name}</button>
          ))}
        </div>
      ):(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <button onClick={()=>setSelSup(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>←</button>
            <h2 style={{fontSize:'16px',fontWeight:'700'}}>{selSup.name}</h2>
          </div>
          {items.map(item=>(
            <div key={item.id} style={{background:'#fff',borderRadius:'12px',padding:'14px 16px',marginBottom:'10px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'600',marginBottom:'8px'}}>{item.name} <span style={{fontWeight:'400',color:'#999',fontSize:'13px'}}>({item.unit})</span></div>
              <div style={{display:'flex',gap:'10px'}}>
                <input type='number' placeholder='จำนวน' value={qtys[item.id]||''} onChange={e=>setQtys(p=>({...p,[item.id]:e.target.value}))}
                  style={{flex:1,padding:'8px 12px',border:'1px solid #e5e5e5',borderRadius:'8px',fontSize:'14px'}} />
                <input type='number' placeholder={'ราคา'} value={prices[item.id]||''} onChange={e=>setPrices(p=>({...p,[item.id]:e.target.value}))}
                  style={{flex:1,padding:'8px 12px',border:'1px solid #e5e5e5',borderRadius:'8px',fontSize:'14px'}} />
              </div>
            </div>
          ))}
          <button onClick={submitOrder} disabled={sending}
            style={{width:'100%',padding:'16px',background:'#f0c040',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer',marginTop:'8px'}}>
            {sending?'กำลังส่ง...':'📤 ส่งออร์เดอร์'}</button>
        </div>
      )}
    </div>
  );
}