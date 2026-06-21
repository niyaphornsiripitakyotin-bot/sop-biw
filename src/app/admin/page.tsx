'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
type Tab = 'users'|'branches'|'suppliers'|'items'|'orders';
type User={id:string;name:string;pin:string;role:string;branch_id:string|null};
type Branch={id:string;name:string};
type Supplier={id:string;name:string;line_target_id:string;line_target_type:string};
type Item={id:string;name:string;unit:string;price:number;supplier_id:string;is_active:boolean};
const S={card:{background:'#fff',borderRadius:'12px',padding:'16px',marginBottom:'10px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  btn:{padding:'8px 16px',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'},
  input:{width:'100%',padding:'8px 12px',border:'1px solid #e5e5e5',borderRadius:'8px',fontSize:'14px',marginBottom:'8px'},
  label:{fontSize:'12px',color:'#666',marginBottom:'4px',display:'block'}};
export default function AdminPage() {
  const [tab,setTab]=useState<Tab>('users');
  const [admin,setAdmin]=useState<any>(null);
  const [users,setUsers]=useState<User[]>([]);
  const [branches,setBranches]=useState<Branch[]>([]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [items,setItems]=useState<Item[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [form,setForm]=useState<any>({});
  const [editId,setEditId]=useState<string|null>(null);
  const router=useRouter();
  useEffect(()=>{
    const u=localStorage.getItem('user');
    if(!u){router.push('/');return;}
    const ud=JSON.parse(u);
    if(ud.role==='staff'){router.push('/order');return;}
    setAdmin(ud);
    loadAll();
  },[]);
  const loadAll=async()=>{
    const [u,b,s,i,o]=await Promise.all([
      supabase.from('app_users').select('*').order('name'),
      supabase.from('branches').select('*').order('name'),
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('items').select('*').order('name'),
      supabase.from('app_orders').select('*,branches(name),app_users(name),suppliers(name)').order('created_at',{ascending:false}).limit(50)
    ]);
    setUsers(u.data||[]);setBranches(b.data||[]);setSuppliers(s.data||[]);setItems(i.data||[]);setOrders(o.data||[]);
  };
  const save=async()=>{
    if(tab==='users'){
      if(!form.name||!form.pin||!form.role){alert('กรุณากรอกข้อมูลให้ครบ');return;}
      if(editId) await supabase.from('app_users').update({name:form.name,pin:form.pin,role:form.role,branch_id:form.branch_id||null}).eq('id',editId);
      else await supabase.from('app_users').insert({name:form.name,pin:form.pin,role:form.role,branch_id:form.branch_id||null});
    } else if(tab==='branches'){
      if(!form.name){alert('กรุณากรอกชื่อสาขา');return;}
      if(editId) await supabase.from('branches').update({name:form.name}).eq('id',editId);
      else await supabase.from('branches').insert({name:form.name});
    } else if(tab==='suppliers'){
      if(!form.name){alert('กรุณากรอกชื่อซัพ');return;}
      if(editId) await supabase.from('suppliers').update({name:form.name,line_target_id:form.line_target_id||'',line_target_type:form.line_target_type||'group'}).eq('id',editId);
      else await supabase.from('suppliers').insert({name:form.name,line_target_id:form.line_target_id||'',line_target_type:form.line_target_type||'group'});
    } else if(tab==='items'){
      if(!form.name||!form.unit||!form.supplier_id){alert('กรุณากรอกข้อมูลให้ครบ');return;}
      if(editId) await supabase.from('items').update({name:form.name,unit:form.unit,price:parseFloat(form.price)||0,supplier_id:form.supplier_id,is_active:form.is_active!==false}).eq('id',editId);
      else await supabase.from('items').insert({name:form.name,unit:form.unit,price:parseFloat(form.price)||0,supplier_id:form.supplier_id,is_active:true});
    }
    setForm({});setEditId(null);loadAll();
  };
  const del=async(id:string)=>{
    if(!confirm('ยืนยันการลบ?'))return;
    if(tab==='users') await supabase.from('app_users').delete().eq('id',id);
    else if(tab==='branches') await supabase.from('branches').delete().eq('id',id);
    else if(tab==='suppliers') await supabase.from('suppliers').delete().eq('id',id);
    else if(tab==='items') await supabase.from('items').delete().eq('id',id);
    loadAll();
  };
  const edit=(item:any)=>{setEditId(item.id);setForm({...item});};
  const tabs:Tab[]=['users','branches','suppliers','items','orders'];
  const tabLabels:Record<Tab,string>={users:'👤 ผู้ใช้',branches:'🏪 สาขา',suppliers:'🚚 ซัพ',items:'📦 สินค้า',orders:'📋 ออร์เดอร์'};
  if(!admin)return <div style={{padding:'20px',textAlign:'center'}}>กำลังโหลด...</div>;
  return(
    <div style={{maxWidth:'600px',margin:'0 auto',padding:'16px',minHeight:'100vh'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',padding:'12px 16px',...S.card}}>
        <div><div style={{fontWeight:'700'}}>⚙️ Admin Panel</div><div style={{fontSize:'12px',color:'#999'}}>{admin.name}</div></div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={()=>router.push('/order')} style={{...S.btn,background:'#fff5d6'}}>สั่งของ</button>
          <button onClick={()=>{localStorage.removeItem('user');router.push('/');}} style={{...S.btn,background:'#f8d7da',color:'#721c24'}}>ออก</button>
        </div>
      </div>
      <div style={{display:'flex',gap:'6px',marginBottom:'16px',overflowX:'auto',paddingBottom:'4px'}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>{setTab(t);setForm({});setEditId(null);}}
            style={{...S.btn,background:tab===t?'#f0c040':'#fff',whiteSpace:'nowrap',flexShrink:0,boxShadow:'0 2px 6px rgba(0,0,0,0.06)'}}>{tabLabels[t]}</button>
        ))}
      </div>
      {tab!=='orders'&&(
        <div style={S.card}>
          <h3 style={{fontWeight:'700',marginBottom:'12px',fontSize:'14px'}}>{editId?'แก้ไข':'เพิ่มใหม่'}</h3>
          {tab==='users'&&(<>
            <label style={S.label}>ชื่อ</label><input style={S.input} value={form.name||''} onChange={e=>setForm((p:any)=>({...p,name:e.target.value}))} placeholder='ชื่อพนักงาน' />
            <label style={S.label}>PIN 4 หลัก</label><input style={S.input} value={form.pin||''} onChange={e=>setForm((p:any)=>({...p,pin:e.target.value}))} placeholder='1234' maxLength={4} />
            <label style={S.label}>Role</label>
            <select style={{...S.input,marginBottom:'8px'}} value={form.role||''} onChange={e=>setForm((p:any)=>({...p,role:e.target.value}))}>
              <option value=''>-- เลือก Role --</option>
              <option value='owner'>owner</option><option value='admin'>admin</option><option value='staff'>staff</option>
            </select>
            {form.role==='staff'&&(<><label style={S.label}>สาขา</label>
            <select style={{...S.input}} value={form.branch_id||''} onChange={e=>setForm((p:any)=>({...p,branch_id:e.target.value}))}>
              <option value=''>-- เลือกสาขา --</option>
              {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select></>)}
          </>)}
          {tab==='branches'&&(<><label style={S.label}>ชื่อสาขา</label><input style={S.input} value={form.name||''} onChange={e=>setForm((p:any)=>({...p,name:e.target.value}))} placeholder='สาขา...' /></>)}
          {tab==='suppliers'&&(<>
            <label style={S.label}>ชื่อร้าน</label><input style={S.input} value={form.name||''} onChange={e=>setForm((p:any)=>({...p,name:e.target.value}))} placeholder='ชื่อซัพ' />
            <label style={S.label}>LINE Target ID</label><input style={S.input} value={form.line_target_id||''} onChange={e=>setForm((p:any)=>({...p,line_target_id:e.target.value}))} placeholder='C... หรือ U...' />
            <label style={S.label}>ประเภท LINE</label>
            <select style={S.input} value={form.line_target_type||'group'} onChange={e=>setForm((p:any)=>({...p,line_target_type:e.target.value}))}>
              <option value='group'>group</option><option value='user'>user</option>
            </select>
          </>)}
          {tab==='items'&&(<>
            <label style={S.label}>ซัพพลายเออร์</label>
            <select style={S.input} value={form.supplier_id||''} onChange={e=>setForm((p:any)=>({...p,supplier_id:e.target.value}))}>
              <option value=''>-- เลือกซัพ --</option>
              {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label style={S.label}>ชื่อสินค้า</label><input style={S.input} value={form.name||''} onChange={e=>setForm((p:any)=>({...p,name:e.target.value}))} placeholder='ชื่อสินค้า' />
            <label style={S.label}>หน่วย</label><input style={S.input} value={form.unit||''} onChange={e=>setForm((p:any)=>({...p,unit:e.target.value}))} placeholder='กก / ลัง / ตัว' />
            <label style={S.label}>ราคา (0 = ไม่กำหนด)</label><input type='number' style={S.input} value={form.price||0} onChange={e=>setForm((p:any)=>({...p,price:e.target.value}))} />
            {editId&&<label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'14px',marginBottom:'8px'}}><input type='checkbox' checked={form.is_active!==false} onChange={e=>setForm((p:any)=>({...p,is_active:e.target.checked}))} />เปิดใช้งาน</label>}
          </>)}
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={save} style={{...S.btn,background:'#f0c040',flex:1}}>💾 บันทึก</button>
            {editId&&<button onClick={()=>{setForm({});setEditId(null);}} style={{...S.btn,background:'#e5e5e5'}}>ยกเลิก</button>}
          </div>
        </div>
      )}
      <div>
        {tab==='users'&&users.map(u=>(
          <div key={u.id} style={{...S.card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontWeight:'600'}}>{u.name}</div><div style={{fontSize:'12px',color:'#999'}}>{u.role} • PIN: {u.pin}</div></div>
            <div style={{display:'flex',gap:'6px'}}><button onClick={()=>edit(u)} style={{...S.btn,background:'#fff5d6'}}>แก้ไข</button><button onClick={()=>del(u.id)} style={{...S.btn,background:'#f8d7da',color:'#721c24'}}>ลบ</button></div>
          </div>
        ))}
        {tab==='branches'&&branches.map(b=>(
          <div key={b.id} style={{...S.card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontWeight:'600'}}>{b.name}</div>
            <div style={{display:'flex',gap:'6px'}}><button onClick={()=>edit(b)} style={{...S.btn,background:'#fff5d6'}}>แก้ไข</button><button onClick={()=>del(b.id)} style={{...S.btn,background:'#f8d7da',color:'#721c24'}}>ลบ</button></div>
          </div>
        ))}
        {tab==='suppliers'&&suppliers.map(s=>(
          <div key={s.id} style={{...S.card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontWeight:'600'}}>{s.name}</div><div style={{fontSize:'12px',color:'#999'}}>{s.line_target_type}: {s.line_target_id||'ยังไม่ตั้ง'}</div></div>
            <div style={{display:'flex',gap:'6px'}}><button onClick={()=>edit(s)} style={{...S.btn,background:'#fff5d6'}}>แก้ไข</button><button onClick={()=>del(s.id)} style={{...S.btn,background:'#f8d7da',color:'#721c24'}}>ลบ</button></div>
          </div>
        ))}
        {tab==='items'&&items.map(i=>(
          <div key={i.id} style={{...S.card,display:'flex',justifyContent:'space-between',alignItems:'center',opacity:i.is_active?1:0.5}}>
            <div><div style={{fontWeight:'600'}}>{i.name} <span style={{fontSize:'12px',color:'#999'}}>({i.unit})</span></div><div style={{fontSize:'12px',color:'#999'}}>ราคา: {i.price||'-'} • {suppliers.find(s=>s.id===i.supplier_id)?.name||''}</div></div>
            <div style={{display:'flex',gap:'6px'}}><button onClick={()=>edit(i)} style={{...S.btn,background:'#fff5d6'}}>แก้ไข</button><button onClick={()=>del(i.id)} style={{...S.btn,background:'#f8d7da',color:'#721c24'}}>ลบ</button></div>
          </div>
        ))}
        {tab==='orders'&&orders.map(o=>(
          <div key={o.id} style={{...S.card}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
              <span style={{fontWeight:'600'}}>{(o.branches as any)?.name}</span>
              <span style={{fontSize:'12px',color:'#999'}}>{new Date(o.created_at).toLocaleDateString('th-TH')}</span>
            </div>
            <div style={{fontSize:'13px',color:'#666'}}>{(o.suppliers as any)?.name} • {(o.app_users as any)?.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}