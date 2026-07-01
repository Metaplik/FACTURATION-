(function() {
    const currentUrl = window.location.href;

    // ==========================================
    // EXTRACTION DE L'ADRESSE EN TÂCHE DE FOND
    // ==========================================
    if (!currentUrl.includes("cedeo.fr") && !currentUrl.includes("github.io")) {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.dataset.suivi) {
                input.dataset.suivi = "true";
                input.addEventListener('input', function() {
                    const txt = (this.placeholder || this.name || this.id || "").toLowerCase();
                    if (txt.includes('adresse') || txt.includes('postale')) {
                        const val = this.value.trim();
                        if (val !== "") {
                            localStorage.setItem('artisan-adresse-postale', val);
                        }
                    }
                });
            }
        });
    }

    // ==========================================
    // ACTION SUR CEDEO : ENVOI DU PANIER + BANDEAU
    // ==========================================
    if (currentUrl.includes("cedeo.fr")) {
        if (document.getElementById('centralisateur-dock')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #centralisateur-dock { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.15); z-index: 999999; transition: transform 0.3s ease-in-out; padding: 12px 0; display: flex; justify-content: center; align-items: center; }
            #centralisateur-dock.minimized { transform: translateY(100%); }
            #btn-transfert-unique { background: #002F6C; color: white; padding: 12px 20px; border: none; border-radius: 50px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 85%; max-width: 320px; cursor: pointer; }
            #centralisateur-toggle { position: absolute; top: -30px; right: 20px; background: #002F6C; color: white; width: 35px; height: 30px; border-radius: 8px 8px 0 0; display: flex; justify-content: center; align-items: center; font-size: 14px; cursor: pointer; box-shadow: 0 -2px 5px rgba(0,0,0,0.1); }
        `;
        document.head.appendChild(style);

        const dock = document.createElement('div');
        dock.id = 'centralisateur-dock';

        const toggle = document.createElement('div');
        toggle.id = 'centralisateur-toggle';
        toggle.innerText = '▼';

        const b = document.createElement('button');
        b.id = 'btn-transfert-unique';
        b.innerText = ' COPIER VERS FACTURE';

        b.onclick = function() {
            const lignes = document.querySelectorAll('li[data-testid^="cart/article/"]');
            const panier = [];
            
            lignes.forEach(l => {
                const info = l.querySelector('.area-article-tile-info');
                let desBrute = info ? info.innerText.trim() : 'Article';
                const id = l.getAttribute('data-testid');
                const ref = id ? id.split('/').pop() : '';
                
                desBrute = desBrute.replace(/\s+/g, ' ').replace(/Réf\..*$/i, '').trim();
                const des = desBrute + ' (Réf: ' + ref + ')';

                const prixB = l.querySelector('.area-article-tile-price');
                let px = 0;
                if(prixB) {
                    const m = prixB.innerText.match(/([0-9\s\u00A0,.]+)/);
                    if(m) px = parseFloat(m[1].replace(/\s/g,'').replace(',','.'));
                }
                const inp = l.querySelector('input[type="number"]') || l.querySelector('input');
                const qte = inp ? parseInt(inp.value, 10) : 1;
                panier.push({des, ref, px, qte});
            });

            if (panier.length > 0) {
                const adresse = localStorage.getItem('artisan-adresse-postale') || '';
                const data = encodeURIComponent(JSON.stringify(panier));
                
                // TON LIEN DIRECT ET SÉCURISÉ D'ORIGINE
                window.location.href = 'https://metaplik.github.io/FACTURATION-/facture/?data=' + data + '&adr=' + encodeURIComponent(adresse);
            } else {
                alert('Panier vide ou mauvaise page.');
            }
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dock.classList.toggle('minimized');
            toggle.innerText = dock.classList.contains('minimized') ? '▲' : '▼';
        });

        dock.appendChild(toggle);
        dock.appendChild(b);
        document.body.appendChild(dock);
    }

    // ==========================================
    // INJECTION DE L'ADRESSE DANS LA CASE 3 DE LA FACTURE
    // ==========================================
    if (currentUrl.includes("github.io")) {
        const params = new URLSearchParams(window.location.search);
        const adrParam = params.get('adr');
        
        if (adrParam) {
            let adresseDecodee = decodeURIComponent(adrParam);
            let tentatives = 0;
            const injecterAdresseForce = setInterval(function() {
                const champsTexte = document.querySelectorAll('.left-col .auto-ta');
                if (champsTexte && champsTexte[2]) {
                    champsTexte[2].value = adresseDecodee;
                    champsTexte[2].style.height = 'auto';
                    champsTexte[2].style.height = champsTexte[2].scrollHeight + 'px';
                    clearInterval(injecterAdresseForce);
                }
                tentatives++;
                if (tentatives > 20) clearInterval(injecterAdresseForce);
            }, 200);
        }
    }
})();
