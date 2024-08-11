// Fonctions utilitaires
function trierParValeur(cartes) {
    return cartes.slice().sort((a, b) => a.nombre - b.nombre);
}

function regrouperParValeur(cartes) {
    return cartes.reduce((acc, carte) => {
        acc[carte.nombre] = acc[carte.nombre] || [];
        acc[carte.nombre].push(carte);
        return acc;
    }, {});
}

function regrouperParCouleur(cartes) {
    return cartes.reduce((acc, carte) => {
        acc[carte.couleur] = acc[carte.couleur] || [];
        acc[carte.couleur].push(carte);
        return acc;
    }, {});
}

// Vérification des paliers
function peutFranchirPalier(joueur) {
    const cartes = joueur.cartesEnMain;
    const niveauPalier = joueur.palierActuel;

    switch (niveauPalier) {
        case 1:
            return verifierBrelan(cartes) && verifierSuite(cartes, 4);
        case 2:
            return verifierSuite(cartes, 4) && verifierCouleur(cartes, 4);
        case 3:
            return verifierDoubleBrelan(cartes) && verifierPaire(cartes);
        case 4:
            return verifierBrelan(cartes) && verifierSuite(cartes, 5);
        case 5:
            return verifierBrelan(cartes) && verifierCouleur(cartes, 5);
        case 6:
            return verifierSuite(cartes, 7);
        case 7:
            return verifierCouleur(cartes, 7);
        case 8:
            return verifierCarre(cartes) && verifierBrelan(cartes);
        default:
            return false;
    }
}

function verifierBrelan(cartes) {
    const groupes = regrouperParValeur(cartes);
    return Object.values(groupes).some(groupe => groupe.length >= 3);
}

function verifierPaire(cartes) {
    const groupes = regrouperParValeur(cartes);
    return Object.values(groupes).some(groupe => groupe.length >= 2);
}

function verifierCarre(cartes) {
    const groupes = regrouperParValeur(cartes);
    return Object.values(groupes).some(groupe => groupe.length >= 4);
}

function verifierSuite(cartes, longueur) {
    const valeurs = trierParValeur(cartes).map(carte => carte.nombre);
    for (let i = 0; i <= valeurs.length - longueur; i++) {
        let suite = true;
        for (let j = 0; j < longueur - 1; j++) {
            if (valeurs[i + j + 1] !== valeurs[i + j] + 1) {
                suite = false;
                break;
            }
        }
        if (suite) return true;
    }
    return false;
}

function verifierCouleur(cartes, longueur) {
    const groupes = regrouperParCouleur(cartes);
    return Object.values(groupes).some(groupe => groupe.length >= longueur);
}

function verifierDoubleBrelan(cartes) {
    const groupes = regrouperParValeur(cartes);
    let brelanCount = 0;
    for (const groupe of Object.values(groupes)) {
        if (groupe.length >= 3) {
            brelanCount++;
        }
    }
    return brelanCount >= 2;
}

// Compléter les combinaisons existantes
function peutCompleterCombinaison(carte, combinaison) {
    if (combinaison.type === 'suite') {
        const valeurs = combinaison.cartes.map(c => c.nombre).concat(carte.nombre).sort((a, b) => a - b);
        return valeurs.every((val, i, arr) => i === 0 || arr[i] === arr[i - 1] + 1);
    } else if (combinaison.type === 'brelan' || combinaison.type === 'carre') {
        return combinaison.cartes[0].nombre === carte.nombre;
    } else if (combinaison.type === 'couleur') {
        return combinaison.cartes[0].couleur === carte.couleur;
    }
    return false;
}

function tenterCompleterCombinaisons(joueur, combinaisons) {
    let cartesRestantes = joueur.cartesEnMain.slice();
    for (const combinaison of combinaisons) {
        cartesRestantes = cartesRestantes.filter(carte => {
            if (peutCompleterCombinaison(carte, combinaison)) {
                combinaison.cartes.push(carte);
                console.log(`${joueur.nom} a complété la ${combinaison.type} avec ${carte.couleur} ${carte.nombre}`);
                return false;
            }
            return true;
        });
    }
    joueur.cartesEnMain = cartesRestantes;
}

