/**
 * Bernard's trip, told in postcards as the traveller's itinerary goes: one chapter per leg, in
 * French. `{at}` takes the destination with its preposition: « à Barcelone », « aux Açores ». Game
 * fiction is one of the elements that moved behaviour in gamification studies (docs/LEARNING.md).
 */
type Chapter = readonly [arrival: string, next: string, later: string, end: string];

export const STORY: Record<string, Chapter> = {
  'first-words': [
    'Me voilà {at} ! J’ai dit bonjour au chauffeur, il m’a répondu dans sa langue.',
    'J’ai appris à dire merci et pardon : ici, on sourit quand on essaie.',
    'J’ai compté jusqu’à dix sans me tromper. Le marchand de journaux m’a applaudi.',
    'Premier tampon dans le passeport ! Je t’attends pour la suite.',
  ],
  table: [
    'J’ai repéré une terrasse au soleil. Plus qu’à commander.',
    'Café commandé sans un mot de français : fier comme un crabe.',
    'Le serveur m’a conseillé le plat du jour. J’ai tout compris, ou presque.',
    'Addition réglée, merci dit dans la bonne langue. Je te garde une table.',
  ],
  city: [
    'Perdu entre deux rues, j’ai demandé mon chemin. On m’a répondu, et j’ai compris !',
    'J’ai acheté mon billet tout seul. Le guichetier n’en revenait pas.',
    'Gauche, droite, tout droit : je ne confonds plus. Enfin, presque plus.',
    'Je connais le quartier par cœur. Viens, je te fais visiter.',
  ],
  stay: [
    'À la réception, j’ai donné mon nom. Ils m’attendaient !',
    'La clim faisait des siennes : je l’ai dit, on l’a réparée dans l’heure.',
    'J’ai essayé un chapeau de paille. Une taille au-dessus, c’était parfait.',
    'Valise posée, souvenirs choisis. Il y en a un pour toi.',
  ],
  unexpected: [
    'Un coup de soleil sur la carapace. Rien de grave, promis.',
    'À la pharmacie, j’ai montré où j’avais mal. On m’a soigné tout de suite.',
    'J’ai noté le numéro des urgences, au cas où. Me voilà prêt à tout.',
    'Prêt pour les imprévus comme pour le reste. Il ne manque plus que toi.',
  ],
};
