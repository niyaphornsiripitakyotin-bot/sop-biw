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
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'20px',background:'#fff8f0'}}>
      <div style={{background:'#fff',borderRadius:'24px',padding:'40px 30px',boxShadow:'0 4px 24px rgba(0,0,0,0.1)',maxWidth:'320px',width:'100%',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'8px'}}>
          <img src='/mascot.png' alt='mascot' style={{width:'120px',height:'120px',objectFit:'contain'}} />
        </div>
        <h1 style={{fontSize:'20px',fontWeight:'700',color:'#c0392b',marginBottom:'6px'}}>Mama Duck Order</h1>
        <p style={{color:'#999',fontSize:'14px',marginBottom:'30px'}}>กรอก PIN 4 หลัก</p>
        <div style={{display:'flex',gap:'12px',justifyContent:'center',marginBottom:'30px'}}>
          {[0,1,2,3].map(i => (<div key={i} style={{width:'16px',height:'16px',borderRadius:'50%',background: i < pin.length ? '#e74c3c' : '#e5e5e5'}} />))}
        </div>
        {error && <p style={{color:'#e74c3c',fontSize:'13px',marginBottom:'16px'}}>{error}</p>}
        {loading && <p style={{color:'#999',fontSize:'13px',marginBottom:'16px'}}>กำลังตรวจสอบ...</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
          {['1','2','3','4','5','6','7','8','9','','0','\u2190'].map((d, i) => (
            <button key={i} onClick={() => { if(d==='\u2190'){setPin(p=>p.slice(0,-1));setError('');}else if(d)handlePin(d); }}
              style={{padding:'18px',fontSize:'20px',fontWeight:'600',border:'none',borderRadius:'12px',cursor:d?'pointer':'default',background:d?'#fff5f5':'transparent',boxShadow:d?'0 2px 8px rgba(0,0,0,0.08)':'none',color:'#c0392b'}}
              disabled={loading || !d}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
