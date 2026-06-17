"""
Database curato di esercizi in italiano con GIF/immagini da repository open-source.
Immagini fornite da: yuhonas/free-exercise-db (MIT License) e wger.de
"""

# Base URL per immagini esercizi (free-exercise-db su GitHub)
IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"


def img(slug: str, idx: int = 0) -> str:
    return f"{IMG_BASE}/{slug}/images/{idx}.jpg"


EXERCISES = [
    # ============ PETTO ============
    {
        "id": "panca-piana-bilanciere",
        "name": "Panca Piana con Bilanciere",
        "category": "Forza",
        "muscle_group": "Petto",
        "secondary_muscles": ["Tricipiti", "Spalle"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Sdraiati sulla panca piana con i piedi ben piantati a terra.",
            "Afferra il bilanciere con una presa leggermente più ampia delle spalle.",
            "Stacca il bilanciere e portalo sopra il petto con le braccia distese.",
            "Abbassa lentamente il bilanciere fino a sfiorare il petto.",
            "Spingi il bilanciere verso l'alto fino all'estensione completa delle braccia."
        ],
        "tips": "Mantieni le scapole retratte e i gomiti a circa 45 gradi dal busto.",
        "images": [img("Barbell_Bench_Press_-_Medium_Grip", 0), img("Barbell_Bench_Press_-_Medium_Grip", 1)],
    },
    {
        "id": "panca-inclinata-manubri",
        "name": "Panca Inclinata con Manubri",
        "category": "Forza",
        "muscle_group": "Petto",
        "secondary_muscles": ["Spalle", "Tricipiti"],
        "equipment": "Manubri",
        "level": "Intermedio",
        "instructions": [
            "Imposta la panca a 30-45 gradi di inclinazione.",
            "Siediti con un manubrio in ciascuna mano appoggiati sulle cosce.",
            "Sdraiati portando i manubri all'altezza del petto, gomiti aperti.",
            "Spingi i manubri verso l'alto fino a incontrarli sopra il petto.",
            "Abbassa lentamente in modo controllato."
        ],
        "tips": "Concentrati sulla contrazione del petto, non bloccare i gomiti in alto.",
        "images": [img("Dumbbell_Bench_Press", 0), img("Dumbbell_Bench_Press", 1)],
    },
    {
        "id": "croci-cavi-alti",
        "name": "Croci ai Cavi Alti",
        "category": "Isolamento",
        "muscle_group": "Petto",
        "secondary_muscles": ["Spalle"],
        "equipment": "Cavi",
        "level": "Principiante",
        "instructions": [
            "Posizionati al centro tra due cavi alti con un'impugnatura in ciascuna mano.",
            "Fai un passo avanti e inclinati leggermente.",
            "Con i gomiti leggermente piegati, porta le braccia in avanti unendo le mani.",
            "Contrai il petto al centro per un secondo.",
            "Torna lentamente alla posizione iniziale."
        ],
        "tips": "Movimento ad arco, non spingere come una panca.",
        "images": [img("Cable_Crossover", 0), img("Cable_Crossover", 1)],
    },
    {
        "id": "piegamenti-braccia",
        "name": "Piegamenti sulle Braccia",
        "category": "Corpo Libero",
        "muscle_group": "Petto",
        "secondary_muscles": ["Tricipiti", "Core"],
        "equipment": "Corpo libero",
        "level": "Principiante",
        "instructions": [
            "Posizionati in plank con le mani poco più larghe delle spalle.",
            "Mantieni il corpo dritto dalla testa ai talloni.",
            "Abbassa il corpo piegando i gomiti fino a sfiorare il pavimento col petto.",
            "Spingi verso l'alto tornando alla posizione di partenza.",
        ],
        "tips": "Contrai i glutei e l'addome per mantenere il corpo allineato.",
        "images": [img("Pushups", 0), img("Pushups", 1)],
    },
    {
        "id": "dip-parallele",
        "name": "Dip alle Parallele",
        "category": "Corpo Libero",
        "muscle_group": "Petto",
        "secondary_muscles": ["Tricipiti", "Spalle"],
        "equipment": "Parallele",
        "level": "Intermedio",
        "instructions": [
            "Sali alle parallele tenendoti con braccia distese.",
            "Inclina leggermente il busto in avanti per coinvolgere il petto.",
            "Abbassati piegando i gomiti fino a 90 gradi.",
            "Spingi indietro fino all'estensione completa."
        ],
        "tips": "Per più tricipiti tieni il busto verticale; per più petto inclinati avanti.",
        "images": [img("Dips_-_Chest_Version", 0), img("Dips_-_Chest_Version", 1)],
    },
    {
        "id": "panca-declinata-bilanciere",
        "name": "Panca Declinata con Bilanciere",
        "category": "Forza",
        "muscle_group": "Petto",
        "secondary_muscles": ["Tricipiti"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Sdraiati sulla panca declinata fissando i piedi negli appositi supporti.",
            "Impugna il bilanciere con presa leggermente più larga delle spalle.",
            "Abbassa il bilanciere verso la parte bassa del petto.",
            "Spingi verso l'alto fino all'estensione completa."
        ],
        "tips": "Movimento controllato, non rimbalzare sul petto.",
        "images": [img("Decline_Barbell_Bench_Press", 0), img("Decline_Barbell_Bench_Press", 1)],
    },
    {
        "id": "pectoral-machine",
        "name": "Pectoral Machine",
        "category": "Isolamento",
        "muscle_group": "Petto",
        "secondary_muscles": [],
        "equipment": "Macchinario",
        "level": "Principiante",
        "instructions": [
            "Siediti regolando l'altezza della seduta in base alle spalle.",
            "Appoggia gli avambracci sui pad con i gomiti a 90 gradi.",
            "Spingi i pad in avanti contraendo il petto al centro.",
            "Ritorna lentamente alla posizione di partenza."
        ],
        "tips": "Mantieni la schiena ben aderente allo schienale.",
        "images": [img("Butterfly", 0), img("Butterfly", 1)],
    },

    # ============ DORSO ============
    {
        "id": "stacco-da-terra",
        "name": "Stacco da Terra",
        "category": "Forza",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Glutei", "Femorali", "Trapezi"],
        "equipment": "Bilanciere",
        "level": "Avanzato",
        "instructions": [
            "Posizionati col bilanciere sopra la metà del piede, piedi alla larghezza delle anche.",
            "Piegati afferrando il bilanciere con presa leggermente più larga delle gambe.",
            "Petto in fuori, schiena dritta, spalle sopra il bilanciere.",
            "Solleva spingendo coi piedi e mantenendo il bilanciere vicino al corpo.",
            "Estendi anche e ginocchia simultaneamente fino in posizione eretta."
        ],
        "tips": "La schiena deve restare neutra durante tutto il movimento.",
        "images": [img("Barbell_Deadlift", 0), img("Barbell_Deadlift", 1)],
    },
    {
        "id": "trazioni-sbarra",
        "name": "Trazioni alla Sbarra",
        "category": "Corpo Libero",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Bicipiti", "Avambracci"],
        "equipment": "Sbarra",
        "level": "Intermedio",
        "instructions": [
            "Afferra la sbarra con presa prona poco più larga delle spalle.",
            "Parti con le braccia distese.",
            "Tira il corpo verso l'alto fino a portare il mento sopra la sbarra.",
            "Scendi controllato fino all'estensione completa."
        ],
        "tips": "Contrai i dorsali, evita di usare lo slancio.",
        "images": [img("Pullups", 0), img("Pullups", 1)],
    },
    {
        "id": "lat-machine",
        "name": "Lat Machine Avanti",
        "category": "Forza",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Bicipiti"],
        "equipment": "Cavi",
        "level": "Principiante",
        "instructions": [
            "Siediti alla lat machine bloccando le gambe sotto i pad.",
            "Afferra la barra con presa larga, palmi in avanti.",
            "Tira la barra verso il petto piegando i gomiti verso il basso.",
            "Risali lentamente controllando il peso."
        ],
        "tips": "Petto in fuori, non spingere indietro col busto.",
        "images": [img("Wide-Grip_Lat_Pulldown", 0), img("Wide-Grip_Lat_Pulldown", 1)],
    },
    {
        "id": "rematore-bilanciere",
        "name": "Rematore con Bilanciere",
        "category": "Forza",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Bicipiti", "Trapezi"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Impugna il bilanciere con presa prona alla larghezza delle spalle.",
            "Piegati in avanti tenendo la schiena dritta a circa 45 gradi.",
            "Tira il bilanciere verso l'addome basso.",
            "Abbassa lentamente fino all'estensione."
        ],
        "tips": "Stringi le scapole alla fine del movimento.",
        "images": [img("Bent_Over_Barbell_Row", 0), img("Bent_Over_Barbell_Row", 1)],
    },
    {
        "id": "rematore-manubrio",
        "name": "Rematore con Manubrio",
        "category": "Forza",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Bicipiti"],
        "equipment": "Manubrio",
        "level": "Principiante",
        "instructions": [
            "Appoggia un ginocchio e una mano sulla panca.",
            "Afferra il manubrio con l'altra mano, braccio disteso.",
            "Tira il manubrio verso il fianco, gomito vicino al corpo.",
            "Abbassa controllato."
        ],
        "tips": "Schiena parallela al pavimento, non ruotare il busto.",
        "images": [img("Bent_Over_Dumbbell_Row", 0), img("Bent_Over_Dumbbell_Row", 1)],
    },
    {
        "id": "pulley-basso",
        "name": "Pulley Basso",
        "category": "Forza",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Bicipiti"],
        "equipment": "Cavi",
        "level": "Principiante",
        "instructions": [
            "Siediti al pulley con piedi appoggiati alla pedana e ginocchia leggermente piegate.",
            "Afferra l'impugnatura, schiena dritta.",
            "Tira l'impugnatura verso l'addome, gomiti aderenti al corpo.",
            "Estendi le braccia in modo controllato."
        ],
        "tips": "Mantieni il busto stabile, evita oscillazioni.",
        "images": [img("Seated_Cable_Rows", 0), img("Seated_Cable_Rows", 1)],
    },
    {
        "id": "pull-over-manubrio",
        "name": "Pull-Over con Manubrio",
        "category": "Isolamento",
        "muscle_group": "Dorso",
        "secondary_muscles": ["Petto"],
        "equipment": "Manubrio",
        "level": "Intermedio",
        "instructions": [
            "Sdraiati trasversalmente su una panca piana con le spalle appoggiate.",
            "Tieni un manubrio sopra il petto con entrambe le mani.",
            "Abbassa il manubrio dietro la testa mantenendo i gomiti leggermente piegati.",
            "Riporta il manubrio sopra il petto contraendo il dorso."
        ],
        "tips": "Non scendere troppo, ferma il movimento quando senti tirare le spalle.",
        "images": [img("Dumbbell_Pullover", 0), img("Dumbbell_Pullover", 1)],
    },

    # ============ GAMBE ============
    {
        "id": "squat-bilanciere",
        "name": "Squat con Bilanciere",
        "category": "Forza",
        "muscle_group": "Gambe",
        "secondary_muscles": ["Glutei", "Core"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Posiziona il bilanciere sui trapezi alti, non sul collo.",
            "Piedi alla larghezza delle spalle, punte leggermente verso l'esterno.",
            "Scendi piegando ginocchia e anche, schiena dritta, fino a cosce parallele al suolo.",
            "Risali spingendo coi talloni."
        ],
        "tips": "Le ginocchia devono seguire la direzione delle punte dei piedi.",
        "images": [img("Barbell_Squat", 0), img("Barbell_Squat", 1)],
    },
    {
        "id": "pressa-gambe",
        "name": "Pressa per Gambe",
        "category": "Forza",
        "muscle_group": "Gambe",
        "secondary_muscles": ["Glutei"],
        "equipment": "Macchinario",
        "level": "Principiante",
        "instructions": [
            "Siediti alla pressa appoggiando bene la schiena.",
            "Piedi alla larghezza delle spalle sulla pedana.",
            "Sblocca i fermi e abbassa il carico flettendo le ginocchia a 90 gradi.",
            "Spingi tornando alla posizione iniziale senza bloccare le ginocchia."
        ],
        "tips": "Non staccare il sedere dallo schienale durante la discesa.",
        "images": [img("Leg_Press", 0), img("Leg_Press", 1)],
    },
    {
        "id": "affondi-manubri",
        "name": "Affondi con Manubri",
        "category": "Forza",
        "muscle_group": "Gambe",
        "secondary_muscles": ["Glutei", "Core"],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "In piedi con un manubrio in ciascuna mano lungo i fianchi.",
            "Fai un ampio passo in avanti.",
            "Abbassati piegando entrambe le ginocchia fino a 90 gradi.",
            "Spingi col tallone anteriore per tornare in piedi.",
            "Alterna la gamba ad ogni ripetizione."
        ],
        "tips": "Il ginocchio anteriore non deve superare la punta del piede.",
        "images": [img("Dumbbell_Lunges", 0), img("Dumbbell_Lunges", 1)],
    },
    {
        "id": "leg-extension",
        "name": "Leg Extension",
        "category": "Isolamento",
        "muscle_group": "Gambe",
        "secondary_muscles": [],
        "equipment": "Macchinario",
        "level": "Principiante",
        "instructions": [
            "Siediti alla macchina regolando lo schienale.",
            "Aggancia i piedi sotto il rullo, all'altezza delle caviglie.",
            "Estendi le gambe portando il rullo verso l'alto fino a contrarre i quadricipiti.",
            "Abbassa lentamente."
        ],
        "tips": "Non bloccare le ginocchia in estensione completa.",
        "images": [img("Leg_Extensions", 0), img("Leg_Extensions", 1)],
    },
    {
        "id": "leg-curl",
        "name": "Leg Curl Sdraiato",
        "category": "Isolamento",
        "muscle_group": "Gambe",
        "secondary_muscles": ["Glutei"],
        "equipment": "Macchinario",
        "level": "Principiante",
        "instructions": [
            "Sdraiati a pancia in giù sulla macchina.",
            "Aggancia le caviglie sotto il rullo.",
            "Fletti le ginocchia portando il rullo verso i glutei.",
            "Distendi lentamente tornando alla posizione iniziale."
        ],
        "tips": "Mantieni i fianchi premuti sulla panca.",
        "images": [img("Lying_Leg_Curls", 0), img("Lying_Leg_Curls", 1)],
    },
    {
        "id": "stacco-rumeno",
        "name": "Stacco Rumeno",
        "category": "Forza",
        "muscle_group": "Gambe",
        "secondary_muscles": ["Glutei", "Dorso"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "In piedi con bilanciere davanti alle cosce, presa prona.",
            "Ginocchia leggermente piegate, schiena dritta.",
            "Spingi i glutei indietro abbassando il bilanciere lungo le gambe.",
            "Scendi finché senti l'allungamento dei femorali.",
            "Risali contraendo glutei e femorali."
        ],
        "tips": "Mantieni il bilanciere a contatto con le gambe durante tutto il movimento.",
        "images": [img("Romanian_Deadlift", 0), img("Romanian_Deadlift", 1)],
    },
    {
        "id": "calf-in-piedi",
        "name": "Calf in Piedi",
        "category": "Isolamento",
        "muscle_group": "Polpacci",
        "secondary_muscles": [],
        "equipment": "Macchinario",
        "level": "Principiante",
        "instructions": [
            "Posiziona le spalle sotto i pad della macchina.",
            "Punte dei piedi sulla pedana, talloni nel vuoto.",
            "Solleva i talloni il più in alto possibile contraendo i polpacci.",
            "Abbassa lentamente massimizzando lo stretching."
        ],
        "tips": "Esegui movimento completo, non rimbalzare.",
        "images": [img("Standing_Calf_Raises", 0), img("Standing_Calf_Raises", 1)],
    },
    {
        "id": "hip-thrust",
        "name": "Hip Thrust",
        "category": "Forza",
        "muscle_group": "Glutei",
        "secondary_muscles": ["Femorali"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Siediti a terra con la schiena alta appoggiata a una panca.",
            "Posiziona il bilanciere sulle anche (usa un cuscinetto).",
            "Piedi appoggiati a terra, ginocchia piegate.",
            "Spingi le anche verso l'alto contraendo i glutei.",
            "Abbassa controllato."
        ],
        "tips": "In alto il corpo deve formare una linea retta dalle ginocchia alle spalle.",
        "images": [img("Barbell_Hip_Thrust", 0), img("Barbell_Hip_Thrust", 1)],
    },

    # ============ SPALLE ============
    {
        "id": "military-press",
        "name": "Military Press in Piedi",
        "category": "Forza",
        "muscle_group": "Spalle",
        "secondary_muscles": ["Tricipiti", "Core"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "In piedi col bilanciere appoggiato sulle clavicole, presa alla larghezza delle spalle.",
            "Contrai il core e i glutei.",
            "Spingi il bilanciere verso l'alto fino all'estensione completa delle braccia.",
            "Abbassa lentamente alle clavicole."
        ],
        "tips": "Sposta leggermente la testa indietro per far passare il bilanciere.",
        "images": [img("Barbell_Shoulder_Press", 0), img("Barbell_Shoulder_Press", 1)],
    },
    {
        "id": "shoulder-press-manubri",
        "name": "Shoulder Press con Manubri",
        "category": "Forza",
        "muscle_group": "Spalle",
        "secondary_muscles": ["Tricipiti"],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "Siediti su una panca con schienale verticale, un manubrio per mano.",
            "Porta i manubri all'altezza delle spalle, gomiti piegati a 90 gradi.",
            "Spingi i manubri verso l'alto fino a sfiorarli in cima.",
            "Abbassa controllato."
        ],
        "tips": "Non inarcare la schiena.",
        "images": [img("Dumbbell_Shoulder_Press", 0), img("Dumbbell_Shoulder_Press", 1)],
    },
    {
        "id": "alzate-laterali",
        "name": "Alzate Laterali",
        "category": "Isolamento",
        "muscle_group": "Spalle",
        "secondary_muscles": [],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "In piedi con un manubrio in ciascuna mano lungo i fianchi.",
            "Solleva lateralmente le braccia con gomiti leggermente piegati.",
            "Ferma all'altezza delle spalle.",
            "Abbassa lentamente."
        ],
        "tips": "Non usare slancio, immagina di versare acqua dai manubri.",
        "images": [img("Side_Lateral_Raise", 0), img("Side_Lateral_Raise", 1)],
    },
    {
        "id": "alzate-frontali",
        "name": "Alzate Frontali",
        "category": "Isolamento",
        "muscle_group": "Spalle",
        "secondary_muscles": [],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "In piedi con un manubrio in ciascuna mano davanti alle cosce.",
            "Solleva un braccio in avanti fino all'altezza della spalla.",
            "Abbassa lentamente.",
            "Alterna le braccia."
        ],
        "tips": "Mantieni il braccio leggermente piegato durante il movimento.",
        "images": [img("Front_Dumbbell_Raise", 0), img("Front_Dumbbell_Raise", 1)],
    },
    {
        "id": "alzate-90-gradi",
        "name": "Alzate a 90 Gradi (Posteriore)",
        "category": "Isolamento",
        "muscle_group": "Spalle",
        "secondary_muscles": ["Dorso"],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "Piegati in avanti con busto quasi parallelo al pavimento.",
            "Manubri sotto al petto, palmi rivolti l'uno verso l'altro.",
            "Apri le braccia lateralmente all'altezza delle spalle.",
            "Abbassa lentamente."
        ],
        "tips": "Stringi le scapole nella parte alta del movimento.",
        "images": [img("Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench", 0), img("Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench", 1)],
    },
    {
        "id": "scrollate-spalle",
        "name": "Scrollate alle Spalle",
        "category": "Isolamento",
        "muscle_group": "Spalle",
        "secondary_muscles": ["Trapezi"],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "In piedi con un manubrio in ciascuna mano lungo i fianchi.",
            "Solleva le spalle verso le orecchie contraendo i trapezi.",
            "Tieni un secondo in contrazione.",
            "Abbassa lentamente."
        ],
        "tips": "Non ruotare le spalle, movimento solo verticale.",
        "images": [img("Dumbbell_Shrug", 0), img("Dumbbell_Shrug", 1)],
    },

    # ============ BICIPITI ============
    {
        "id": "curl-bilanciere",
        "name": "Curl con Bilanciere",
        "category": "Isolamento",
        "muscle_group": "Bicipiti",
        "secondary_muscles": ["Avambracci"],
        "equipment": "Bilanciere",
        "level": "Principiante",
        "instructions": [
            "In piedi con bilanciere a presa supina alla larghezza delle spalle.",
            "Gomiti aderenti al busto.",
            "Fletti gli avambracci portando il bilanciere verso le spalle.",
            "Abbassa lentamente."
        ],
        "tips": "Evita lo slancio del busto.",
        "images": [img("Barbell_Curl", 0), img("Barbell_Curl", 1)],
    },
    {
        "id": "curl-manubri-alternato",
        "name": "Curl Alternato con Manubri",
        "category": "Isolamento",
        "muscle_group": "Bicipiti",
        "secondary_muscles": [],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "In piedi con un manubrio in ciascuna mano, palmi verso il corpo.",
            "Solleva un manubrio ruotando il polso supinando.",
            "Contrai il bicipite in cima.",
            "Abbassa e alterna."
        ],
        "tips": "La rotazione del polso aumenta la contrazione.",
        "images": [img("Alternate_Incline_Dumbbell_Curl", 0), img("Alternate_Incline_Dumbbell_Curl", 1)],
    },
    {
        "id": "hammer-curl",
        "name": "Hammer Curl",
        "category": "Isolamento",
        "muscle_group": "Bicipiti",
        "secondary_muscles": ["Avambracci"],
        "equipment": "Manubri",
        "level": "Principiante",
        "instructions": [
            "In piedi con manubri ai fianchi, presa neutra (palmi verso il corpo).",
            "Solleva i manubri mantenendo la presa neutra.",
            "Contrai in alto.",
            "Abbassa lentamente."
        ],
        "tips": "Lavora bene anche il muscolo brachiale.",
        "images": [img("Hammer_Curls", 0), img("Hammer_Curls", 1)],
    },
    {
        "id": "curl-panca-scott",
        "name": "Curl alla Panca Scott",
        "category": "Isolamento",
        "muscle_group": "Bicipiti",
        "secondary_muscles": [],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Siediti alla panca Scott con le ascelle appoggiate al cuscinetto.",
            "Afferra il bilanciere (preferibilmente EZ) con presa supina.",
            "Fletti gli avambracci contraendo i bicipiti.",
            "Abbassa lentamente senza estendere completamente i gomiti."
        ],
        "tips": "Movimento isolato, niente slancio.",
        "images": [img("Preacher_Curl", 0), img("Preacher_Curl", 1)],
    },
    {
        "id": "curl-cavo",
        "name": "Curl ai Cavi",
        "category": "Isolamento",
        "muscle_group": "Bicipiti",
        "secondary_muscles": [],
        "equipment": "Cavi",
        "level": "Principiante",
        "instructions": [
            "Posizionati di fronte al cavo basso con un'impugnatura dritta.",
            "Gomiti aderenti al busto.",
            "Fletti le braccia portando l'impugnatura al petto.",
            "Estendi controllato."
        ],
        "tips": "I cavi mantengono tensione costante.",
        "images": [img("Cable_Curl", 0), img("Cable_Curl", 1)],
    },

    # ============ TRICIPITI ============
    {
        "id": "panca-presa-stretta",
        "name": "Panca Presa Stretta",
        "category": "Forza",
        "muscle_group": "Tricipiti",
        "secondary_muscles": ["Petto"],
        "equipment": "Bilanciere",
        "level": "Intermedio",
        "instructions": [
            "Sdraiati sulla panca piana con bilanciere a presa stretta (mani circa larghezza spalle).",
            "Abbassa il bilanciere verso lo sterno con gomiti aderenti al corpo.",
            "Spingi verso l'alto contraendo i tricipiti."
        ],
        "tips": "Gomiti vicini al corpo, non aperti.",
        "images": [img("Close-Grip_Barbell_Bench_Press", 0), img("Close-Grip_Barbell_Bench_Press", 1)],
    },
    {
        "id": "french-press",
        "name": "French Press con Bilanciere EZ",
        "category": "Isolamento",
        "muscle_group": "Tricipiti",
        "secondary_muscles": [],
        "equipment": "Bilanciere EZ",
        "level": "Intermedio",
        "instructions": [
            "Sdraiati sulla panca piana con il bilanciere EZ sopra il petto.",
            "Mantenendo i gomiti fermi, abbassa il bilanciere verso la fronte.",
            "Estendi le braccia tornando alla posizione iniziale."
        ],
        "tips": "I gomiti restano fissi, si muove solo l'avambraccio.",
        "images": [img("EZ-Bar_Skullcrusher", 0), img("EZ-Bar_Skullcrusher", 1)],
    },
    {
        "id": "pushdown-cavi",
        "name": "Pushdown ai Cavi",
        "category": "Isolamento",
        "muscle_group": "Tricipiti",
        "secondary_muscles": [],
        "equipment": "Cavi",
        "level": "Principiante",
        "instructions": [
            "Posizionati di fronte al cavo alto con corda o sbarra.",
            "Gomiti aderenti al busto, avambracci paralleli al pavimento.",
            "Estendi le braccia verso il basso contraendo i tricipiti.",
            "Ritorna lentamente."
        ],
        "tips": "Non muovere i gomiti, solo gli avambracci.",
        "images": [img("Triceps_Pushdown", 0), img("Triceps_Pushdown", 1)],
    },
    {
        "id": "dip-panca",
        "name": "Dip alla Panca",
        "category": "Corpo Libero",
        "muscle_group": "Tricipiti",
        "secondary_muscles": ["Petto", "Spalle"],
        "equipment": "Panca",
        "level": "Principiante",
        "instructions": [
            "Siediti su una panca con le mani ai lati, dita rivolte in avanti.",
            "Sposta i glutei in avanti, gambe distese o piegate.",
            "Abbassati piegando i gomiti fino a 90 gradi.",
            "Spingi verso l'alto."
        ],
        "tips": "Gomiti diritti indietro, non aperti.",
        "images": [img("Bench_Dips", 0), img("Bench_Dips", 1)],
    },
    {
        "id": "kickback-tricipiti",
        "name": "Kickback Tricipiti",
        "category": "Isolamento",
        "muscle_group": "Tricipiti",
        "secondary_muscles": [],
        "equipment": "Manubrio",
        "level": "Principiante",
        "instructions": [
            "Appoggia un ginocchio e una mano sulla panca.",
            "Tieni il manubrio nell'altra mano col gomito piegato a 90 gradi.",
            "Estendi il braccio indietro fino al pieno allungamento.",
            "Ritorna piegando l'avambraccio."
        ],
        "tips": "Il gomito resta sempre alto e fisso.",
        "images": [img("Tricep_Dumbbell_Kickback", 0), img("Tricep_Dumbbell_Kickback", 1)],
    },

    # ============ ADDOME ============
    {
        "id": "crunch",
        "name": "Crunch a Terra",
        "category": "Isolamento",
        "muscle_group": "Addome",
        "secondary_muscles": [],
        "equipment": "Corpo libero",
        "level": "Principiante",
        "instructions": [
            "Sdraiati a terra con le ginocchia piegate.",
            "Mani dietro la testa o sul petto.",
            "Solleva le spalle dal pavimento contraendo l'addome.",
            "Scendi lentamente."
        ],
        "tips": "Non tirare con il collo, il movimento parte dall'addome.",
        "images": [img("Crunches", 0), img("Crunches", 1)],
    },
    {
        "id": "plank",
        "name": "Plank",
        "category": "Isometrico",
        "muscle_group": "Addome",
        "secondary_muscles": ["Core", "Spalle"],
        "equipment": "Corpo libero",
        "level": "Principiante",
        "instructions": [
            "Posizionati sui gomiti e sulle punte dei piedi.",
            "Avambracci paralleli, gomiti sotto le spalle.",
            "Mantieni il corpo dritto come una tavola.",
            "Tieni la posizione per il tempo previsto."
        ],
        "tips": "Non far cadere le anche, contrai glutei e addome.",
        "images": [img("Plank", 0), img("Plank", 1)],
    },
    {
        "id": "russian-twist",
        "name": "Russian Twist",
        "category": "Isolamento",
        "muscle_group": "Addome",
        "secondary_muscles": ["Obliqui"],
        "equipment": "Corpo libero",
        "level": "Principiante",
        "instructions": [
            "Siediti a terra con ginocchia piegate e piedi sollevati.",
            "Inclina il busto indietro a 45 gradi.",
            "Ruota il busto da un lato all'altro toccando il pavimento.",
            "Mantieni l'addome contratto."
        ],
        "tips": "Puoi tenere un peso per aumentare la difficoltà.",
        "images": [img("Russian_Twist", 0), img("Russian_Twist", 1)],
    },
    {
        "id": "leg-raise",
        "name": "Leg Raise",
        "category": "Isolamento",
        "muscle_group": "Addome",
        "secondary_muscles": [],
        "equipment": "Corpo libero",
        "level": "Intermedio",
        "instructions": [
            "Sdraiati a terra con gambe distese.",
            "Solleva le gambe fino a 90 gradi mantenendo le ginocchia leggermente piegate.",
            "Abbassa controllato senza toccare il pavimento."
        ],
        "tips": "Schiena ben aderente al suolo per proteggere la zona lombare.",
        "images": [img("Leg_Pull-In", 0), img("Leg_Pull-In", 1)],
    },
    {
        "id": "mountain-climber",
        "name": "Mountain Climber",
        "category": "Cardio",
        "muscle_group": "Addome",
        "secondary_muscles": ["Cardio", "Gambe"],
        "equipment": "Corpo libero",
        "level": "Principiante",
        "instructions": [
            "Posizionati in plank alto con braccia distese.",
            "Porta alternativamente le ginocchia al petto a ritmo sostenuto.",
            "Mantieni il core contratto."
        ],
        "tips": "Mantieni le anche basse e stabili.",
        "images": [img("Mountain_Climbers", 0), img("Mountain_Climbers", 1)],
    },

    # ============ CARDIO ============
    {
        "id": "burpees",
        "name": "Burpees",
        "category": "Cardio",
        "muscle_group": "Cardio",
        "secondary_muscles": ["Gambe", "Petto", "Core"],
        "equipment": "Corpo libero",
        "level": "Intermedio",
        "instructions": [
            "In piedi, scendi in squat e appoggia le mani a terra.",
            "Lancia i piedi indietro in posizione di plank.",
            "Esegui un piegamento.",
            "Riporta i piedi alle mani.",
            "Salta verso l'alto con le braccia tese."
        ],
        "tips": "Mantieni un ritmo costante.",
        "images": [img("Burpee", 0), img("Burpee", 1)],
    },
    {
        "id": "jumping-jack",
        "name": "Jumping Jack",
        "category": "Cardio",
        "muscle_group": "Cardio",
        "secondary_muscles": ["Gambe", "Spalle"],
        "equipment": "Corpo libero",
        "level": "Principiante",
        "instructions": [
            "In piedi con braccia lungo i fianchi e piedi uniti.",
            "Salta aprendo gambe e portando le braccia sopra la testa.",
            "Salta tornando alla posizione iniziale.",
            "Ripeti a ritmo sostenuto."
        ],
        "tips": "Atterra morbidamente sulle punte.",
        "images": [img("Jumping_Jacks", 0), img("Jumping_Jacks", 1)],
    },
    {
        "id": "corsa-tapis",
        "name": "Corsa sul Tapis Roulant",
        "category": "Cardio",
        "muscle_group": "Cardio",
        "secondary_muscles": ["Gambe"],
        "equipment": "Tapis Roulant",
        "level": "Principiante",
        "instructions": [
            "Salta sul tapis e regola la velocità desiderata.",
            "Mantieni una postura eretta con sguardo in avanti.",
            "Atterra con la parte centrale del piede.",
            "Respira in modo regolare."
        ],
        "tips": "Inizia con un riscaldamento e termina con un defaticamento.",
        "images": [img("Walking_Treadmill", 0), img("Walking_Treadmill", 1)],
    },
    {
        "id": "cyclette",
        "name": "Cyclette",
        "category": "Cardio",
        "muscle_group": "Cardio",
        "secondary_muscles": ["Gambe"],
        "equipment": "Cyclette",
        "level": "Principiante",
        "instructions": [
            "Regola l'altezza della sella in base alla tua altezza.",
            "Imposta la resistenza desiderata.",
            "Pedala mantenendo una postura corretta.",
            "Varia velocità e resistenza per migliorare l'allenamento."
        ],
        "tips": "Ottimo per il riscaldamento o per HIIT.",
        "images": [img("Stationary_Bike", 0), img("Stationary_Bike", 1)],
    },
]


MUSCLE_GROUPS = [
    {"id": "all", "name": "Tutti"},
    {"id": "Petto", "name": "Petto"},
    {"id": "Dorso", "name": "Dorso"},
    {"id": "Gambe", "name": "Gambe"},
    {"id": "Glutei", "name": "Glutei"},
    {"id": "Spalle", "name": "Spalle"},
    {"id": "Bicipiti", "name": "Bicipiti"},
    {"id": "Tricipiti", "name": "Tricipiti"},
    {"id": "Addome", "name": "Addome"},
    {"id": "Polpacci", "name": "Polpacci"},
    {"id": "Cardio", "name": "Cardio"},
]