// Fonction pour tenter de franchir un palier
function essayerFranchirPalier(joueur, combinaisons) {
    if (peutFranchirPalier(joueur)) {
        console.log(`${joueur.nom} a franchi le palier ${joueur.palierActuel}!`);
        joueur.palierActuel++;

        const cartesPourPalier = poserCartesPourPalier(joueur);
        combinaisons.push(...cartesPourPalier);

        tenterCompleterCombinaisons(joueur, combinaisons);

        return true;
    } else {
        console.log(`${joueur.nom} ne peut pas franchir le palier ${joueur.palierActuel}.`);
        return false;
    }
}

function poserCartesPourPalier(joueur) {
    const cartesPourPalier = joueur.cartesEnMain.slice(0, 4);
    joueur.cartesEnMain = joueur.cartesEnMain.slice(4);
    return [{ type: 'suite', cartes: cartesPourPalier }];
}

// Fonction pour terminer la manche si un joueur a posé toutes ses cartes
function verifierFinDeManche(joueurs) {
    for (const joueur of joueurs) {
        if (joueur.cartesEnMain.length === 0) {
            console.log(`${joueur.nom} a posé toutes ses cartes! La manche se termine.`);
            return true;
        }
    }
    return false;
}

function verifierFinDeJeu(joueurs) {
    for (const joueur of joueurs) {
        if (joueur.palierActuel > 8 && joueur.cartesEnMain.length === 0) {
            console.log(`${joueur.nom} a atteint le palier 8 et a terminé toutes ses cartes! Le jeu est terminé.`);
            return true;
        }
    }
    return false;
}

function recommencerNouvelleManche(joueurs) {
    console.log("Recommence une nouvelle manche.");
    for (const joueur of joueurs) {
        joueur.cartesEnMain = distribuerCartes(10);
        joueur.defausse = [];
    }
}

function distribuerCartes(nombre) {
    const cartes = [];
    for (let i = 0; i < nombre; i++) {
        cartes.push(creerCarteAleatoire());
    }
    return cartes;
}

function creerCarteAleatoire() {
    const couleurs = ["rouge", "bleu", "violet", "blanc", "vert", "jaune"];
    const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];
    const nombre = Math.floor(Math.random() * 18) + 1;
    return { couleur, nombre };
}

function initJoueurs(nombreDeJoueurs) {
    let joueurs = [];
    for (let i = 0; i < nombreDeJoueurs; i++) {
        const nom = prompt(`Entrez le nom du joueur ${i + 1}:`);
        joueurs.push({
            nom: nom || `Joueur ${i + 1}`,
            cartesEnMain: distribuerCartes(10),
            cartesPalier: creerCartesPalier(),
            defausse: [],
            palierActuel: 1
        });
    }
    return joueurs;
}

function creerCartesPalier() {
    return [
        { type: 'suite', longueur: 4 },
        { type: 'couleur', longueur: 4 },
        { type: 'brelan', longueur: 3 },
        // Ajouter les autres paliers ici
    ];
}

// Fonction principale pour gérer la partie
function jouerPartie(nombreDeJoueurs) {
    let joueurs = initJoueurs(nombreDeJoueurs);
    let combinaisons = [];

    while (true) {
        for (const joueur of joueurs) {
            console.log(`\nTour de ${joueur.nom}:`);

            // Étape 1 : Piocher une carte
            piocherCarte(joueur);

            // Étape 2 : Essayer de franchir un palier
            essayerFranchirPalier(joueur, combinaisons);

            // Étape 3 : Poser une carte dans la défausse
            poserCarteDansDefausse(joueur);

            if (verifierFinDeJeu(joueurs)) {
                console.log("Le jeu est terminé.");
                return;
            }

            if (verifierFinDeManche(joueurs)) {
                recommencerNouvelleManche(joueurs);
            }
        }
    }
}

// Fonction pour piocher une carte (simulé ici par une carte aléatoire)
function piocherCarte

// Fonction pour piocher une carte et l'ajouter à la main du joueur
function piocherCarte(joueur) {
    const nouvelleCarte = creerCarteAleatoire();
    joueur.cartesEnMain.push(nouvelleCarte);
    console.log(`${joueur.nom} a pioché une carte : ${nouvelleCarte.couleur} ${nouvelleCarte.nombre}`);
}

// Fonction pour poser une carte dans la défausse du joueur
function poserCarteDansDefausse(joueur) {
    const carteDefaussee = joueur.cartesEnMain.pop(); // Le joueur défausse la dernière carte de sa main
    joueur.defausse.push(carteDefaussee);
    console.log(`${joueur.nom} a défaussé une carte : ${carteDefaussee.couleur} ${carteDefaussee.nombre}`);
}