(function() {
    const currentUrl = window.location.href;

    // ==========================================
    // EXTRACTION DE L'ADRESSE EN TÂCHE DE FOND
    // ==========================================
    if (!currentUrl.includes("cedeo.fr") && !currentUrl.includes("github.io") && !currentUrl.includes("leroymerlin.fr")) {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.dataset.suivi) {
                input.dataset.suivi = "true";
                input.addEventListener('input', function() {
                    const txt = (this.placeholder || this.name || this.id || "").toLowerCase();
                    if (txt.includes('adresse') || txt.includes('postale')) {
                        const val = this.value.trim();
                        if (val !== "") localStorage.setItem('artisan-adresse-postale', val);
                    }
                });
            }
        });
    }

    // ==========================================
    // ACTION SUR CEDEO
    // ==========================================
    if (currentUrl.includes("cedeo.fr")) {
        if (document.getElementById('centralisateur-dock')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #centralisateur-dock { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.15); z-index: 999999; padding: 12px 0; display: flex; justify-content: center; align-items: center; }
            #btn-transfert-unique { background: #002F6C; color: white; padding: 12px 20px; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; }
        `;
        document.head.appendChild(style);

        const dock = document.createElement('div');
        dock.id = 'centralisateur-dock';
        const b = document.createElement('button');
        b.id = 'btn-transfert-unique';
        b.innerText = 'COPIER VERS FACTURE';

        b.onclick = function() {
            const panier = [];
            document.querySelectorAll('li[data-testid^="cart/article/"]').forEach(l => {
                const info = l.querySelector('.area-article-tile-info');
                const des = (info ? info.innerText.trim().replace(/\s+/g, ' ') : 'Article');
                const ref = l.getAttribute('data-testid')?.split('/').pop() || '';
                const prixB = l.querySelector('.area-article-tile-price');
                let px = 0;
                if(prixB) {
                    const m = prixB.innerText.match(/([0-9\s\u00A0,.]+)/);
                    if(m) px = parseFloat(m[1].replace(/\s/g,'').replace(',','.'));
                }
                const inp = l.querySelector('input[type="number"]') || l.querySelector('input');
                const qte = inp ? parseInt(inp.value, 10) : 1;
                panier.push({des: des + ' (Réf: ' + ref + ')', ref, px, qte});
            });

            if (panier.length > 0) {
                window.location.href = 'https://metaplik.github.io/FACTURATION-/facture/?data=' + encodeURIComponent(JSON.stringify(panier)) + '&adr=' + encodeURIComponent(localStorage.getItem('artisan-adresse-postale') || '');
            } else {
                alert('Panier vide.');
            }
        };
        dock.appendChild(b);
        document.body.appendChild(dock);
    }

        // ==========================================
    // ACTION SUR LEROY MERLIN (CORRIGÉ)
    // ==========================================
    if (currentUrl.includes("leroymerlin.fr")) {
        if (document.getElementById('centralisateur-dock-lm')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #centralisateur-dock-lm { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.15); z-index: 999999; padding: 12px 0; display: flex; justify-content: center; }
            #btn-transfert-lm { background: #E66C00; color: white; padding: 12px 20px; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; }
        `;
        document.head.appendChild(style);

        const dock = document.createElement('div');
        dock.id = 'centralisateur-dock-lm';
        const b = document.createElement('button');
        b.id = 'btn-transfert-lm';
        b.innerText = 'COPIER PANIER LEROY MERLIN';

        b.onclick = function() {
            const panier = [];
            // Utilisation d'un sélecteur plus générique qui cible les lignes de produits
            const produits = document.querySelectorAll('div[data-testid^="cart-offer-line"]');
            
            produits.forEach(p => {
                const name = p.querySelector('h2')?.textContent.trim() || p.querySelector('.app-vendor-title')?.textContent.trim();
                const priceText = p.querySelector('.offer-price-prices')?.textContent.trim();
                
                // Recherche de l'input quantité plus flexible
                const qtyInput = p.querySelector('input[type="number"], input[data-testid*="quantity"]');
                const qty = qtyInput ? parseInt(qtyInput.value || qtyInput.getAttribute('aria-valuenow'), 10) : 1;
                
                let px = 0;
                if(priceText) {
                    const m = priceText.replace(',', '.').match(/([0-9.]+)/);
                    if(m) px = parseFloat(m[1]);
                }
                
                if (name) panier.push({des: name, ref: "LM", px: px, qte: qty});
            });

            if (panier.length > 0) {
                window.location.href = 'https://metaplik.github.io/FACTURATION-/facture/?data=' + encodeURIComponent(JSON.stringify(panier)) + '&adr=' + encodeURIComponent(localStorage.getItem('artisan-adresse-postale') || '');
            } else {
                alert('Panier non détecté. Vérifiez que vous êtes bien sur la page panier.');
            }
        };
        dock.appendChild(b);
        document.body.appendChild(dock);
    }

    // ==========================================
    // INJECTION DE L'ADRESSE (GITHUB)
    // ==========================================
    if (currentUrl.includes("github.io")) {
        const params = new URLSearchParams(window.location.search);
        const adrParam = params.get('adr');
        if (adrParam) {
            let adresse = decodeURIComponent(adrParam);
            let t = 0;
            const interval = setInterval(function() {
                const champs = document.querySelectorAll('.left-col .auto-ta');
                if (champs && champs[2]) {
                    champs[2].value = adresse;
                    champs[2].style.height = 'auto';
                    champs[2].style.height = champs[2].scrollHeight + 'px';
                    clearInterval(interval);
                }
                if (++t > 20) clearInterval(interval);
            }, 200);
        }
    }
})();
