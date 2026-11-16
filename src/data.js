// Content for "¡Vale!" — survival Spanish (Spain) for French speakers.
// Phonetics are written for French readers: the STRESSED syllable is in capitals,
// "ss" = hard s, "th" = English th (z, ce, ci), "kh" = throaty j, "y" = ll,
// "gn" = ñ, "r" = tapped r, "rr" = rolled r, doubled n/m after a vowel = no nasal sound.
// Item keys: es, fr, ph, n (note), g (synonym group: never used as distractors
// for each other), k (kind: items of the same kind are preferred as distractors).

module.exports = {
  lessons: [
    {
      id: 'base', t: 'Les essentiels', es: 'Lo esencial', d: 'Saluer, remercier, s’excuser',
      items: [
        { es: 'Hola', fr: 'Salut / Bonjour', ph: 'O-la', n: 'Le H est toujours muet. Marche à toute heure.', g: 'hi' },
        { es: '¡Buenas!', fr: 'Salut ! (à toute heure)', ph: 'BOUÉ-nass', n: 'Ultra courant : en entrant dans un bar, une boutique, un ascenseur.', g: 'hi' },
        { es: 'Buenos días', fr: 'Bonjour (le matin)', ph: 'BOUÉ-noss DI-ass', n: 'Jusqu’au déjeuner, vers 14 h.', g: 'hi' },
        { es: 'Buenas tardes', fr: 'Bonjour (l’après-midi)', ph: 'BOUÉ-nass TAR-déss', n: 'Du déjeuner jusqu’à la nuit tombée.', g: 'hi' },
        { es: 'Buenas noches', fr: 'Bonsoir / Bonne nuit', ph: 'BOUÉ-nass NO-tchéss', g: 'hi' },
        { es: 'Por favor', fr: 'S’il vous plaît', ph: 'por fa-BOR', n: 'Le V se prononce presque comme un B.' },
        { es: 'Gracias', fr: 'Merci', ph: 'GRA-thyass', n: 'Muchas gracias = merci beaucoup. Dans le Sud, on dit « GRA-ssyass ».' },
        { es: 'De nada', fr: 'De rien', ph: 'dé NA-da' },
        { es: 'Perdón', fr: 'Pardon', ph: 'pèr-DONN', n: 'Pour s’excuser, ou pour se frayer un passage.', g: 'sorry' },
        { es: 'Disculpe', fr: 'Excusez-moi', ph: 'diss-KOUL-pé', n: 'Pour interpeller poliment un serveur ou un passant.', g: 'sorry' },
        { es: 'Vale', fr: 'D’accord / OK', ph: 'BA-lé', n: 'LE mot d’Espagne. Tu vas l’entendre partout.' },
        { es: 'Adiós', fr: 'Au revoir', ph: 'a-DYOSS', g: 'bye' },
        { es: 'Hasta luego', fr: 'À plus tard', ph: 'ASS-ta LOUÉ-go', n: 'Se dit pour prendre congé, même si on ne se revoit jamais.', g: 'bye' }
      ]
    },
    {
      id: 'parler', t: 'Se faire comprendre', es: 'Hablar un poco', d: 'Quand on ne comprend rien',
      items: [
        { es: 'No hablo español', fr: 'Je ne parle pas espagnol', ph: 'no A-blo éss-pa-GNOL' },
        { es: 'Hablo un poco de español', fr: 'Je parle un peu espagnol', ph: 'A-blo oun PO-ko dé éss-pa-GNOL', n: 'Effet garanti : les gens adorent qu’on essaie.' },
        { es: '¿Habla francés?', fr: 'Vous parlez français ?', ph: 'A-bla frann-THÉSS', n: '¿Habla inglés? = Vous parlez anglais ?' },
        { es: 'No entiendo', fr: 'Je ne comprends pas', ph: 'no ènn-TYÈNN-do' },
        { es: 'Más despacio, por favor', fr: 'Plus lentement, s’il vous plaît', ph: 'MASS déss-PA-thyo, por fa-BOR' },
        { es: '¿Puede repetir?', fr: 'Vous pouvez répéter ?', ph: 'POUÉ-dé rré-pé-TIR' },
        { es: '¿Cómo se dice…?', fr: 'Comment dit-on… ?', ph: 'KO-mo sé DI-thé', n: 'En montrant un objet : ¿Cómo se dice esto? (comment on dit ça ?)' },
        { es: 'Me llamo…', fr: 'Je m’appelle…', ph: 'mé YA-mo', n: '¿Cómo te llamas? = Comment tu t’appelles ?' },
        { es: 'Soy francés / francesa', fr: 'Je suis français / française', ph: 'SOÏ frann-THÉSS / frann-THÉ-ssa', n: 'Belge : belga · Suisse : suizo, suiza · Canadien : canadiense.' },
        { es: 'Encantado / Encantada', fr: 'Enchanté / Enchantée', ph: 'ènn-kann-TA-do / ènn-kann-TA-da', n: '-o si tu es un homme, -a si tu es une femme.' },
        { es: 'Lo siento', fr: 'Je suis désolé(e)', ph: 'lo SYÈNN-to' },
        { es: 'No pasa nada', fr: 'Pas de souci', ph: 'no PA-ssa NA-da', n: 'La réponse typique quand tu t’excuses.' }
      ]
    },
    {
      id: 'cles', t: 'Les mots-clés', es: 'Palabras clave', d: 'Pour bricoler n’importe quelle phrase',
      items: [
        { es: '¿Dónde está…?', fr: 'Où est… ?', ph: 'DONN-dé éss-TA', n: '¿Dónde está la playa? = Où est la plage ?' },
        { es: '¿Hay…?', fr: 'Il y a… ?', ph: 'AÏ', n: 'Se dit « aï ». ¿Hay wifi? ¿Hay mesa? (il y a une table ?)' },
        { es: 'Quería…', fr: 'Je voudrais…', ph: 'ké-RI-a', n: 'La façon polie de demander : Quería un café.' },
        { es: 'Necesito…', fr: 'J’ai besoin de…', ph: 'né-thé-SSI-to' },
        { es: '¿Puedo…?', fr: 'Je peux… ?', ph: 'POUÉ-do', n: '¿Puedo pagar? ¿Puedo entrar? (je peux entrer ?)' },
        { es: '¿Tiene…?', fr: 'Vous avez… ?', ph: 'TYÉ-né', n: '¿Tiene agua? = Vous avez de l’eau ?' },
        { es: 'Con / sin', fr: 'Avec / sans', ph: 'KONN / SINN', n: 'Café con leche, agua sin gas.' },
        { es: 'Aquí / allí', fr: 'Ici / là-bas', ph: 'a-KI / a-YI' },
        { es: '¿Qué es esto?', fr: 'Qu’est-ce que c’est ?', ph: 'KÉ éss ÉSS-to' },
        { es: 'Hoy / mañana', fr: 'Aujourd’hui / demain', ph: 'OÏ / ma-GNA-na', n: 'Por la mañana = le matin · ayer = hier.' },
        { es: 'Ahora', fr: 'Maintenant', ph: 'a-O-ra', n: 'Ahora mismo = tout de suite.' }
      ]
    },
    {
      id: 'nombres', t: 'Chiffres & prix', es: 'Números', d: 'Compter, payer',
      items: [
        { es: 'Uno', fr: '1', ph: 'OU-no', k: 'num', n: 'Devant un nom : un café, una cerveza.' },
        { es: 'Dos', fr: '2', ph: 'DOSS', k: 'num' },
        { es: 'Tres', fr: '3', ph: 'TRÉSS', k: 'num' },
        { es: 'Cuatro', fr: '4', ph: 'KOUA-tro', k: 'num' },
        { es: 'Cinco', fr: '5', ph: 'THINN-ko', k: 'num' },
        { es: 'Seis', fr: '6', ph: 'SÉÏSS', k: 'num' },
        { es: 'Siete', fr: '7', ph: 'SYÉ-té', k: 'num' },
        { es: 'Ocho', fr: '8', ph: 'O-tcho', k: 'num' },
        { es: 'Nueve', fr: '9', ph: 'NOUÉ-bé', k: 'num' },
        { es: 'Diez', fr: '10', ph: 'DYÉTH', k: 'num' },
        { es: 'Veinte', fr: '20', ph: 'BÉÏNN-té', k: 'num' },
        { es: 'Cincuenta', fr: '50', ph: 'thinn-KOUÈNN-ta', k: 'num' },
        { es: 'Cien', fr: '100', ph: 'THYÈNN', k: 'num' },
        { es: '¿Cuánto es?', fr: 'C’est combien ?', ph: 'KOUANN-to ÉSS', n: 'Réponse type : son dos con cincuenta (ça fait 2,50 €).' },
        { es: 'Es muy caro', fr: 'C’est très cher', ph: 'éss MOUÏ KA-ro', n: 'Barato = pas cher.' }
      ]
    },
    {
      id: 'bar', t: 'Au café & au bar', es: 'En el bar', d: 'Commander, payer, trinquer',
      items: [
        { es: 'Un café con leche', fr: 'Un café au lait', ph: 'oun ka-FÉ konn LÉ-tché', n: 'Le petit-déjeuner classique, avec une tostada (tartine grillée).' },
        { es: 'Un café solo', fr: 'Un expresso', ph: 'oun ka-FÉ SO-lo', n: 'Un cortado = un expresso avec un nuage de lait.' },
        { es: 'Una caña', fr: 'Une petite bière pression', ph: 'OU-na KA-gna', n: 'Una cerveza = une bière.' },
        { es: 'Una copa de vino tinto', fr: 'Un verre de vin rouge', ph: 'OU-na KO-pa dé BI-no TINN-to', n: 'Blanco = blanc · rosado = rosé.' },
        { es: 'Agua con gas / sin gas', fr: 'Eau gazeuse / plate', ph: 'A-goua konn GASS / sinn GASS' },
        { es: 'Un zumo de naranja', fr: 'Un jus d’orange', ph: 'oun THOU-mo dé na-RANN-kha', n: 'Natural = pressé.' },
        { es: '¿Me pone…?', fr: 'Vous me servez… ?', ph: 'mé PO-né', n: 'La façon espagnole de commander : ¿Me pone una caña?' },
        { es: '¿Qué te pongo?', fr: 'Qu’est-ce que je te sers ?', ph: 'ké té PONN-go', n: 'Ce que le serveur va te dire.' },
        { es: '¿Algo más?', fr: 'Autre chose ?', ph: 'AL-go MASS', n: 'Réponds : nada más, gracias (rien d’autre, merci).' },
        { es: 'La cuenta, por favor', fr: 'L’addition, s’il vous plaît', ph: 'la KOUÈNN-ta, por fa-BOR', n: 'Très espagnol aussi : ¿Me cobras? (tu m’encaisses ?)' },
        { es: 'Para llevar', fr: 'À emporter', ph: 'PA-ra yé-BAR', n: 'Para tomar aquí = sur place.' },
        { es: '¡Salud!', fr: 'Santé !', ph: 'sa-LOUD', n: 'Le D final s’entend à peine.' }
      ]
    },
    {
      id: 'resto', t: 'Au restaurant', es: 'En el restaurante', d: 'Tapas, menu du jour, allergies',
      items: [
        { es: 'Una mesa para dos', fr: 'Une table pour deux', ph: 'OU-na MÉ-ssa PA-ra DOSS', n: 'On te demandera : ¿Cuántos sois? Réponds : somos dos (nous sommes deux).' },
        { es: 'La carta, por favor', fr: 'La carte, s’il vous plaît', ph: 'la KAR-ta, por fa-BOR', n: 'Attention : la carta = la carte ; el menú = la formule.' },
        { es: '¿Qué me recomienda?', fr: 'Que me conseillez-vous ?', ph: 'ké mé rré-ko-MYÈNN-da' },
        { es: 'Para mí…', fr: 'Pour moi…', ph: 'PA-ra MI', n: 'Para mí, la paella. Y para ella… (et pour elle…)' },
        { es: 'El menú del día', fr: 'Le menu du jour', ph: 'él mé-NOU dél DI-a', n: 'Formule du midi en semaine : entrée, plat, dessert ou café, boisson. Souvent la meilleure affaire.' },
        { es: '¿Qué lleva?', fr: 'Qu’est-ce qu’il y a dedans ?', ph: 'ké YÉ-ba' },
        { es: 'Soy vegetariano / vegetariana', fr: 'Je suis végétarien / végétarienne', ph: 'SOÏ bé-khé-ta-RYA-no / bé-khé-ta-RYA-na' },
        { es: 'Soy alérgico / alérgica a…', fr: 'Je suis allergique à…', ph: 'SOÏ a-LÈR-khi-ko / a-LÈR-khi-ka a', n: 'Los frutos secos (fruits à coque) · el marisco (fruits de mer) · el gluten.' },
        { es: 'Una ración', fr: 'Une portion (à partager)', ph: 'OU-na rra-THYONN', n: 'Una tapa = une petite assiette · media ración = une demi-portion.' },
        { es: '¡Está buenísimo!', fr: 'C’est délicieux !', ph: 'éss-TA boué-NI-ssi-mo', n: 'Le compliment qui fait plaisir en cuisine.' },
        { es: '¿Dónde está el baño?', fr: 'Où sont les toilettes ?', ph: 'DONN-dé éss-TA él BA-gno', n: 'Sur les portes : aseos ou servicios.' }
      ]
    },
    {
      id: 'ville', t: 'Se déplacer', es: 'Moverse', d: 'Gare, métro, taxi, directions',
      items: [
        { es: 'El aeropuerto', fr: 'L’aéroport', ph: 'él a-é-ro-POUÉR-to' },
        { es: 'La estación', fr: 'La gare', ph: 'la éss-ta-THYONN', n: 'Estación de tren (gare), de autobuses (gare routière), de metro.' },
        { es: 'La parada de autobús', fr: 'L’arrêt de bus', ph: 'la pa-RA-da dé aou-to-BOUSS' },
        { es: 'Un billete para…', fr: 'Un billet pour…', ph: 'oun bi-YÉ-té PA-ra', n: 'Un billete para Sevilla, por favor.' },
        { es: 'Ida y vuelta', fr: 'Aller-retour', ph: 'I-da i BOUÉL-ta', n: 'Solo ida = aller simple.' },
        { es: 'A la derecha', fr: 'À droite', ph: 'a la dé-RÉ-tcha' },
        { es: 'A la izquierda', fr: 'À gauche', ph: 'a la ith-KYÈR-da' },
        { es: 'Todo recto', fr: 'Tout droit', ph: 'TO-do RRÉK-to' },
        { es: '¿Está lejos?', fr: 'C’est loin ?', ph: 'éss-TA LÉ-khoss', n: 'Cerca = près.' },
        { es: 'Al centro, por favor', fr: 'Au centre-ville, s’il vous plaît', ph: 'al THÈNN-tro, por fa-BOR', n: 'En taxi : al hotel… (à l’hôtel…), a la calle… (rue…).' },
        { es: 'Aquí está bien', fr: 'Ici, c’est parfait', ph: 'a-KI éss-TA BYÈNN', n: 'Pour demander au taxi de s’arrêter.' },
        { es: 'Estoy perdido / perdida', fr: 'Je suis perdu / perdue', ph: 'éss-TOÏ pèr-DI-do / pèr-DI-da' }
      ]
    },
    {
      id: 'hotel', t: 'À l’hôtel', es: 'En el hotel', d: 'Arriver, s’installer',
      items: [
        { es: 'Tengo una reserva', fr: 'J’ai une réservation', ph: 'TÉNN-go OU-na rré-SSÈR-ba' },
        { es: 'A nombre de…', fr: 'Au nom de…', ph: 'a NOMM-bré dé' },
        { es: 'La habitación', fr: 'La chambre', ph: 'la a-bi-ta-THYONN' },
        { es: 'La llave', fr: 'La clé', ph: 'la YA-bé' },
        { es: '¿A qué hora es el desayuno?', fr: 'À quelle heure est le petit-déjeuner ?', ph: 'a KÉ O-ra éss él dé-ssa-YOU-no' },
        { es: '¿Cuál es la contraseña del wifi?', fr: 'Quel est le code du wifi ?', ph: 'KOUAL éss la konn-tra-SSÉ-gna dél OUI-fi', n: 'Beaucoup d’Espagnols disent « GOUI-fi ».' },
        { es: 'No funciona', fr: 'Ça ne marche pas', ph: 'no foun-THYO-na', n: 'El aire acondicionado no funciona = la clim ne marche pas.' },
        { es: '¿Puedo dejar la maleta?', fr: 'Je peux laisser ma valise ?', ph: 'POUÉ-do dé-KHAR la ma-LÉ-ta' },
        { es: 'Aquí tiene', fr: 'Tenez / Voilà', ph: 'a-KI TYÉ-né', n: 'Ce qu’on dit en tendant quelque chose : passeport, monnaie…' }
      ]
    },
    {
      id: 'shopping', t: 'Courses & shopping', es: 'De compras', d: 'Prix, carte bancaire, horaires',
      items: [
        { es: '¿Cuánto cuesta esto?', fr: 'Combien coûte ceci ?', ph: 'KOUANN-to KOUÉSS-ta ÉSS-to' },
        { es: 'Solo estoy mirando', fr: 'Je regarde seulement', ph: 'SO-lo éss-TOÏ mi-RANN-do' },
        { es: '¿Puedo pagar con tarjeta?', fr: 'Je peux payer par carte ?', ph: 'POUÉ-do pa-GAR konn tar-KHÉ-ta', n: 'En efectivo = en espèces.' },
        { es: 'Me lo llevo', fr: 'Je le prends', ph: 'mé lo YÉ-bo' },
        { es: '¿Tiene otra talla?', fr: 'Vous avez une autre taille ?', ph: 'TYÉ-né O-tra TA-ya', n: 'Más grande = plus grande · más pequeña = plus petite.' },
        { es: 'Una bolsa, por favor', fr: 'Un sac, s’il vous plaît', ph: 'OU-na BOL-ssa, por fa-BOR', n: 'Les sacs sont souvent payants.' },
        { es: '¿A qué hora abren?', fr: 'À quelle heure vous ouvrez ?', ph: 'a KÉ O-ra A-brénn', n: '¿A qué hora cierran? = À quelle heure vous fermez ?' },
        { es: 'Abierto / Cerrado', fr: 'Ouvert / Fermé', ph: 'a-BYÈR-to / thé-RRA-do' }
      ]
    },
    {
      id: 'urgences', t: 'Urgences & santé', es: 'Emergencias', d: 'Au cas où',
      items: [
        { es: '¡Ayuda!', fr: 'À l’aide !', ph: 'a-YOU-da', n: 'On crie aussi ¡Socorro! (so-KO-rro). Urgences : 112, gratuit, partout en Espagne.' },
        { es: 'Necesito un médico', fr: 'J’ai besoin d’un médecin', ph: 'né-thé-SSI-to oun MÉ-di-ko' },
        { es: '¿Dónde hay una farmacia?', fr: 'Où y a-t-il une pharmacie ?', ph: 'DONN-dé AÏ OU-na far-MA-thya', n: 'Croix verte. Farmacia de guardia = pharmacie de garde.' },
        { es: 'Me duele aquí', fr: 'J’ai mal ici', ph: 'mé DOUÉ-lé a-KI', n: 'En montrant l’endroit.' },
        { es: 'Me duele la cabeza', fr: 'J’ai mal à la tête', ph: 'mé DOUÉ-lé la ka-BÉ-tha', n: 'El estómago (le ventre) · la garganta (la gorge).' },
        { es: 'He perdido mi pasaporte', fr: 'J’ai perdu mon passeport', ph: 'é pèr-DI-do mi pa-ssa-POR-té', n: 'Mi móvil = mon portable · mi cartera = mon portefeuille.' },
        { es: 'Me han robado', fr: 'On m’a volé', ph: 'mé ANN rro-BA-do', n: 'Pour porter plainte : la comisaría (le commissariat).' },
        { es: 'Llame a la policía', fr: 'Appelez la police', ph: 'YA-mé a la po-li-THI-a', n: 'Llame a una ambulancia = Appelez une ambulance.' }
      ]
    }
  ],

  scenes: [
    {
      id: 'cafe', t: 'Au café', es: 'En la cafetería', d: 'Ton premier café espagnol',
      lines: [
        { w: 't', es: '¡Hola, buenos días! ¿Qué te pongo?', fr: 'Bonjour ! Qu’est-ce que je te sers ?' },
        { w: 'y', task: 'Commande un café au lait.', o: ['Un café con leche, por favor.', 'Una mesa para dos, por favor.', '¿Dónde está el baño?'] },
        { w: 't', es: '¿Algo más?', fr: 'Autre chose ?' },
        { w: 'y', task: 'Ajoute un jus d’orange.', o: ['Y un zumo de naranja.', 'Y una caña.', 'Y la llave.'] },
        { w: 't', es: '¿Para tomar aquí o para llevar?', fr: 'Sur place ou à emporter ?' },
        { w: 'y', task: 'Sur place.', o: ['Para tomar aquí.', 'Para llevar.', 'Para mí.'] },
        { w: 't', es: 'Muy bien. Son cuatro euros con veinte.', fr: 'Très bien. Ça fait 4,20 €.' },
        { w: 'y', task: 'Demande si tu peux payer par carte.', o: ['¿Puedo pagar con tarjeta?', '¿Cuánto es?', '¿Tiene otra talla?'] },
        { w: 't', es: 'Sí, claro.', fr: 'Oui, bien sûr.' },
        { w: 'y', task: 'Remercie chaleureusement.', o: ['¡Muchas gracias!', '¡De nada!', '¡Lo siento!'] },
        { w: 't', es: 'A ti. ¡Hasta luego!', fr: 'Merci à toi. À plus !' }
      ]
    },
    {
      id: 'tapas', t: 'Au bar à tapas', es: 'De tapas', d: 'À boire, à grignoter, l’addition',
      lines: [
        { w: 't', es: '¡Buenas! ¿Cuántos sois?', fr: 'Bonsoir ! Vous êtes combien ?' },
        { w: 'y', task: 'Vous êtes deux.', o: ['Somos dos.', 'Son las dos.', 'Dos euros.'] },
        { w: 't', es: 'Aquí tenéis la carta. ¿Qué os pongo de beber?', fr: 'Voici la carte. Je vous sers quoi à boire ?' },
        { w: 'y', task: 'Commande deux petites bières pression.', o: ['Dos cañas, por favor.', 'Dos cafés solos, por favor.', 'Dos billetes, por favor.'] },
        { w: 't', es: '¿Y para comer?', fr: 'Et à manger ?' },
        { w: 'y', task: 'Demande ce qu’il vous conseille.', o: ['¿Qué nos recomienda?', '¿Qué hora es?', '¿Cómo te llamas?'] },
        { w: 't', es: 'Las croquetas de jamón están buenísimas.', fr: 'Les croquettes au jambon sont délicieuses.' },
        { w: 'y', task: 'Prends une portion de croquettes.', o: ['Una ración de croquetas, por favor.', 'La cuenta, por favor.', 'No entiendo.'] },
        { w: 't', es: '¡Marchando!', fr: 'Ça arrive ! (argot de comptoir)' },
        { w: 'y', task: 'Plus tard, demande l’addition.', o: ['La cuenta, por favor.', 'La carta, por favor.', 'La llave, por favor.'] },
        { w: 't', es: 'Ahora mismo.', fr: 'Tout de suite.' }
      ]
    },
    {
      id: 'taxi', t: 'En taxi', es: 'En el taxi', d: 'De l’aéroport à l’hôtel',
      lines: [
        { w: 't', es: 'Buenas tardes. ¿Adónde vamos?', fr: 'Bonjour. On va où ?' },
        { w: 'y', task: 'Demande l’hôtel Sol.', o: ['Al hotel Sol, por favor.', 'Tengo una reserva.', 'Estoy perdido.'] },
        { w: 't', es: 'Vale. ¿Es tu primera vez en España?', fr: 'D’accord. C’est ta première fois en Espagne ?' },
        { w: 'y', task: 'Oui, et tu parles un peu espagnol.', o: ['Sí. Hablo un poco de español.', 'No hablo español.', 'Sí, la cuenta.'] },
        { w: 't', es: '¡Pues lo hablas muy bien!', fr: 'Eh bien, tu le parles très bien !' },
        { w: 'y', task: 'Demande si c’est loin.', o: ['¿Está lejos?', '¿Está abierto?', '¿Está buenísimo?'] },
        { w: 't', es: 'No, unos veinte minutos.', fr: 'Non, une vingtaine de minutes.' },
        { w: 't', es: 'Ya estamos. Son veinte euros.', fr: 'Nous y sommes. Ça fait 20 €.' },
        { w: 'y', task: 'Tends l’argent : « Tenez ».', o: ['Aquí tiene.', 'Aquí está bien.', 'A la derecha.'] },
        { w: 't', es: 'Gracias. ¡Buen viaje!', fr: 'Merci. Bon voyage !' },
        { w: 'y', task: 'Dis merci et au revoir.', o: ['Gracias, ¡adiós!', 'Perdón, ¡hola!', 'De nada, ¡vale!'] }
      ]
    },
    {
      id: 'hotel', t: 'À l’hôtel', es: 'En el hotel', d: 'Un check-in sans stress',
      lines: [
        { w: 't', es: 'Buenas noches. ¿En qué puedo ayudarle?', fr: 'Bonsoir. Que puis-je faire pour vous ?' },
        { w: 'y', task: 'Dis que tu as une réservation.', o: ['Tengo una reserva.', 'Tengo una pregunta.', 'No funciona.'] },
        { w: 't', es: '¿A nombre de quién?', fr: 'À quel nom ?' },
        { w: 'y', task: 'Au nom de Martin.', o: ['A nombre de Martin.', 'A la derecha.', 'A las ocho.'] },
        { w: 't', es: 'Perfecto. ¿Me deja su pasaporte, por favor?', fr: 'Parfait. Votre passeport, s’il vous plaît ?' },
        { w: 'y', task: 'Tends-le : « Tenez ».', o: ['Aquí tiene.', 'Aquí está bien.', 'Allí.'] },
        { w: 't', es: 'Gracias. Su habitación es la diez. Aquí tiene la llave.', fr: 'Merci. Votre chambre est la 10. Voici la clé.' },
        { w: 'y', task: 'Demande l’heure du petit-déjeuner.', o: ['¿A qué hora es el desayuno?', '¿A qué hora abren?', '¿Qué hora es?'] },
        { w: 't', es: 'De siete a diez y media.', fr: 'De 7 h à 10 h 30.' },
        { w: 'y', task: 'Demande le code du wifi.', o: ['¿Cuál es la contraseña del wifi?', '¿Tiene otra talla?', '¿Puedo dejar la maleta?'] },
        { w: 't', es: 'Está en la tarjeta de la habitación. ¡Que descanse!', fr: 'Il est sur la carte de la chambre. Reposez-vous bien !' }
      ]
    },
    {
      id: 'rue', t: 'Demander son chemin', es: 'Por la calle', d: 'Se repérer sans réseau',
      lines: [
        { w: 'y', task: 'Interpelle poliment un passant.', o: ['Disculpe…', '¡Ayuda!', '¡Salud!'] },
        { w: 't', es: '¿Sí? Dime.', fr: 'Oui ? Je t’écoute.' },
        { w: 'y', task: 'Demande où est le métro.', o: ['¿Dónde está el metro?', '¿Dónde está el baño?', '¿Cuánto cuesta el metro?'] },
        { w: 't', es: 'Sigue todo recto y luego, la segunda a la derecha.', fr: 'Continue tout droit, puis la deuxième à droite.' },
        { w: 'y', task: 'Tu n’as pas tout compris : demande de répéter plus lentement.', o: ['¿Puede repetir más despacio?', '¿Puedo pagar con tarjeta?', '¿Puedo dejar la maleta?'] },
        { w: 't', es: 'Claro. Todo recto… y la segunda a la derecha.', fr: 'Bien sûr. Tout droit… et la deuxième à droite.' },
        { w: 'y', task: 'Demande si c’est loin.', o: ['¿Está lejos?', '¿Está cerrado?', '¿Es muy caro?'] },
        { w: 't', es: 'No, está a cinco minutos.', fr: 'Non, c’est à cinq minutes.' },
        { w: 'y', task: 'Remercie beaucoup.', o: ['¡Muchas gracias!', '¡Mucho gusto!', '¡Muy bien!'] },
        { w: 't', es: 'De nada. ¡Hasta luego!', fr: 'De rien. À plus !' }
      ]
    },
    {
      id: 'pharma', t: 'À la pharmacie', es: 'En la farmacia', d: 'Un petit bobo',
      lines: [
        { w: 't', es: 'Hola, buenos días. Dígame.', fr: 'Bonjour. Je vous écoute.' },
        { w: 'y', task: 'Dis que tu as mal à la tête.', o: ['Me duele la cabeza.', 'Me duele la garganta.', 'Me han robado.'] },
        { w: 't', es: '¿Desde cuándo?', fr: 'Depuis quand ?' },
        { w: 'y', task: 'Depuis hier.', o: ['Desde ayer.', 'Desde mañana.', 'Hasta luego.'] },
        { w: 't', es: '¿Es alérgico a algún medicamento?', fr: 'Vous êtes allergique à un médicament ?' },
        { w: 'y', task: 'Réponds non, à aucun.', o: ['No, a ninguno.', 'No entiendo.', 'Sí, a todos.'] },
        { w: 't', es: 'Tome una pastilla cada ocho horas, después de comer.', fr: 'Prenez un comprimé toutes les huit heures, après le repas.' },
        { w: 'y', task: 'Demande combien ça coûte.', o: ['¿Cuánto es?', '¿Cuántos sois?', '¿Qué es esto?'] },
        { w: 't', es: 'Son seis euros con cincuenta.', fr: 'Ça fait 6,50 €.' },
        { w: 'y', task: 'Remercie et dis au revoir.', o: ['Muchas gracias, ¡hasta luego!', 'De nada, ¡buenas noches!', 'Lo siento, ¡adiós!'] },
        { w: 't', es: '¡Que se mejore!', fr: 'Bon rétablissement !' }
      ]
    }
  ],

  sounds: [
    { k: 'U', t: 'Le U se dit « ou »', d: 'Toujours. Jamais le « u » français.', ex: [['Uno', 'OU-no'], ['Música', 'MOU-ssi-ka']] },
    { k: 'E', t: 'Le E se dit « é »', d: 'Il ne s’efface jamais, même en fin de mot.', ex: [['Leche', 'LÉ-tché'], ['Noche', 'NO-tché']] },
    { k: 'J', t: 'J, et G devant E ou I : « kh »', d: 'Un souffle raclé au fond de la gorge, comme dans « Bach ».', ex: [['Jamón', 'kha-MONN'], ['Gente', 'KHÉNN-té']] },
    { k: 'Z', t: 'Z, et C devant E ou I : « th »', d: 'Le « th » anglais de « think ». Dans le Sud, on dit « s » : les deux sont compris.', ex: [['Gracias', 'GRA-thyass'], ['Cerveza', 'thèr-BÉ-tha']] },
    { k: 'LL', t: 'LL et Y : « y »', d: 'Comme dans « yeux ».', ex: [['Paella', 'pa-É-ya'], ['Llave', 'YA-bé']] },
    { k: 'Ñ', t: 'Ñ : « gn »', d: 'Comme dans « montagne ».', ex: [['España', 'éss-PA-gna'], ['Mañana', 'ma-GNA-na']] },
    { k: 'R', t: 'Le R est roulé', d: 'Un R : une petite frappe de la langue. RR, ou R en début de mot : roulé long.', ex: [['Pero', 'PÉ-ro', 'mais'], ['Perro', 'PÉ-rro', 'chien']] },
    { k: 'H', t: 'Le H est muet', d: 'On ne le prononce jamais.', ex: [['Hola', 'O-la'], ['Hotel', 'o-TÉL']] },
    { k: 'V', t: 'Le V se dit B', d: 'Lèvres jointes, tout en douceur.', ex: [['Vino', 'BI-no'], ['Vale', 'BA-lé']] },
    { k: 'S', t: 'Le S est toujours dur', d: 'Jamais « z », même entre deux voyelles.', ex: [['Casa', 'KA-ssa'], ['Mesa', 'MÉ-ssa']] },
    { k: 'N', t: 'Pas de son nasal', d: '« En », « an », « on » : on entend le N, comme dans « bienne ».', ex: [['Bien', 'BYÈNN'], ['Tengo', 'TÉNN-go']] },
    { k: 'CH', t: 'CH : « tch »', d: 'Comme dans « tchin-tchin ».', ex: [['Churros', 'TCHOU-rross'], ['Ocho', 'O-tcho']] },
    { k: 'Á', t: 'Une syllabe est appuyée', d: 'Elle apparaît en couleur dans les phonétiques. Un accent écrit (á, é, í, ó, ú) indique où appuyer.', ex: [['Café', 'ka-FÉ'], ['Médico', 'MÉ-di-ko']] }
  ],

  tips: [
    { i: 'clock', t: 'Horaires', d: 'Déjeuner vers 14 h, dîner vers 21 h 30.' },
    { i: 'check', t: 'Vale', d: 'OK, d’accord. Tu l’entendras partout.' },
    { i: 'chat', t: '¡Buenas!', d: 'Bonjour décontracté, à toute heure.' },
    { i: 'bell', t: 'L’addition', d: 'Elle n’arrive que si tu la demandes.' },
    { i: 'euro', t: 'Pourboire', d: 'Facultatif : on arrondit.' },
    { i: 'cross', t: '112', d: 'Urgences, gratuit, partout en Espagne.' }
  ],

  extras: [
    {
      id: 'carte', t: 'À table', d: 'Décoder la carte',
      items: [
        { es: 'Patatas bravas', ph: 'pa-TA-tass BRA-bass', fr: 'Pommes de terre frites, sauce tomate piquante' },
        { es: 'Tortilla de patatas', ph: 'tor-TI-ya dé pa-TA-tass', fr: 'Omelette épaisse aux pommes de terre, parfois aux oignons' },
        { es: 'Jamón ibérico', ph: 'kha-MONN i-BÉ-ri-ko', fr: 'Jambon ibérique, affiné de longs mois' },
        { es: 'Croquetas', ph: 'kro-KÉ-tass', fr: 'Croquettes crémeuses : jambon, morue (bacalao), poulet…' },
        { es: 'Pulpo a la gallega', ph: 'POUL-po a la ga-YÉ-ga', fr: 'Poulpe tiède, paprika, huile d’olive, gros sel' },
        { es: 'Gambas al ajillo', ph: 'GAMM-bass al a-KHI-yo', fr: 'Crevettes grésillantes à l’ail et au piment' },
        { es: 'Pimientos de Padrón', ph: 'pi-MYÈNN-toss dé pa-DRONN', fr: 'Petits piments verts frits. Certains piquent !' },
        { es: 'Calamares a la romana', ph: 'ka-la-MA-réss a la rro-MA-na', fr: 'Anneaux de calamar frits en beignet' },
        { es: 'Boquerones en vinagre', ph: 'bo-ké-RO-néss ènn bi-NA-gré', fr: 'Anchois frais marinés au vinaigre et à l’ail' },
        { es: 'Pan con tomate', ph: 'PANN konn to-MA-té', fr: 'Pain grillé frotté de tomate et d’huile d’olive' },
        { es: 'Queso manchego', ph: 'KÉ-sso mann-TCHÉ-go', fr: 'Fromage de brebis de la Manche' },
        { es: 'Albóndigas', ph: 'al-BONN-di-gass', fr: 'Boulettes de viande en sauce' },
        { es: 'Ensaladilla rusa', ph: 'ènn-sa-la-DI-ya RROU-ssa', fr: 'Salade de pommes de terre, thon et mayonnaise' },
        { es: 'Gazpacho', ph: 'gath-PA-tcho', fr: 'Soupe froide de tomate, poivron et concombre' },
        { es: 'Salmorejo', ph: 'sal-mo-RÉ-kho', fr: 'Crème froide de tomate et de pain, œuf et jambon dessus' },
        { es: 'Paella', ph: 'pa-É-ya', fr: 'Riz au safran. Valenciana : poulet, lapin, haricots plats' },
        { es: 'Churros con chocolate', ph: 'TCHOU-rross konn tcho-ko-LA-té', fr: 'Beignets à tremper dans un chocolat chaud épais' },
        { es: 'Tinto de verano', ph: 'TINN-to dé bé-RA-no', fr: 'Vin rouge et limonade sur glaçons, plus courant que la sangria chez les Espagnols' },
        { es: 'Café con hielo', ph: 'ka-FÉ konn YÉ-lo', fr: 'Un café et un verre de glaçons à verser soi-même' },
        { es: 'A la plancha', ph: 'a la PLANN-tcha', fr: 'Grillé sur une plaque' },
        { es: 'Pollo · cerdo · ternera', ph: 'PO-yo · THÈR-do · tèr-NÉ-ra', fr: 'Poulet · porc · bœuf' },
        { es: 'Pescado · marisco', ph: 'péss-KA-do · ma-RISS-ko', fr: 'Poisson · fruits de mer' },
        { es: 'Picante', ph: 'pi-KANN-té', fr: 'Piquant' },
        { es: 'Postre', ph: 'POSS-tré', fr: 'Dessert' }
      ]
    },
    {
      id: 'panneaux', t: 'Panneaux', d: 'Ce que tu liras en arrivant',
      items: [
        { es: 'Llegadas', ph: 'yé-GA-dass', fr: 'Arrivées' },
        { es: 'Recogida de equipajes', ph: 'rré-ko-KHI-da dé é-ki-PA-khéss', fr: 'Retrait des bagages' },
        { es: 'Salida', ph: 'sa-LI-da', fr: 'Sortie' },
        { es: 'Entrada', ph: 'ènn-TRA-da', fr: 'Entrée' },
        { es: 'Aseos · Servicios', ph: 'a-SSÉ-oss · sèr-BI-thyoss', fr: 'Toilettes' },
        { es: 'Caballeros · Señoras', ph: 'ka-ba-YÉ-ross · sé-GNO-rass', fr: 'Hommes · Femmes' },
        { es: 'Empujar · Tirar', ph: 'èmm-pou-KHAR · ti-RAR', fr: 'Pousser · Tirer' },
        { es: 'Abierto · Cerrado', ph: 'a-BYÈR-to · thé-RRA-do', fr: 'Ouvert · Fermé' },
        { es: 'Taquilla', ph: 'ta-KI-ya', fr: 'Guichet' },
        { es: 'Andén', ph: 'ann-DÉNN', fr: 'Quai' },
        { es: 'Caja', ph: 'KA-kha', fr: 'Caisse' },
        { es: 'Prohibido', ph: 'pro-i-BI-do', fr: 'Interdit' },
        { es: 'Farmacia de guardia', ph: 'far-MA-thya dé GOUAR-dya', fr: 'Pharmacie de garde' },
        { es: 'Rebajas', ph: 'rré-BA-khass', fr: 'Soldes' }
      ]
    },
    {
      id: 'pieges', t: 'Faux amis', d: 'Les pièges pour les francophones',
      items: [
        { es: 'Embarazada', ph: 'èmm-ba-ra-THA-da', fr: 'Enceinte (et non « embarrassée »)' },
        { es: 'Constipado', ph: 'konns-ti-PA-do', fr: 'Enrhumé (et non « constipé »)' },
        { es: 'Éxito', ph: 'ÉK-ssi-to', fr: 'Succès (la sortie, c’est salida)' },
        { es: 'Salir', ph: 'sa-LIR', fr: 'Sortir (et non « salir »)' },
        { es: 'Largo', ph: 'LAR-go', fr: 'Long (large se dit ancho)' },
        { es: 'Quitar', ph: 'ki-TAR', fr: 'Enlever (et non « quitter »)' },
        { es: 'Ropa', ph: 'RRO-pa', fr: 'Vêtements (une robe : un vestido)' },
        { es: 'Vaso', ph: 'BA-sso', fr: 'Un verre (et non un vase)' },
        { es: 'Rato', ph: 'RRA-to', fr: 'Un moment (et non un rat)' },
        { es: 'Subir', ph: 'sou-BIR', fr: 'Monter (et non « subir »)' }
      ]
    }
  ]
  ,

  // Word-by-word hints for the scenes (tap a word).
  gloss: {
    'a': 'à', 'abierto': 'ouvert', 'abren': 'ouvrent', 'adiós': 'au revoir', 'adónde': 'où (direction)', 'ahora': 'maintenant',
    'al': 'au (a + el)', 'alérgico': 'allergique', 'algo': 'quelque chose', 'algún': 'un (quelconque)', 'allí': 'là-bas', 'aquí': 'ici',
    'ayer': 'hier', 'ayuda': 'aide', 'ayudarle': 'vous aider', 'baño': 'toilettes', 'beber': 'boire', 'bien': 'bien', 'billetes': 'billets',
    'buen': 'bon', 'buenas': 'bonnes', 'buenísimas': 'délicieuses', 'buenísimo': 'délicieux', 'buenos': 'bons', 'cabeza': 'tête',
    'cada': 'chaque', 'café': 'café', 'cafés': 'cafés', 'caña': 'petite bière', 'cañas': 'petites bières', 'caro': 'cher', 'carta': 'carte (menu)',
    'cerrado': 'fermé', 'cinco': 'cinq', 'cincuenta': 'cinquante', 'claro': 'bien sûr', 'comer': 'manger', 'cómo': 'comment', 'con': 'avec',
    'contraseña': 'mot de passe', 'croquetas': 'croquettes', 'cuál': 'quel', 'cuándo': 'quand', 'cuánto': 'combien', 'cuántos': 'combien',
    'cuatro': 'quatre', 'cuenta': 'addition', 'cuesta': 'coûte', 'de': 'de', 'deja': 'laissez', 'dejar': 'laisser', 'del': 'du', 'derecha': 'droite',
    'desayuno': 'petit-déjeuner', 'descanse': 'reposez-vous', 'desde': 'depuis', 'despacio': 'lentement', 'después': 'après', 'días': 'jours',
    'diez': 'dix', 'dígame': 'je vous écoute', 'dime': 'dis-moi', 'disculpe': 'excusez-moi', 'dónde': 'où', 'dos': 'deux', 'duele': 'fait mal',
    'el': 'le', 'en': 'en, dans', 'entiendo': 'je comprends', 'es': 'est', 'españa': 'Espagne', 'español': 'espagnol', 'está': 'est (se trouve)',
    'estamos': 'nous sommes', 'están': 'sont', 'esto': 'ceci', 'estoy': 'je suis', 'euros': 'euros', 'favor': 'faveur', 'funciona': 'marche',
    'garganta': 'gorge', 'gracias': 'merci', 'gusto': 'plaisir', 'habitación': 'chambre', 'hablas': 'tu parles', 'hablo': 'je parle', 'han': 'ont',
    'hasta': 'jusqu’à', 'hola': 'salut', 'hora': 'heure', 'horas': 'heures', 'hotel': 'hôtel', 'jamón': 'jambon', 'la': 'la', 'las': 'les',
    'leche': 'lait', 'lejos': 'loin', 'llamas': 't’appelles', 'llave': 'clé', 'llevar': 'emporter', 'lo': 'le', 'luego': 'ensuite',
    'maleta': 'valise', 'mañana': 'demain, matin', 'marchando': 'ça arrive !', 'más': 'plus', 'me': 'me', 'media': 'demie',
    'medicamento': 'médicament', 'mejore': 'aille mieux', 'mesa': 'table', 'metro': 'métro', 'mí': 'moi', 'minutos': 'minutes', 'mismo': 'même',
    'muchas': 'beaucoup de', 'mucho': 'beaucoup', 'muy': 'très', 'nada': 'rien', 'naranja': 'orange', 'ninguno': 'aucun', 'no': 'non, ne… pas',
    'noches': 'nuits, soir', 'nombre': 'nom', 'nos': 'nous', 'o': 'ou', 'ocho': 'huit', 'os': 'vous', 'otra': 'autre', 'pagar': 'payer',
    'para': 'pour', 'pasaporte': 'passeport', 'pastilla': 'comprimé', 'perdido': 'perdu', 'perdón': 'pardon', 'perfecto': 'parfait',
    'poco': 'peu', 'pongo': 'je sers', 'por': 'par, pour', 'pregunta': 'question', 'primera': 'première', 'puede': 'vous pouvez',
    'puedo': 'je peux', 'pues': 'eh bien', 'que': 'que', 'qué': 'quoi, que', 'quién': 'qui', 'ración': 'portion', 'recomienda': 'conseillez',
    'recto': 'droit', 'repetir': 'répéter', 'reserva': 'réservation', 'robado': 'volé', 'salud': 'santé', 'se': 'se', 'segunda': 'deuxième',
    'seis': 'six', 'sí': 'oui', 'siento': 'regrette', 'siete': 'sept', 'sigue': 'continue', 'sois': 'vous êtes', 'sol': 'soleil',
    'solos': 'seuls (solo = expresso)', 'somos': 'nous sommes', 'son': 'sont, ça fait', 'su': 'votre', 'talla': 'taille', 'tardes': 'après-midi',
    'tarjeta': 'carte', 'te': 'te', 'tenéis': 'vous avez', 'tengo': 'j’ai', 'ti': 'toi', 'tiene': 'avez, voici', 'todo': 'tout', 'todos': 'tous',
    'tomar': 'prendre', 'tome': 'prenez', 'tu': 'ton, ta', 'un': 'un', 'una': 'une', 'unos': 'environ', 'vale': 'd’accord', 'vamos': 'on va',
    'veinte': 'vingt', 'vez': 'fois', 'viaje': 'voyage', 'wifi': 'wifi', 'y': 'et', 'ya': 'déjà', 'zumo': 'jus'
  },

  // Where you are going: regional packs and tips.
  dests: [
    { id: 'madrid', t: 'Madrid', es: 'Madrid' },
    { id: 'barcelone', t: 'Barcelone', es: 'Barcelona', pack: 'ca' },
    { id: 'valence', t: 'Valence', es: 'Valencia', pack: 'ca' },
    { id: 'baleares', t: 'Baléares', es: 'Baleares', pack: 'ca' },
    { id: 'andalousie', t: 'Andalousie', es: 'Andalucía', south: true },
    { id: 'canaries', t: 'Canaries', es: 'Canarias', south: true },
    { id: 'paysbasque', t: 'Pays basque', es: 'Euskadi', pack: 'eu' },
    { id: 'galice', t: 'Galice', es: 'Galicia', pack: 'gl' },
    { id: 'autre', t: 'Ailleurs', es: 'España' }
  ],
  packs: {
    ca: {
      t: 'Le catalan', es: 'Català', lang: 'ca',
      tip: { t: 'Catalan', d: 'Tout le monde parle espagnol, mais un « Bon dia » fait toujours plaisir. À Valence, les a se prononcent « a ».' },
      items: [
        { es: 'Bon dia', ph: 'bonn DI-eu', fr: 'Bonjour' },
        { es: 'Bona tarda', ph: 'BO-neu TAR-deu', fr: 'Bon après-midi' },
        { es: 'Bona nit', ph: 'BO-neu NIT', fr: 'Bonne nuit' },
        { es: 'Si us plau', ph: 'si ouss PLAOU', fr: 'S’il vous plaît' },
        { es: 'Gràcies', ph: 'GRA-ssi-euss', fr: 'Merci' },
        { es: 'Adéu', ph: 'eu-DÉOU', fr: 'Au revoir' },
        { es: 'D’acord', ph: 'deu-KOR', fr: 'D’accord' },
        { es: 'Perdó', ph: 'peur-DO', fr: 'Pardon' },
        { es: 'Sortida', ph: 'sour-TI-deu', fr: 'Sortie' },
        { es: 'Tancat', ph: 'teunn-KAT', fr: 'Fermé' },
        { es: 'Platja', ph: 'PLA-djeu', fr: 'Plage' },
        { es: 'Carrer', ph: 'keu-RRÉ', fr: 'Rue' }
      ]
    },
    eu: {
      t: 'Le basque', es: 'Euskara', lang: 'eu',
      tip: { t: 'Basque', d: 'Les panneaux sont bilingues et tout le monde parle espagnol. Kaixo et Eskerrik asko ouvrent toutes les portes.' },
      items: [
        { es: 'Kaixo', ph: 'KAÏ-cho', fr: 'Salut' },
        { es: 'Egun on', ph: 'é-GOUNN ONN', fr: 'Bonjour' },
        { es: 'Eskerrik asko', ph: 'éss-ké-RRIK ASS-ko', fr: 'Merci beaucoup' },
        { es: 'Mesedez', ph: 'mé-SSÉ-déss', fr: 'S’il vous plaît' },
        { es: 'Agur', ph: 'a-GOUR', fr: 'Au revoir' },
        { es: 'Irteera', ph: 'ir-té-É-ra', fr: 'Sortie' },
        { es: 'Pintxo', ph: 'PINN-tcho', fr: 'Pintxo (la tapa basque)' }
      ]
    },
    gl: {
      t: 'Le galicien', es: 'Galego', lang: 'gl',
      tip: { t: 'Galicien', d: 'Proche de l’espagnol et du portugais. Tout le monde parle aussi espagnol.' },
      items: [
        { es: 'Bos días', ph: 'boss DI-ass', fr: 'Bonjour' },
        { es: 'Grazas', ph: 'GRA-thass', fr: 'Merci' },
        { es: 'Adeus', ph: 'a-DÉOUSS', fr: 'Au revoir' },
        { es: 'Por favor', ph: 'por fa-BOR', fr: 'S’il vous plaît' },
        { es: 'Saída', ph: 'sa-I-da', fr: 'Sortie' },
        { es: 'Praia', ph: 'PRA-ya', fr: 'Plage' }
      ]
    }
  },
  south: { i: 'sun', t: 'Accent du Sud', d: 'Le z et le c se disent souvent « s », et les s en fin de syllabe s’avalent : ¿Cómo estás? devient « ¿Cómo etá? ».' },

  // Personal survival card.
  card: {
    help: { es: 'No hablo español. ¿Me puede ayudar?', fr: 'Je ne parle pas espagnol. Vous pouvez m’aider ?' },
    sos: { es: 'Necesito un médico. Es urgente.', fr: 'J’ai besoin d’un médecin. C’est urgent.' },
    allergens: [
      { id: 'frutos', es: 'los frutos secos', fr: 'fruits à coque' },
      { id: 'cacahuetes', es: 'los cacahuetes', fr: 'cacahuètes' },
      { id: 'marisco', es: 'el marisco', fr: 'fruits de mer' },
      { id: 'pescado', es: 'el pescado', fr: 'poisson' },
      { id: 'gluten', es: 'el gluten', fr: 'gluten' },
      { id: 'huevo', es: 'el huevo', fr: 'œuf' },
      { id: 'leche', es: 'la leche', fr: 'lait' },
      { id: 'soja', es: 'la soja', fr: 'soja' },
      { id: 'sesamo', es: 'el sésamo', fr: 'sésame' }
    ],
    diets: [
      { id: 'veg', es: 'Soy vegetarian{g}.', fr: 'Je suis végétarien(ne).' },
      { id: 'vegan', es: 'Soy vegan{g}.', fr: 'Je suis végan(e).' },
      { id: 'pork', es: 'No como cerdo.', fr: 'Je ne mange pas de porc.' },
      { id: 'alcohol', es: 'No bebo alcohol.', fr: 'Je ne bois pas d’alcool.' },
      { id: 'celiac', es: 'Soy celíac{g}: sin gluten, por favor.', fr: 'Je suis cœliaque : sans gluten, s’il vous plaît.' }
    ]
  }

};
