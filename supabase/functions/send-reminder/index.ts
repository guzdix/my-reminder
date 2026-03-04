// supabase/functions/send-reminder/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import WebPush from 'https://esm.sh/web-push'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Dapatkan jam sekarang (Format HH:mm)
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  // 2. Cek tugas yang jamnya cocok dan belum selesai
  const { data: tasks } = await supabase
    .from('todos')
    .select('*')
    .eq('time', currentTime)
    .eq('is_completed', false);

  if (tasks && tasks.length > 0) {
    const { data: subs } = await supabase.from('subscribers').select('*');
    
    // Setup WebPush
    WebPush.setVapidDetails(
      'mailto:admin@bambukreatif.com',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    // 3. Kirim ke semua HP terdaftar
    for (const task of tasks) {
      for (const s of subs) {
        try {
          await WebPush.sendNotification(
            JSON.parse(s.subscription),
            JSON.stringify({ title: '🔔 ALARM!', body: task.title })
          );
        } catch (e) { console.error("Kirim gagal:", e); }
      }
    }
  }

  return new Response(JSON.stringify({ done: true }), { headers: { "Content-Type": "application/json" } });
})