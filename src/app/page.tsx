'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePin = async (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setLoading(true); setError('');
      const { data } = await supabase.from('app_users').select('*').eq('pin', newPin).single();
      setLoading(false);
      if (!data) { setError('PIN ไม่ถูกต้อง'); setTimeout(() => setPin(''), 800); return; }
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'owner' || data.role === 'admin') router.push('/admin');
      else router.push('/order');
    }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'20px'}}>
      <div style={{background:'#fff',borderRadius:'20px',padding:'40px 30px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',maxWidth:'320px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'50px',marginBottom:'10px'}}>🦆</div>
        <h1 style={{fontSize:'20px',fontWeight:'700',color:'#b8860b',marginBottom:'6px'}}>Mama's Duck Order</h1>
        <p style={{color:'#999',fontSize:'14px',marginBottom:'30px'}}>กรอก PIN 4 หลัก</p>
        <div style={{display:'flex',gap:'12px',justifyContent:'center',marginBottom:'30px'}}>
          {[0,1,2,3].map(i => (<div key={i} style={{width:'16px',height:'16px',borderRadius:'50%',background: i < pin.length ? '#f0c040' : '#e5e5e5'}} />))}
        </div>
        {error && <p style={{color:'#e74c3c',fontSize:'13px',marginBottom:'16px'}}>{error}</p>}
        {loading && <p style={{color:'#999',fontSize:'13px',marginBottom:'16px'}}>กำลังตรวจสอบ...</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
          {['1','2','3','4','5','6','7','8','9','','0',String.fromCharCode(8592)].map((d, i) => (
            <button key={i} onClick={() => { if(d===String.fromCharCode(8592)){setPin(p=>p.slice(0,-1));setError('');}else if(d)handlePin(d); }}
              style={{padding:'18px',fontSize:'20px',fontWeight:'600',border:'none',borderRadius:'12px',cursor:d?'pointer':'default',background:d?'#fff5d6':'transparent',boxShadow:d?'0 2px 8px rgba(0,0,0,0.08)':'none'}}
              disabled={loading || !d}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}