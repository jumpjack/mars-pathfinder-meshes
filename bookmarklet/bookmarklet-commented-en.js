/**
 * Pathfinder Images Player & Ground Projector
 * 
 * This script analyzes a Mars Pathfinder image index page, downloads metadata
 * from linked .htm files, and displays a time sequence by projecting the 
 * camera's field of view onto a calibrated ground texture (map).
 */

(async function() {
    // --- PHYSICAL AND OPTICAL CALIBRATION CONSTANTS ---
    const H = 1;          // Height of the IMP camera mast from the ground (meters)
    const FOV_H = 14.4;      // Horizontal Field of View (degrees)
    const FOV_V = 14.0;      // Vertical Field of View (degrees)

    // --- GRID COORDINATES WITHIN THE TEXTURE (PIXELS) ---
    // The scientific grid in the original image is neither centered nor square.
    const G_X1 = 98, G_Y1 = 132;   // Top-left corner of the grid (-6m West, +6m North)
    const G_X2 = 845, G_Y2 = 943;  // Bottom-right corner of the grid (+6m East, -7m South)
    
    const G_W_PX = G_X2 - G_X1;    // Grid width in pixels (747px)
    const G_H_PX = G_Y2 - G_Y1;    // Grid height in pixels (811px)
    
    const VIEW_W_M = 12;           // Real width of the grid (from -6 to +6 meters)
    const VIEW_H_M = 13;           // Real height of the grid (from +6 to -7 meters)

    // --- REFERENCE POINTS (PIXELS ON THE ORIGINAL IMAGE) ---
    const GRID_CX = 470;           // Center of the grid (0,0 meters point)
    const GRID_CY = 506;
    const CAM_PX = 456;            // Real position of the camera mast (IMP Mast)
    const CAM_PY = 488;

    // --- EXTERNAL RESOURCES ---
    // Proxy required to bypass the NASA JPL server's CORS (Cross-Origin Resource Sharing) policy
    const PROXY = 'https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=';
    const MAP_URL = PROXY + encodeURIComponent('https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA01151.width-1024.jpg');
    
    // --- CURRENT PAGE ANALYSIS ---
    // Extract all image links, skipping navigation icons
    const lks = Array.from(document.querySelectorAll('img'))
        .filter(m => m.src.toLowerCase().endsWith('.jpg') && !m.src.includes('icons/'))
        .map(m => ({
            g: m.src.replace(/\.jpg$/i, '.gif'), // Prefer GIF (often better quality or color)
            h: m.closest('a')?.href               // Link to the HTM details page
        }));
    
    if (!lks.length) {
        alert("No images found in this page.");
        return;
    }
    
    // --- UI CREATION (DOM) ---
    const d = document;
    const b = d.createElement('div'); // Main Overlay
    b.style = 'position:fixed;inset:0;background:#fff;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font:14px sans-serif;overflow:auto;padding:20px;';
    
    const h1 = d.createElement('h2');
    h1.innerText = 'Pathfinder images player';
    h1.style = 'margin:0 0 20px 0; color:#333; font-family:serif;';
    
    const mn = d.createElement('div'); // Container for the two canvases
    mn.style = 'display:flex;align-items:center;justify-content:center;gap:30px;width:100%;max-height:60vh;';
    
    const v = d.createElement('canvas'); // Left Canvas: RAW Image
    v.style = 'max-width:60%;max-height:100%;outline:1px solid #ccc; background:#000; cursor:pointer;';
    v.title = 'Click to open original GIF';
    
    const azc = d.createElement('canvas'); // Right Canvas: Ground Projection
    const CANV_W = 400; // Fixed width for the projection canvas
    const sc = CANV_W / VIEW_W_M; // Pixels per Meter scale factor for the canvas
    const CANV_H = VIEW_H_M * sc; // Proportional height (13 meters)
    azc.width = CANV_W; 
    azc.height = CANV_H;
    azc.style = 'border:2px solid #999; background:#eee; flex-shrink:0;';
    
    // Calculate Pixels per Meter for the source texture (different for X and Y)
    const PPM_X = G_W_PX / VIEW_W_M;
    const PPM_Y = G_H_PX / VIEW_H_M;

    const s = d.createElement('input'); // Time Slider
    s.type = 'range'; s.min = 0; s.max = 0; s.value = 0; s.disabled = true; s.style = 'width:80%;margin:20px;';
    
    const l = d.createElement('div'); // Frame Info (e.g., Frame 1 of 50)
    const t = d.createElement('div'); // Metadata Info (e.g., Azimuth, Sol)
    t.style = 'font-weight:bold;color:#222;height:45px;margin:10px;text-align:center;white-space:pre;line-height:1.4;';
    
    const p = d.createElement('div'); // Play/Pause/Stop buttons container
    const x = d.createElement('button'); // Close button
    x.innerText = 'CLOSE'; x.style = 'position:absolute;top:20px;right:20px;padding:10px;cursor:pointer;font-weight:bold;';
    
    let tm = null, data = [], mapImg = new Image(), mapReady = false;
    const ctx = v.getContext('2d'), actx = azc.getContext('2d');

    // Open original image when clicking the left canvas
    v.onclick = () => { if (data.length > 0) window.open(data[s.value].g, '_blank'); };
    x.onclick = () => { clearInterval(tm); b.remove(); };

    // --- DOWNLOAD AREA ---
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
     * MAIN DRAWING FUNCTION (Map and Projection)
     * @param {number} n Index of the frame to display
     */
    function dr(n) {
        actx.clearRect(0, 0, CANV_W, CANV_H);
        
        // Origin (0,0m) offset in canvas: grid starts at +6 North, center is at 6m from the top border
        const canv_x0 = 6 * sc;
        const canv_y0 = 6 * sc;

        // 1. Draw cropped texture (Map)
        if (mapReady) {
            actx.drawImage(mapImg, G_X1, G_Y1, G_W_PX, G_H_PX, 0, 0, CANV_W, CANV_H);
        }

        // 2. Calculate camera position in canvas (source Pixels -> canvas Pixels transformation)
        const cam_x = canv_x0 + (CAM_PX - GRID_CX) / PPM_X * sc;
        const cam_y = canv_y0 + (CAM_PY - GRID_CY) / PPM_Y * sc;

        // 3. Draw reference grid (1 meter per cell)
        actx.strokeStyle = 'rgba(255,255,255,0.3)'; actx.lineWidth = 1;
        for (let i = 0; i <= VIEW_W_M; i++) { actx.beginPath(); actx.moveTo(i * sc, 0); actx.lineTo(i * sc, CANV_H); actx.stroke(); }
        for (let j = 0; j <= VIEW_H_M; j++) { actx.beginPath(); actx.moveTo(0, j * sc); actx.lineTo(CANV_W, j * sc); actx.stroke(); }

        // 4. Basic indicators (North and Camera position)
        actx.fillStyle = 'white'; actx.fillText('N', canv_x0 + 5, 15);
        actx.fillStyle = 'black'; actx.beginPath(); actx.arc(cam_x, cam_y, 4, 0, 7); actx.fill();

        // 5. If data is downloaded, project the FOV
        if (data.length > 0) {
            const o = data[n]; s.value = n;
            
            // Calculate center image distance via trigonometry: dist = H / tan(elevation)
            const dist = Math.abs(o.el) < 0.5 ? 99 : Math.abs(H / Math.tan(o.el * Math.PI / 180));
            
            l.innerText = `Frame: ${parseInt(n) + 1} of ${data.length}`;
            t.innerText = `SOL: ${o.sol} | DATE: ${o.t}\nAZ: ${o.az}° | EL: ${o.el}° | DIST: ${dist.toFixed(2)}m`;

            // Update RAW image on the left
            const im = new Image(); im.src = o.g;
            im.onload = () => { 
                v.width = im.naturalWidth; 
                v.height = im.naturalHeight; 
                ctx.drawImage(im, 0, 0); 
            };

            // 6. Project Quadrilateral (FOV) onto the ground
            const pts = [];
            // Calculate the 4 corners of the image by projecting them individually
            [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(c => {
                const taz = o.az + (c[0] * FOV_H / 2); // Corner Azimuth
                const tel = o.el + (c[1] * FOV_V / 2); // Corner Elevation
                
                // If elevation is positive (above horizon), projection is infinite (fallback to 50m)
                const d_pt = tel >= 0 ? 50 : Math.abs(H / Math.tan(tel * Math.PI / 180));
                
                const rad = (taz - 90) * Math.PI / 180;
                pts.push({
                    x: cam_x + d_pt * sc * Math.cos(rad),
                    y: cam_y + d_pt * sc * Math.sin(rad)
                });
            });

            // Draw blue polygon (viewed area)
            actx.beginPath(); actx.strokeStyle = 'rgba(0,0,255,0.7)'; actx.fillStyle = 'rgba(0,0,255,0.2)'; actx.lineWidth = 2;
            actx.moveTo(pts[0].x, pts[0].y); 
            pts.slice(1).forEach(p => actx.lineTo(p.x, p.y)); 
            actx.closePath(); actx.fill(); actx.stroke();

            // 7. Draw red line (central Azimuth direction)
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

    // --- DOWNLOAD AND METADATA PARSING LOGIC ---
    startBtn.onclick = async () => {
        startBtn.disabled = true; pb.style.display = 'block';
        for (let j = 0; j < lks.length; j++) {
            try {
                const resp = await fetch(lks[j].h);
                const h = await resp.text();
                
                // Regex to extract values from legacy HTML 1.0 tables
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
        
        // Sort images chronologically before starting the animation
        data.sort((a, b) => a.t.localeCompare(b.t));
        
        downloadArea.style.display = 'none'; 
        s.disabled = false; 
        s.max = data.length - 1; 
        dr(0);
    };

    // Load background map
    mapImg.crossOrigin = "anonymous"; 
    mapImg.onload = () => { mapReady = true; dr(0); }; 
    mapImg.src = MAP_URL;

    // UI Control button helper
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

    // Manual slider handler
    s.oninput = () => dr(s.value); 
    
    // Final UI Assembly
    mn.append(v, azc); 
    b.append(h1, mn, s, l, t, p, downloadArea, x); 
    d.body.append(b); 
    
    // Initial draw (empty or map only)
    dr(0);
})();
