import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get("orderId") || ""
  const amount = searchParams.get("amount") || "10"
  const desc = searchParams.get("desc") || "Pago de Puja"
  const successUrl = searchParams.get("successUrl") || "/"

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOWPayments — Pasarela Cripto (Modo Sandbox / Prueba)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body className="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2.5">
        <div class="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
          NP
        </div>
        <div>
          <h1 class="text-sm font-bold text-white leading-tight">NOWPayments Gateway</h1>
          <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Modo Simulado / Sandbox</span>
        </div>
      </div>
      <span class="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono">Test Mode</span>
    </div>

    <!-- Info del Pago -->
    <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400">Concepto:</span>
        <span class="font-bold text-white text-right max-w-[200px] truncate">${desc}</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400">ID de Orden:</span>
        <span class="font-mono text-[11px] text-slate-300">${orderId}</span>
      </div>
      <div class="pt-2 border-t border-slate-800 flex justify-between items-center">
        <span class="text-xs font-bold text-slate-300">Total a Pagar:</span>
        <span class="text-2xl font-black text-emerald-400">$${amount} USD</span>
      </div>
    </div>

    <!-- Selección de Criptomoneda Simulada -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-slate-300 block">Moneda de Pago Seleccionada:</label>
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-center font-bold text-emerald-300">
          USDT (TRC20)
        </div>
        <div class="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-center font-medium text-slate-400">
          SOL (Solana)
        </div>
        <div class="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-center font-medium text-slate-400">
          BTC (Bitcoin)
        </div>
      </div>
    </div>

    <!-- Botón de Simulación de Pago -->
    <div class="space-y-3 pt-2">
      <button
        id="payBtn"
        onclick="confirmMockPayment()"
        class="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Simular Pago Confirmado en Blockchain</span>
      </button>

      <a
        href="${successUrl}"
        class="block text-center text-xs text-slate-500 hover:text-slate-400 transition-colors"
      >
        Cancelar y volver a la web
      </a>
    </div>

    <div id="statusMsg" class="hidden p-3 rounded-xl text-xs font-medium text-center"></div>

  </div>

  <script>
    async function confirmMockPayment() {
      const btn = document.getElementById('payBtn');
      const statusMsg = document.getElementById('statusMsg');
      
      btn.disabled = true;
      btn.innerHTML = 'Procesando confirmación en blockchain...';
      btn.classList.add('opacity-70');

      try {
        const res = await fetch('/api/webhooks/nowpayments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_id: Math.floor(Math.random() * 10000000),
            order_id: "${orderId}",
            payment_status: "finished",
            price_amount: Number("${amount}"),
            price_currency: "usd",
            pay_amount: Number("${amount}"),
            pay_currency: "usdttrc20"
          })
        });

        const data = await res.json();

        if (res.ok) {
          statusMsg.classList.remove('hidden');
          statusMsg.className = 'p-3.5 rounded-xl text-xs font-bold text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          statusMsg.innerHTML = '✅ ¡Pago confirmado exitosamente! Redirigiendo a tu proyecto...';

          setTimeout(() => {
            window.location.href = "${successUrl}";
          }, 1500);
        } else {
          throw new Error(data.error || 'Error al procesar webhook');
        }
      } catch (err) {
        statusMsg.classList.remove('hidden');
        statusMsg.className = 'p-3 rounded-xl text-xs font-medium text-center bg-red-500/20 text-red-300 border border-red-500/30';
        statusMsg.innerHTML = 'Error: ' + err.message;
        btn.disabled = false;
        btn.innerHTML = 'Reintentar Simulación';
      }
    }
  </script>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
