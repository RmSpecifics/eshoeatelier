import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Save, LogOut } from 'lucide-react';
import { AtelierLayout } from '../components/atelier/layout';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import { lovable } from '../integrations/lovable';
import { collection, pageHead } from '../lib/collection';
import { pricesQuery } from '../lib/prices-query';
import { priceSchema } from '../lib/prices';

export const Route = createFileRoute('/pricing')({ head: () => pageHead('Pricing', 'Owner pricing management for the E\'SHOE ATELIER footwear collection.', '/pricing'), loader: ({ context }) => context.queryClient.ensureQueryData(pricesQuery), component: Pricing });
function Pricing() {
  const { data: prices } = useSuspenseQuery(pricesQuery);
  const client = useQueryClient();
  const [owner, setOwner] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setSignedIn(Boolean(user));
      if (!user) { setOwner(false); return; }
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (active) setOwner(data === true);
    }
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setTimeout(() => void check(), 0); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  async function authenticate() {
    setBusy(true); setMessage('');
    const result = register ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/pricing` } }) : await supabase.auth.signInWithPassword({ email, password });
    setMessage(result.error ? result.error.message : register ? 'Check your email to confirm your account, then sign in.' : 'Signed in.');
    setBusy(false);
  }
  async function social(provider: 'google' | 'lovable') {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/pricing` });
    if (result.error) setMessage('Sign-in could not be completed. Please try again.');
  }
  return <AtelierLayout><section className="pricing-page"><span className="eyebrow">THE ATELIER</span><h1>Pricing</h1>
    {!owner ? <div className="pricing-access">{signedIn ? <><p>This account does not have price-editing access.</p><Button variant="outline" onClick={() => void supabase.auth.signOut()}>Sign out <LogOut size={16} /></Button></> : <><h2>Owner sign-in</h2><form onSubmit={e => { e.preventDefault(); void authenticate(); }} className="fields"><label className="field">Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label className="field">Password<input required minLength={8} type="password" autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label><Button disabled={busy} type="submit">{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</Button><Button type="button" variant="link" onClick={() => setRegister(!register)}>{register ? 'Already have an account?' : 'Create owner account'}</Button></form><div className="pricing-signin-options"><Button variant="outline" onClick={() => void social('google')}>Continue with Google</Button><Button variant="outline" onClick={() => void social('lovable')}>Continue with Lovable</Button></div></>}</div> : <><div className="pricing-heading"><span>ZAR · South African rand</span><Button variant="ghost" onClick={() => void supabase.auth.signOut()}>Sign out <LogOut size={16} /></Button></div><div className="pricing-list">{collection.map(p => <PriceRow key={p.id} piece={p} price={prices[p.id]} saved={() => client.invalidateQueries({ queryKey: pricesQuery.queryKey })} />)}</div></>}
    {message && <p role="status">{message}</p>}
  </section></AtelierLayout>;
}
function PriceRow({ piece, price, saved }: { piece: typeof collection[number]; price?: number; saved: () => Promise<void> }) {
  const [amount, setAmount] = useState(price === undefined ? '' : String(price));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    const parsed = priceSchema.safeParse({ pieceId: piece.id, amount: Number(amount) });
    if (amount.trim() && !parsed.success) { setStatus('Enter a valid amount with up to two decimal places.'); return; }
    setBusy(true); setStatus('');
    try {
      const result = amount.trim() && parsed.success ? await supabase.from('product_prices').upsert({ piece_id: piece.id, amount: parsed.data.amount }) : await supabase.from('product_prices').delete().eq('piece_id', piece.id);
      if (result.error) throw result.error;
      await saved(); setStatus('Saved');
    } catch { setStatus('Price could not be saved. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form className="pricing-row" onSubmit={e => { e.preventDefault(); void save(); }}><img src={piece.images[0]} alt={piece.name} /><div><span className="eyebrow">{piece.colour} / {piece.category}</span><h2>{piece.name}</h2></div><label className="price-input"><span>Price (ZAR)</span><div><span>R</span><input aria-label={`Price for ${piece.name} ${piece.colour}`} type="number" min="0" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} /></div></label><Button type="submit" disabled={busy}><Save size={16} />{busy ? 'Saving…' : 'Save'}</Button>{status && <p className="price-save-status" role="status">{status}</p>}</form>;
}