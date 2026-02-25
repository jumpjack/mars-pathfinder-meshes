javascript:(async function() {
    const H = 1.75, FOV_H = 14.4, FOV_V = 14.0;
    const G_X1 = 98, G_Y1 = 132, G_X2 = 845, G_Y2 = 943;
    const G_W_PX = G_X2 - G_X1, G_H_PX = G_Y2 - G_Y1;
    const VIEW_W_M = 12, VIEW_H_M = 13;
    const GRID_CX = 470, GRID_CY = 506, CAM_PX = 456, CAM_PY = 488;
    const PROXY = 'https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=';
    const MAP_URL = PROXY + encodeURIComponent('https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA01151.width-1024.jpg');
    
    const lks = Array.from(document.querySelectorAll('img')).filter(m => m.src.toLowerCase().endsWith('.jpg') && !m.src.includes('icons/')).map(m => ({
        g: m.src.replace(/\.jpg$/i, '.gif'),
        h: m.closest('a')?.href
    }));
    
    if (!lks.length) return;
    
    const d = document, b = d.createElement('div'), mn = d.createElement('div'), v = d.createElement('canvas'), azc = d.createElement('canvas'), s = d.createElement('input'), l = d.createElement('div'), t = d.createElement('div'), p = d.createElement('div'), x = d.createElement('button'), h1 = d.createElement('h2');
    
    let tm = null, data = [], mapImg = new Image(), mapReady = false;
    const CANV_W = 400, sc = CANV_W / VIEW_W_M, CANV_H = VIEW_H_M * sc;
    const PPM_X = G_W_PX / VIEW_W_M, PPM_Y = G_H_PX / VIEW_H_M;
    
    b.style = 'position:fixed;inset:0;background:#fff;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font:14px sans-serif;overflow:auto;padding:20px;';
    h1.innerText = 'Pathfinder images player';
    h1.style = 'margin:0 0 20px 0; color:#333; font-family:serif;';
    
    mn.style = 'display:flex;align-items:center;justify-content:center;gap:30px;width:100%;max-height:60vh;';
    v.style = 'max-width:60%;max-height:100%;outline:1px solid #ccc; background:#000; cursor:pointer;';
    v.title = 'Click to open original GIF';
    v.onclick = () => { if (data.length > 0) window.open(data[s.value].g, '_blank'); };
    
    azc.width = CANV_W; azc.height = CANV_H; azc.style = 'border:2px solid #999; background:#eee; flex-shrink:0;';
    s.type = 'range'; s.min = 0; s.max = 0; s.value = 0; s.disabled = true; s.style = 'width:80%;margin:20px;';
    t.style = 'font-weight:bold;color:#222;height:45px;margin:10px;text-align:center;white-space:pre;line-height:1.4;';
    
    x.innerText = 'CLOSE'; x.style = 'position:absolute;top:20px;right:20px;padding:10px;cursor:pointer;font-weight:bold;';
    x.onclick = () => { clearInterval(tm); b.remove(); };
    
    const ctx = v.getContext('2d'), actx = azc.getContext('2d');
    const downloadArea = d.createElement('div');
    downloadArea.style = 'margin-top:10px; display:flex; flex-direction:column; align-items:center;';
    const startBtn = d.createElement('button');
    startBtn.innerText = 'DOWNLOAD AND ANALYZE DATA (' + lks.length + ' files)';
    startBtn.style = 'padding:12px 24px; cursor:pointer; font-weight:bold; background:#2e7d32; color:#fff; border:none; border-radius:4px;';
    const pb = d.createElement('div'), pi = d.createElement('div');
    pb.style = 'width:300px; height:10px; border:1px solid #000; margin-top:10px; display:none;';
    pi.style = 'width:0%; height:100%; background:#4CAF50;';
    pb.append(pi); downloadArea.append(startBtn, pb);
    
    function dr(n) {
        actx.clearRect(0, 0, CANV_W, CANV_H);
        const canv_x0 = 6 * sc, canv_y0 = 6 * sc;
        if (mapReady) actx.drawImage(mapImg, G_X1, G_Y1, G_W_PX, G_H_PX, 0, 0, CANV_W, CANV_H);
        const cam_x = canv_x0 + (CAM_PX - GRID_CX) / PPM_X * sc;
        const cam_y = canv_y0 + (CAM_PY - GRID_CY) / PPM_Y * sc;
        actx.strokeStyle = 'rgba(255,255,255,0.3)'; actx.lineWidth = 1;
        for (let i = 0; i <= VIEW_W_M; i++) { actx.beginPath(); actx.moveTo(i * sc, 0); actx.lineTo(i * sc, CANV_H); actx.stroke(); }
        for (let j = 0; j <= VIEW_H_M; j++) { actx.beginPath(); actx.moveTo(0, j * sc); actx.lineTo(CANV_W, j * sc); actx.stroke(); }
        actx.fillStyle = 'white'; actx.fillText('N', canv_x0 + 5, 15);
        actx.fillStyle = 'black'; actx.beginPath(); actx.arc(cam_x, cam_y, 4, 0, 7); actx.fill();
        if (data.length > 0) {
            const o = data[n]; s.value = n;
            const dist = Math.abs(o.el) < 0.5 ? 99 : Math.abs(H / Math.tan(o.el * Math.PI / 180));
            l.innerText = `Frame: ${parseInt(n) + 1} of ${data.length}`;
            t.innerText = `SOL: ${o.sol} | DATE: ${o.t}\nAZ: ${o.az}° | EL: ${o.el}° | DIST: ${dist.toFixed(2)}m`;
            const im = new Image(); im.src = o.g;
            im.onload = () => { v.width = im.naturalWidth; v.height = im.naturalHeight; ctx.drawImage(im, 0, 0); };
            const pts = [];
            [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(c => {
                const taz = o.az + (c[0] * FOV_H / 2), tel = o.el + (c[1] * FOV_V / 2);
                const d_pt = tel >= 0 ? 50 : Math.abs(H / Math.tan(tel * Math.PI / 180));
                const r = (taz - 90) * Math.PI / 180;
                pts.push({x: cam_x + d_pt * sc * Math.cos(r), y: cam_y + d_pt * sc * Math.sin(r)});
            });
            actx.beginPath(); actx.strokeStyle = 'rgba(0,0,255,0.7)'; actx.fillStyle = 'rgba(0,0,255,0.2)'; actx.lineWidth = 2;
            actx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => actx.lineTo(p.x, p.y)); actx.closePath(); actx.fill(); actx.stroke();
            const r_mid = (o.az - 90) * Math.PI / 180;
            actx.beginPath(); actx.strokeStyle = 'red'; actx.lineWidth = 2; actx.moveTo(cam_x, cam_y); actx.lineTo(cam_x + dist * sc * Math.cos(r_mid), cam_y + dist * sc * Math.sin(r_mid)); actx.stroke();
        } else {
            l.innerText = 'Ready'; t.innerText = 'Asymmetry calib: +6/-7m. FOV: 14.4°x14.0°.';
        }
    }
    startBtn.onclick = async () => {
        startBtn.disabled = true; pb.style.display = 'block';
        for (let j = 0; j < lks.length; j++) {
            try {
                const resp = await fetch(lks[j].h), h = await resp.text();
                const mt = h.match(/Image\s+Time[\s\S]*?<\/TD>\s*<TD[^>]*>\s*([^<\s]+)/i), ma = h.match(/Surface\s+Based\s+Inst\.?\s+Azimuth[\s\S]*?<\/TD>\s*<TD[^>]*>\s*([-\d\.]+)/i), me = h.match(/Instrument\s+Elevation[\s\S]*?<\/TD>\s*<TD[^>]*>\s*([-\d\.]+)/i), ms = h.match(/Planet\s+Day\s+Number[\s\S]*?<\/TD>\s*<TD[^>]*>\s*(\d+)/i);
                data.push({g: lks[j].g, t: mt ? mt[1].trim() : '0', az: ma ? parseFloat(ma[1]) : 0, el: me ? parseFloat(me[1]) : 0, sol: ms ? ms[1] : '?'});
            } catch (e) { data.push({g: lks[j].g, t: '0', az: 0, el: 0, sol: '?'}); }
            pi.style.width = ((j + 1) / lks.length * 100) + '%';
        }
        data.sort((a, b) => a.t.localeCompare(b.t)); downloadArea.style.display = 'none'; s.disabled = false; s.max = data.length - 1; dr(0);
    };
    mapImg.crossOrigin = "anonymous"; mapImg.onload = () => { mapReady = true; dr(0); }; mapImg.src = MAP_URL;
    const btn = (tx, fn) => { const r = d.createElement('button'); r.innerText = tx; r.style = 'margin:0 5px;padding:8px 20px;cursor:pointer;font-weight:bold;'; r.onclick = fn; return r; };
    p.append(btn('PLAY', () => { if (!tm && data.length) tm = setInterval(() => { dr((parseInt(s.value) + 1) % data.length); }, 150); }), btn('PAUSE', () => { clearInterval(tm); tm = null; }), btn('STOP', () => { clearInterval(tm); tm = null; if (data.length) dr(0); }));
    s.oninput = () => dr(s.value); mn.append(v, azc); b.append(h1, mn, s, l, t, p, downloadArea, x); d.body.append(b); dr(0);
})();
