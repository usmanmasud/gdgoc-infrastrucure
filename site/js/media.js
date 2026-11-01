/* InfraTrack media: draws the Learners of the Week flyer and certificates on <canvas>. */
window.InfraMedia = (() => {
  const G = { blue: "#4285F4", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
  const INK = "#1f1f1f", MUTED = "#5f6368", LINE = "#e0e3e7", SOFT = "#f1f3f4";
  const SANS = '"Google Sans", Roboto, Arial, sans-serif';
  const font = (weight, size) => `${weight} ${size}px ${SANS}`;

  async function fontsReady() {
    try {
      await Promise.all(["400", "500", "700"].map((w) => document.fonts.load(font(w, 40))));
      await document.fonts.ready;
    } catch {}
  }

  // Resolves to an Image, or null if it can't be loaded (or would taint the canvas).
  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
      setTimeout(() => resolve(null), 8000);
    });
  }

  // Reads an uploaded image file and returns a square JPEG data URL (centre-cropped).
  function photoFromFile(file, size = 256) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("Choose an image file"));
      const r = new FileReader();
      r.onerror = () => reject(new Error("Couldn't read that file"));
      r.onload = async () => {
        const img = await loadImage(r.result);
        if (!img) return reject(new Error("Couldn't open that image"));
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const s = Math.min(img.width, img.height);
        c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      r.readAsDataURL(file);
    });
  }

  function wrap(ctx, text, maxW, maxLines = Infinity) {
    const words = String(text || "").split(/\s+/).filter(Boolean), lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width <= maxW || !line) line = test;
      else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      let last = kept[maxLines - 1];
      while (last && ctx.measureText(last + "…").width > maxW) last = last.slice(0, -1);
      kept[maxLines - 1] = last.trimEnd() + "…";
      return kept;
    }
    return lines;
  }

  function text(ctx, str, x, y, { f, color = INK, align = "left", spacing = 0 } = {}) {
    ctx.font = f; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "alphabetic";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(str, x, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }

  function brandBar(ctx, x, y, w, h) {
    [G.blue, G.red, G.yellow, G.green].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x + (w / 4) * i, y, w / 4 + 1, h); });
  }

  // The GDG "< >" mark. (x, y) is the centre; size is the total width.
  function logo(ctx, x, y, size) {
    const s = size / 48, line = (c, x1, y1, x2, y2) => {
      ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(x + (x1 - 24) * s, y + (y1 - 12) * s); ctx.lineTo(x + (x2 - 24) * s, y + (y2 - 12) * s); ctx.stroke();
    };
    ctx.lineWidth = 4.5 * s; ctx.lineCap = "round";
    line(G.red, 14, 4, 4, 12); line(G.blue, 4, 12, 14, 20); line(G.green, 34, 4, 44, 12); line(G.yellow, 44, 12, 34, 20);
  }

  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function avatar(ctx, img, name, cx, cy, r, ring) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (img) {
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = ring; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      text(ctx, initials(name), cx, cy + r * 0.28, { f: font(500, r * 0.8), color: "#fff", align: "center" });
    }
    ctx.restore();
    ctx.lineWidth = Math.max(6, r * 0.07); ctx.strokeStyle = ring;
    ctx.beginPath(); ctx.arc(cx, cy, r + ctx.lineWidth / 2, 0, Math.PI * 2); ctx.stroke();
  }

  function rankBadge(ctx, n, cx, cy, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = "#fff"; ctx.stroke();
    text(ctx, String(n), cx, cy + 12, { f: font(700, 32), color: n === 1 ? "#3c2a00" : "#fff", align: "center" });
  }

  /**
   * Learners of the Week flyer, 1080 × 1350 (portrait, fits WhatsApp/Instagram).
   * d = { eyebrow, title, winners: [{ name, sub, highlight, photo }], message, footerLeft, footerRight }
   */
  async function flyer(canvas, d) {
    await fontsReady();
    const W = 1080, H = 1350, ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    brandBar(ctx, 0, 0, W, 14);

    logo(ctx, 112, 92, 72);
    text(ctx, "GDG on Campus · Bayero University Kano", 172, 86, { f: font(500, 28) });
    text(ctx, "Infrastructure Cluster", 172, 122, { f: font(400, 24), color: MUTED });

    text(ctx, d.eyebrow.toUpperCase(), 80, 236, { f: font(500, 24), color: MUTED, spacing: 3 });
    text(ctx, "Learners of", 76, 330, { f: font(700, 96) });
    text(ctx, "the Week", 76, 432, { f: font(700, 96), color: G.blue });
    brandBar(ctx, 80, 462, 240, 8);

    const winners = d.winners.slice(0, 3), n = winners.length;
    const rings = [G.yellow, G.blue, G.green];
    const imgs = await Promise.all(winners.map((w) => loadImage(w.photo)));
    const top = 540, colW = (W - 120) / Math.max(n, 1), r = n === 1 ? 150 : n === 2 ? 130 : 112;
    winners.forEach((w, i) => {
      const cx = 60 + colW * i + colW / 2, cy = top + r;
      avatar(ctx, imgs[i], w.name, cx, cy, r, rings[i]);
      if (n > 1) rankBadge(ctx, i + 1, cx + r * 0.72, cy + r * 0.72, rings[i]);
      const tw = colW - 36;
      let y = cy + r + 72;
      ctx.font = font(700, n === 1 ? 44 : 36);
      for (const l of wrap(ctx, w.name, tw, 2)) { text(ctx, l, cx, y, { f: font(700, n === 1 ? 44 : 36), align: "center" }); y += n === 1 ? 52 : 44; }
      ctx.font = font(400, 24);
      for (const l of wrap(ctx, w.sub, tw, 2)) { text(ctx, l, cx, y, { f: font(400, 24), color: MUTED, align: "center" }); y += 32; }
      y += 10;
      ctx.font = font(500, 25);
      for (const l of wrap(ctx, w.highlight, tw, 3)) { text(ctx, l, cx, y, { f: font(500, 25), color: INK, align: "center" }); y += 34; }
    });

    if (d.message) {
      ctx.fillStyle = SOFT;
      roundRect(ctx, 80, 1110, W - 160, 120, 24); ctx.fill();
      ctx.font = font(500, 30);
      const lines = wrap(ctx, d.message, W - 240, 2);
      const y0 = 1110 + 60 - (lines.length - 1) * 20 + 10;
      lines.forEach((l, i) => text(ctx, l, W / 2, y0 + i * 40, { f: font(500, 30), align: "center" }));
    }

    text(ctx, d.footerLeft || "", 80, 1290, { f: font(500, 24), color: MUTED });
    text(ctx, d.footerRight || "", W - 80, 1290, { f: font(700, 24), color: G.blue, align: "right" });
    brandBar(ctx, 0, H - 14, W, 14);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /**
   * Certificate, 2000 × 1414 (A4 landscape ratio).
   * c = { id, name, type, issuedAt }, o = { chapter, cluster, track, period, topics, signatories, verifyUrl, weeks }
   */
  async function certificate(canvas, c, o) {
    await fontsReady();
    const W = 2000, H = 1414, ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    brandBar(ctx, 0, 0, W, 18);
    brandBar(ctx, 0, H - 18, W, 18);
    ctx.strokeStyle = LINE; ctx.lineWidth = 3; ctx.strokeRect(60, 78, W - 120, H - 156);

    logo(ctx, W / 2, 190, 120);
    text(ctx, o.chapter, W / 2, 300, { f: font(500, 38), align: "center" });
    text(ctx, o.cluster, W / 2, 348, { f: font(400, 30), color: MUTED, align: "center" });

    const participation = c.type === "participation";
    const dy = c.type === "distinction" ? 0 : -40; // close the gap left by the distinction label
    text(ctx, "CERTIFICATE", W / 2, 460, { f: font(500, 30), color: MUTED, align: "center", spacing: 10 });
    text(ctx, participation ? "of Participation" : "of Completion", W / 2, 560, { f: font(700, 92), align: "center" });
    if (c.type === "distinction") {
      ctx.font = font(700, 30);
      const label = "WITH DISTINCTION", tw = ctx.measureText(label).width + 80;
      ctx.fillStyle = "#fef7e0"; roundRect(ctx, W / 2 - tw / 2, 588, tw, 56, 28); ctx.fill();
      text(ctx, label, W / 2, 627, { f: font(700, 30), color: "#b06000", align: "center", spacing: 4 });
    }

    text(ctx, "This is to certify that", W / 2, 728 + dy, { f: font(400, 34), color: MUTED, align: "center" });
    ctx.font = font(700, 100);
    let size = 100;
    while (ctx.measureText(c.name).width > 1500 && size > 56) { size -= 4; ctx.font = font(700, size); }
    text(ctx, c.name, W / 2, 846 + dy, { f: font(700, size), align: "center" });
    ctx.fillStyle = LINE; ctx.fillRect(W / 2 - 520, 884 + dy, 1040, 3);

    const body = participation
      ? `took part in ${o.track}, a ${o.weeks}-week hands-on program of the ${o.cluster} (${o.period}), covering ${o.topics}.`
      : `has successfully completed ${o.track}, a ${o.weeks}-week hands-on program of the ${o.cluster} (${o.period}), covering ${o.topics}.`;
    ctx.font = font(400, 34);
    wrap(ctx, body, 1360).forEach((l, i) => text(ctx, l, W / 2, 960 + dy + i * 50, { f: font(400, 34), color: INK, align: "center" }));

    const sigs = (o.signatories || []).slice(0, 2);
    const slots = [...sigs, { name: new Date(c.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), role: "Date issued" }];
    const span = 1500 / slots.length;
    slots.forEach((s, i) => {
      const cx = W / 2 - 750 + span * i + span / 2;
      ctx.fillStyle = INK; ctx.fillRect(cx - 230, 1188, 460, 3);
      text(ctx, s.name, cx, 1236, { f: font(500, 32), align: "center" });
      text(ctx, s.role, cx, 1276, { f: font(400, 26), color: MUTED, align: "center" });
    });

    text(ctx, `Certificate ID: ${c.id}`, 100, 1320, { f: font(500, 22), color: MUTED });
    text(ctx, `Verify: ${o.verifyUrl}`, W - 100, 1320, { f: font(400, 22), color: MUTED, align: "right" });
  }

  return { loadImage, photoFromFile, flyer, certificate };
})();
