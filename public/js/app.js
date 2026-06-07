// ============================================================
//  RSVP — 15 Anos | Frontend
//  Cole aqui a URL gerada na "Nova Implantação" do Apps Script
// ============================================================
const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxIopYT1H1CWzmxAtu7xbjSVvteL8wGp9LmY497IAiw753UIlVzjvfKSN1sc3uMkqBylg/exec";

// --- Seletores ---
const form = document.getElementById("rsvpForm");
const attendanceOptions = document.getElementsByName("attendance");
const attendanceDependentFields = document.getElementById(
  "attendance_dependent_fields",
);
const companionsCount = document.getElementById("companions_count");
const companionsSection = document.getElementById("companions_section");
const companionsNames = document.getElementById("companions_names");
const btnSubmit = document.getElementById("btnSubmit");
const successMessage = document.getElementById("successMessage");

// --- Lógica: mostrar/ocultar campos de acompanhantes ---
if (attendanceOptions) {
  attendanceOptions.forEach((option) => {
    option.addEventListener("change", (e) => {
      if (e.target.value === "Não poderei ir") {
        if (attendanceDependentFields)
          attendanceDependentFields.style.display = "none";
        if (companionsCount) companionsCount.value = "0";
        if (companionsSection) companionsSection.style.display = "none";
        if (companionsNames) {
          companionsNames.required = false;
          companionsNames.value = "";
        }
      } else {
        if (attendanceDependentFields)
          attendanceDependentFields.style.display = "block";
      }
    });
  });
}

if (companionsCount) {
  companionsCount.addEventListener("change", (e) => {
    if (parseInt(e.target.value) > 0) {
      if (companionsSection) companionsSection.style.display = "block";
      if (companionsNames) companionsNames.required = true;
    } else {
      if (companionsSection) companionsSection.style.display = "none";
      if (companionsNames) {
        companionsNames.required = false;
        companionsNames.value = "";
      }
    }
  });
}

// --- Resposta após envio ---
function handleResponse(response) {
  // com mode:"no-cors" a resposta é sempre opaque (type==="opaque"),
  // então qualquer retorno sem throw significa sucesso
  const ok = response.ok || response.type === "opaque";
  if (!ok) throw new Error("Network response was not ok");

  const attendance = document.querySelector(
    'input[name="attendance"]:checked',
  ).value;
  form.style.display = "none";

  if (attendance === "Não") {
    successMessage.innerHTML = `Obrigada pela resposta! 💖
            <small>Vou sentir sua falta, mas agradeço por me avisar.</small>`;
  } else {
    successMessage.innerHTML = `Presença Confirmada! ✨
            <small>Te espero na minha festa, vai ser incrível!</small>`;
  }
  successMessage.style.display = "block";
}

// --- Envio do formulário ---
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!WEBHOOK_URL || !WEBHOOK_URL.includes("script.google.com")) {
      alert(
        "ATENÇÃO: Cole a URL do seu Web App do Google Apps Script na variável WEBHOOK_URL.",
      );
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Enviando...";

    const formData = new FormData(form);
    const attendance = document.querySelector(
      'input[name="attendance"]:checked',
    ).value;
    const naoVai = attendance === "Não poderei ir";

    const payload = new URLSearchParams({
      nome: formData.get("fullname") || "",
      presenca: attendance,
      acompanhantes: naoVai ? "0" : formData.get("companions_count") || "0",
      nomes_acompanhantes: naoVai ? "" : formData.get("companions_names") || "",
      mensagem: formData.get("message") || "",
    });

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
      });

      handleResponse(response);
    } catch (error) {
      console.error("Erro ao enviar RSVP:", error);
      alert(
        "Ops! Não foi possível enviar sua confirmação. Verifique sua conexão e tente novamente.",
      );
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Confirmar Presença!";
    }
  });
}

