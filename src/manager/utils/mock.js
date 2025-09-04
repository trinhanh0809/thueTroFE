const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const currency = (n) =>
  n?.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function randomWalk(n = 12, start = 6000, step = 4500) {
  const arr = [];
  let val = start + Math.random() * step;
  for (let i = 0; i < n; i++) {
    val = Math.max(2500, val + (Math.random() - 0.25) * step);
    arr.push(Math.round(val / 100) * 100);
  }
  return arr;
}

export function genMock() {
  const amounts = randomWalk(12, 5000, 6000);
  const earnings = amounts.map((v, i) => ({ label: MONTHS[i], value: v }));

  const monthlyEarnings = earnings[earnings.length - 1].value;
  const annualEarnings = amounts.reduce((a, b) => a + b, 0);
  const tasks = Math.floor(35 + Math.random() * 50);
  const pendingRequests = Math.floor(8 + Math.random() * 20);

  // split theo kênh
  let a = Math.random(), b = Math.random(), c = Math.random();
  const s = a + b + c; a/=s; b/=s; c/=s;
  const revenueSources = [
    { label: "Direct", value: Math.round(monthlyEarnings * a) },
    { label: "Social", value: Math.round(monthlyEarnings * b) },
    { label: "Referral", value: Math.round(monthlyEarnings * c) },
  ];

  return {
    cards: { monthlyEarnings, annualEarnings, tasks, pendingRequests },
    charts: { earnings, revenueSources },
  };
}
