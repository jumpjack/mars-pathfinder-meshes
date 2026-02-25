/**
 * Pathfinder Images Player & Ground Projector
 * 
 * Questo script analizza una pagina di immagini del Mars Pathfinder, scarica i metadati
 * dai file .htm collegati e visualizza la sequenza temporale proiettando l'inquadratura
 * su una mappa del suolo (texture) calibrata.
 */

(async function() {
    // --- COSTANTI DI CALIBRAZIONE FISICA E OTTICA ---
    const H = 1.5;          // Altezza della telecamera IMP dal suolo (metri)
    const FOV_H = 14.4;      // Field of View Orizzontale (gradi)
    const FOV_V = 14.0;      // Field of View Verticale (gradi)

    // --- COORDINATE DELLA GRIGLIA NELLA TEXTURE (PIXEL) ---
    // La griglia scientifica nell'immagine originale non è centrata né quadrata.
    const G_X1 = 98, G_Y1 = 132;   // Angolo in alto a sinistra della griglia (-6m, +6m)
    const G_X2 = 845, G_Y2 = 943;  // Angolo in basso a destra della griglia (+6m, -7m)
    
    const G_W_PX = G_X2 - G_X1;    // Larghezza griglia in pixel (747px)
    const G_H_PX = G_Y2 - G_Y1;    // Altezza griglia in pixel (811px)
    
    const VIEW_W_M = 12;           // Larghezza reale della griglia (da -6 a +6 metri)
    const VIEW_H_M = 13;           // Altezza reale della griglia (da +6 a -7 metri)

    // --- PUNTI DI RIFERIMENTO (PIXEL SULL'IMMAGINE ORIGINALE) ---
    const GRID_CX = 470;           // Centro della griglia (punto 0,0 metri)
    const GRID_CY = 506;
    const CAM_PX = 456;            // Posizione reale della telecamera (IMP Mast)
    const CAM_PY = 488;

    // --- RISORSE ESTERNE ---
    // Proxy necessario per superare il blocco CORS del server NASA JPL
    const PROXY = 'https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=';
    const MAP_URL = PROXY + encodeURIComponent('https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA01151.width-1024.jpg');
    
    // --- ANALISI PAGINA CORRENTE ---
    // Estrae tutti i link alle immagini saltando le icone di navigazione
    const lks = Array.from(document.querySelectorAll('img'))
        .filter(m => m.src.toLowerCase().endsWith('.jpg') && !m.src.includes('icons/'))
        .map(m => ({
            g: m.src.replace(/\.jpg$/i, '.gif'), // Usa le GIF (spesso di qualità migliore o colore)
            h: m.closest('a')?.href               // Link alla pagina dei dettagli HTM
        }));
    
    if (!lks.length) {
        alert("No images found in this page.");
        return;
    }
    
    // --- CREAZIONE INTERFACCIA UTENTE (DOM) ---
    const d = document;
    const b = d.createElement('div'); // Overlay principale
    b.style = 'position:fixed;inset:0;background:#fff;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font:14px sans-serif;overflow:auto;padding:20px;';
    
    const h1 = d.createElement('h2');
    h1.innerText = 'Pathfinder images player';
    h1.style = 'margin:0 0 20px 0; color:#333; font-family:serif;';
    
    const mn = d.createElement('div'); // Contenitore per i due canvas
    mn.style = 'display:flex;align-items:center;justify-content:center;gap:30px;width:100%;max-height:60vh;';
    
    const v = d.createElement('canvas'); // Canvas Sinistro: Immagine RAW
    v.style = 'max-width:60%;max-height:100%;outline:1px solid #ccc; background:#000; cursor:pointer;';
    v.title = 'Click to open original GIF';
    
    const azc = d.createElement('canvas'); // Canvas Destro: Proiezione a terra
    const CANV_W = 400; // Larghezza fissa del canvas di proiezione
    const sc = CANV_W / VIEW_W_M; // Fattore di scala Pixel/Metro per il canvas
    const CANV_H = VIEW_H_M * sc; // Altezza proporzionale (13 metri)
    azc.width = CANV_W; 
    azc.height = CANV_H;
    azc.style = 'border:2px solid #999; background:#eee; flex-shrink:0;';
    
    // Calcolo scala Pixel/Metro della texture sorgente (diversa per X e Y)
    const PPM_X = G_W_PX / VIEW_W_M;
    const PPM_Y = G_H_PX / VIEW_H_M;

    const s = d.createElement('input'); // Slider temporale
    s.type = 'range'; s.min = 0; s.max = 0; s.value = 0; s.disabled = true; s.style = 'width:80%;margin:20px;';
    
    const l = d.createElement('div'); // Info frame (es: Frame 1 of 50)
    const t = d.createElement('div'); // Info metadati (es: Azimuth, Sol)
    t.style = 'font-weight:bold;color:#222;height:45px;margin:10px;text-align:center;white-space:pre;line-height:1.4;';
    
    const p = d.createElement('div'); // Contenitore pulsanti Play/Pause/Stop
    const x = d.createElement('button'); // Tasto chiusura
    x.innerText = 'CLOSE'; x.style = 'position:absolute;top:20px;right:20px;padding:10px;cursor:pointer;font-weight:bold;';
    
    let tm = null, data = [], mapImg = new Image(), mapReady = false;
    const ctx = v.getContext('2d'), actx = azc.getContext('2d');

    // Apertura immagine originale al click sul canvas sinistro
    v.onclick = () => { if (data.length > 0) window.open(data[s.value].g, '_blank'); };
    x.onclick = () => { clearInterval(tm); b.remove(); };

    // --- AREA DOWNLOAD ---
    const downloadArea = d.createElement('div');
    downloadArea.style = 'margin-top:10px; display:flex; flex-direction:column; align-items:center;';
    const startBtn = d.createElement('button');
    startBtn.innerText = 'DOWNLOAD AND ANALYZE DATA (' + lks.length + ' files)';
    startBtn.style = 'padding:12px 24px; cursor:pointer; font-weight:bold; background:#2e7d32; color:#fff; border:none; border-radius:4px;';
    const pb = d.createElement('div'), pi = d.createElement('div');
    pb.style = 'width:300px; height:10px; border:1px solid #000; margin-top:10px; display:none;';
    pi.style = 'width:0%; height:100%; background:#4CAF50;';
    pb.append(pi); downloadArea.append(startBtn, pb);

    /**
     * FUNZIONE DI DISEGNO PRINCIPALE (Mappa e Proiezione)
     * @param {number} n Indice del frame da visualizzare
     */
    function dr(n) {
        actx.clearRect(0, 0, CANV_W, CANV_H);
        
        // Offset dell'origine (0,0m) nel canvas: la griglia parte da +6 Nord, noi vogliamo il centro a +6m dal bordo
        const canv_x0 = 6 * sc;
        const canv_y0 = 6 * sc;

        // 1. Disegno della texture ritagliata (Mappa)
        if (mapReady) {
            actx.drawImage(mapImg, G_X1, G_Y1, G_W_PX, G_H_PX, 0, 0, CANV_W, CANV_H);
        }

        // 2. Calcolo posizione telecamera nel canvas (trasformazione Pixel sorgente -> Pixel canvas)
        const cam_x = canv_x0 + (CAM_PX - GRID_CX) / PPM_X * sc;
        const cam_y = canv_y0 + (CAM_PY - GRID_CY) / PPM_Y * sc;

        // 3. Disegno griglia di riferimento (1 metro per cella)
        actx.strokeStyle = 'rgba(255,255,255,0.3)'; actx.lineWidth = 1;
        for (let i = 0; i <= VIEW_W_M; i++) { actx.beginPath(); actx.moveTo(i * sc, 0); actx.lineTo(i * sc, CANV_H); actx.stroke(); }
        for (let j = 0; j <= VIEW_H_M; j++) { actx.beginPath(); actx.moveTo(0, j * sc); actx.lineTo(CANV_W, j * sc); actx.stroke(); }

        // 4. Indicatori di base (Nord e posizione Rover)
        actx.fillStyle = 'white'; actx.fillText('N', canv_x0 + 5, 15);
        actx.fillStyle = 'black'; actx.beginPath(); actx.arc(cam_x, cam_y, 4, 0, 7); actx.fill();

        // 5. Se i dati sono stati scaricati, proietta l'inquadratura
        if (data.length > 0) {
            const o = data[n]; s.value = n;
            
            // Calcolo distanza del centro immagine tramite trigonometria: dist = H / tan(elevation)
            const dist = Math.abs(o.el) < 0.5 ? 99 : Math.abs(H / Math.tan(o.el * Math.PI / 180));
            
            l.innerText = `Frame: ${parseInt(n) + 1} of ${data.length}`;
            t.innerText = `SOL: ${o.sol} | DATE: ${o.t}\nAZ: ${o.az}° | EL: ${o.el}° | DIST: ${dist.toFixed(2)}m`;

            // Aggiorna immagine RAW a sinistra
            const im = new Image(); im.src = o.g;
            im.onload = () => { 
                v.width = im.naturalWidth; 
                v.height = im.naturalHeight; 
                ctx.drawImage(im, 0, 0); 
            };

            // 6. Proiezione del Quadrilatero (FOV) sul terreno
            const pts = [];
            // Calcola i 4 angoli dell'immagine proiettandoli individualmente
            [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(c => {
                const taz = o.az + (c[0] * FOV_H / 2); // Azimuth dell'angolo
                const tel = o.el + (c[1] * FOV_V / 2); // Elevation dell'angolo
                
                // Se l'elevation è positiva (sopra l'orizzonte), la proiezione è infinita (usiamo 50m)
                const d_pt = tel >= 0 ? 50 : Math.abs(H / Math.tan(tel * Math.PI / 180));
                
                const rad = (taz - 90) * Math.PI / 180;
                pts.push({
                    x: cam_x + d_pt * sc * Math.cos(rad),
                    y: cam_y + d_pt * sc * Math.sin(rad)
                });
            });

            // Disegna il poligono blu (area inquadrata)
            actx.beginPath(); actx.strokeStyle = 'rgba(0,0,255,0.7)'; actx.fillStyle = 'rgba(0,0,255,0.2)'; actx.lineWidth = 2;
            actx.moveTo(pts[0].x, pts[0].y); 
            pts.slice(1).forEach(p => actx.lineTo(p.x, p.y)); 
            actx.closePath(); actx.fill(); actx.stroke();

            // 7. Disegna la linea rossa (direzione centrale dell'Azimuth)
            const r_mid = (o.az - 90) * Math.PI / 180;
            actx.beginPath(); actx.strokeStyle = 'red'; actx.lineWidth = 2;
            actx.moveTo(cam_x, cam_y);
            actx.lineTo(cam_x + dist * sc * Math.cos(r_mid), cam_y + dist * sc * Math.sin(r_mid));
            actx.stroke();
        } else {
            l.innerText = 'Ready'; 
            t.innerText = 'Asymmetry calib: +6/-7m. FOV: 14.4°x14.0°.';
        }
    }

    // --- LOGICA DI DOWNLOAD E PARSING METADATI ---
    startBtn.onclick = async () => {
        startBtn.disabled = true; pb.style.display = 'block';
        for (let j = 0; j < lks.length; j++) {
            try {
                const resp = await fetch(lks[j].h);
                const h = await resp.text();
                
                // Regex per estrarre i valori dalle tabelle HTML 1.0 (senza ID o Classi)
                const mt = h.match(/Image\s+Time[\s\S]*?<\/TD>\s*<TD[^>]*>\s*([^<\s]+)/i);
                const ma = h.match(/Surface\s+Based\s+Inst\.?\s+Azimuth[\s\S]*?<\/TD>\s*<TD[^>]*>\s*([-\d\.]+)/i);
                const me = h.match(/Instrument\s+Elevation[\s\S]*?<\/TD>\s*<TD[^>]*>\s*([-\d\.]+)/i);
                const ms = h.match(/Planet\s+Day\s+Number[\s\S]*?<\/TD>\s*<TD[^>]*>\s*(\d+)/i);
                
                data.push({
                    g: lks[j].g, 
                    t: mt ? mt[1].trim() : '0', 
                    az: ma ? parseFloat(ma[1]) : 0, 
                    el: me ? parseFloat(me[1]) : 0, 
                    sol: ms ? ms[1] : '?'
                });
            } catch (e) { 
                data.push({g: lks[j].g, t: '0', az: 0, el: 0, sol: '?'}); 
            }
            pi.style.width = ((j + 1) / lks.length * 100) + '%';
        }
        
        // Ordina le immagini cronologicamente prima di iniziare l'animazione
        data.sort((a, b) => a.t.localeCompare(b.t));
        
        downloadArea.style.display = 'none'; 
        s.disabled = false; 
        s.max = data.length - 1; 
        dr(0);
    };

    // Caricamento della mappa di sfondo
    mapImg.crossOrigin = "anonymous"; 
    mapImg.onload = () => { mapReady = true; dr(0); }; 
    mapImg.src = MAP_URL;

    // Helper per creare i pulsanti di controllo
    const btn = (tx, fn) => { 
        const r = d.createElement('button'); 
        r.innerText = tx; 
        r.style = 'margin:0 5px;padding:8px 20px;cursor:pointer;font-weight:bold;'; 
        r.onclick = fn; return r; 
    };

    p.append(
        btn('PLAY', () => { 
            if (!tm && data.length) 
                tm = setInterval(() => { dr((parseInt(s.value) + 1) % data.length); }, 150); 
        }), 
        btn('PAUSE', () => { clearInterval(tm); tm = null; }), 
        btn('STOP', () => { clearInterval(tm); tm = null; if (data.length) dr(0); })
    );

    // Gestione slider manuale
    s.oninput = () => dr(s.value); 
    
    // Assemblaggio finale dell'interfaccia
    mn.append(v, azc); 
    b.append(h1, mn, s, l, t, p, downloadArea, x); 
    d.body.append(b); 
    
    // Disegno iniziale (vuoto o solo mappa)
    dr(0);
})();