// ===================== ANIMAÇÃO DA BOLA =====================
(function () {
  const ball = document.getElementById("ball");
  const shadow = document.getElementById("ballShadow");
  const flash = document.getElementById("flash");
  const sparks = document.getElementById("sparks");
  const net = document.getElementById("net");
  const trail = document.getElementById("trail");
  const t1 = document.getElementById("t1");
  const t2 = document.getElementById("t2");

  // Se os elementos da bola não existirem na página atual, aborta a animação para não gerar erro
  if (!ball || !shadow) return;

  const START = { x: 30, y: 220 };
  const PEAK = { x: 100, y: 18 };
  const RIM = { x: 186, y: 100 };
  const TOTAL_ROT = -540;
  const RISE_DUR = 620;
  const FALL_DUR = 480;
  const PAUSE_DUR = 1200;
  const FLASH_DUR = 300;
  const NET_DUR = 600;

  let startTime = null;
  let phase = "rise";

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeIn(t) {
    return t * t * t;
  }

  function bezier(t, p0, p1, p2) {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
  }

  function ballScale(phase, t) {
    if (phase === "rise") return 1.0 - 0.3 * t;
    if (phase === "fall") return 0.7 + 0.18 * t;
    return 0.88;
  }

  let netOrigLines = null;

  function saveNetLines() {
    if (!net) return;
    netOrigLines = Array.from(net.querySelectorAll("line")).map((l) => ({
      x1: l.getAttribute("x1"),
      y1: l.getAttribute("y1"),
      x2: l.getAttribute("x2"),
      y2: l.getAttribute("y2"),
    }));
  }

  function restoreNetLines() {
    if (!netOrigLines || !net) return;
    Array.from(net.querySelectorAll("line")).forEach((l, i) => {
      l.setAttribute("x1", netOrigLines[i].x1);
      l.setAttribute("y1", netOrigLines[i].y1);
      l.setAttribute("x2", netOrigLines[i].x2);
      l.setAttribute("y2", netOrigLines[i].y2);
    });
  }

  saveNetLines();

  function showFlash() {
    if (!flash) return;
    flash.setAttribute("r", "0");
    flash.setAttribute("opacity", "0.9");
    let s = performance.now();
    function ani(now) {
      let p = (now - s) / FLASH_DUR;
      if (p > 1) {
        flash.setAttribute("opacity", "0");
        return;
      }
      flash.setAttribute("r", String(60 * p));
      flash.setAttribute("opacity", String(0.9 * (1 - p)));
      requestAnimationFrame(ani);
    }
    requestAnimationFrame(ani);
  }

  function showSparks() {
    if (!sparks) return;
    sparks.setAttribute("opacity", "1");
    const lines = sparks.querySelectorAll("line");
    const base = [
      { x1: 186, y1: 108, x2: 186, y2: 88 },
      { x1: 186, y1: 108, x2: 206, y2: 92 },
      { x1: 186, y1: 108, x2: 166, y2: 92 },
      { x1: 186, y1: 108, x2: 210, y2: 108 },
      { x1: 186, y1: 108, x2: 162, y2: 108 },
    ];
    let s = performance.now();
    function ani(now) {
      let p = (now - s) / 400;
      if (p > 1) {
        sparks.setAttribute("opacity", "0");
        return;
      }
      lines.forEach((l, i) => {
        const b = base[i];
        const dx = (b.x2 - b.x1) * p * 1.8;
        const dy = (b.y2 - b.y1) * p * 1.8;
        l.setAttribute("x2", String(b.x1 + dx));
        l.setAttribute("y2", String(b.y1 + dy));
        l.setAttribute("opacity", String(1 - p));
      });
      requestAnimationFrame(ani);
    }
    requestAnimationFrame(ani);
  }

  function animateNet() {
    if (!net) return;
    restoreNetLines();
    const ampMax = [3, 5, 6, 6, 5, 4, 3];
    let s = performance.now();
    function ani(now) {
      let p = (now - s) / NET_DUR;
      if (p > 1) {
        restoreNetLines();
        return;
      }
      const wave = Math.sin(p * Math.PI * 3) * (1 - p);
      Array.from(net.querySelectorAll("line")).forEach((l, i) => {
        const orig = netOrigLines[i];
        const amp = ampMax[i] * wave;
        const x2New = parseFloat(orig.x2) + amp;
        const y2New = parseFloat(orig.y2) + Math.abs(amp) * 0.4;
        l.setAttribute("x2", x2New.toFixed(1));
        l.setAttribute("y2", y2New.toFixed(1));
      });
      requestAnimationFrame(ani);
    }
    requestAnimationFrame(ani);
  }

  function step(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    if (phase === "rise") {
      const t = Math.min(elapsed / RISE_DUR, 1);
      const et = easeOut(t);
      const x = bezier(et, START.x, PEAK.x, PEAK.x + 30);
      const y = bezier(et, START.y, PEAK.y, PEAK.y + 10);
      const rot = TOTAL_ROT * 0.6 * t;
      const sc = ballScale("rise", t);
      ball.setAttribute(
        "transform",
        `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`,
      );

      if (t > 0.1 && trail && t1 && t2) {
        const pt = Math.max(t - 0.08, 0);
        const px = bezier(easeOut(pt), START.x, PEAK.x, PEAK.x + 30);
        const py = bezier(easeOut(pt), START.y, PEAK.y, PEAK.y + 10);
        trail.setAttribute("opacity", String(0.5 * (1 - t)));
        t1.setAttribute(
          "transform",
          `translate(${px.toFixed(1)},${py.toFixed(1)})`,
        );
        const pt2 = Math.max(t - 0.16, 0);
        const px2 = bezier(easeOut(pt2), START.x, PEAK.x, PEAK.x + 30);
        const py2 = bezier(easeOut(pt2), START.y, PEAK.y, PEAK.y + 10);
        t2.setAttribute(
          "transform",
          `translate(${px2.toFixed(1)},${py2.toFixed(1)})`,
        );
      }

      shadow.setAttribute("opacity", String(0.6 * (1 - t)));

      if (t >= 1) {
        phase = "fall";
        startTime = ts;
      }
    } else if (phase === "fall") {
      const t = Math.min(elapsed / FALL_DUR, 1);
      const et = easeIn(t);
      const x = bezier(et, PEAK.x + 30, (PEAK.x + RIM.x) / 2 + 20, RIM.x);
      const y = bezier(et, PEAK.y + 10, (PEAK.y + RIM.y) / 2 - 10, RIM.y);
      const rot = TOTAL_ROT * 0.6 + TOTAL_ROT * 0.4 * t;
      const sc = ballScale("fall", t);
      ball.setAttribute(
        "transform",
        `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`,
      );
      if (trail) trail.setAttribute("opacity", String(0.3 * t));

      shadow.setAttribute("cx", String(186 + (1 - t) * 40));
      shadow.setAttribute("opacity", String(0.5 * t));

      if (t >= 1) {
        phase = "score";
        startTime = ts;
        showFlash();
        showSparks();
        animateNet();
        if (trail) trail.setAttribute("opacity", "0");
      }
    } else if (phase === "score") {
      const t = Math.min(elapsed / 500, 1);
      const x = RIM.x;
      const y = RIM.y + 60 * t;
      const sc = 0.88 - 0.15 * t;
      ball.setAttribute(
        "transform",
        `translate(${x},${y.toFixed(1)}) scale(${sc.toFixed(3)})`,
      );
      ball.setAttribute("opacity", String(1 - t * 0.6));
      shadow.setAttribute("opacity", String(0.4 * (1 - t)));
      if (t >= 1) {
        phase = "pause";
        startTime = ts;
        ball.setAttribute("opacity", "0");
      }
    } else if (phase === "pause") {
      if (elapsed >= PAUSE_DUR) {
        phase = "rise";
        startTime = null;
        ball.setAttribute("opacity", "1");
        ball.setAttribute("transform", `translate(${START.x},${START.y})`);
        restoreNetLines();
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
