class Utilisateur {
    // Propriétés de classe
    static #listeUtilisateurs = [];
    static utilisateurConnecte;
  
    // Méthodes de classe
    static listerUtilisateurs() {
      return this.#listeUtilisateurs;
    }
    static connexion(identifiant, motdepasse) {
      const utilisateur = this.#listeUtilisateurs.find((utilisateur) => (
        utilisateur.identifiant === identifiant && utilisateur.#motdepasse === motdepasse
      ));
      if (!utilisateur || !utilisateur.actif) return false;
      this.utilisateurConnecte = utilisateur;
      return true;
    }
  
    static deconnecterUtilisateur() {
      this.utilisateurConnecte = null;
    }
  
    // Propriétés d'instance
    identifiant;
    prenom;
    nom;
    #motdepasse;
    actif;
    estAdmin;
    admin;
  
    // Constructeur
    constructor(identifiant, motdepasse, estAdmin, prenom, nom) {
      this.identifiant = identifiant;
      this.#motdepasse = motdepasse;
      this.prenom = prenom;
      this.nom = nom;
      this.actif = true;
      this.estAdmin = estAdmin;
      if (estAdmin) this.admin = AdminHelpers;
      Utilisateur.#listeUtilisateurs.push(this);
    }
  
    // Modification des informations
    setNom(nom) {
      this.nom = nom;
    }
    setActif(actif) {
      this.actif = actif;
    }
    setAdmin(estAdmin) {
      this.estAdmin = estAdmin;
      if (!estAdmin) this.admin = null;
      if (estAdmin) this.admin = AdminHelpers;
    }
    setPrenom(prenom) {
      this.prenom = prenom;
    }
    setMotDePasse(motdepasse) {
      this.#motdepasse = motdepasse;
    }
  }
  
  class AdminHelpers {
    // static #chercherUtilisateur(identifiant) {
    //   return Utilisateur.listerUtilisateurs().find(({ identifiant: i }) => (i === identifiant));
    // }
    static listerUtilisateurs() {
      return Utilisateur.listerUtilisateurs();
    }
    static changerStatutUtilisateur(utilisateur, statut) {
      utilisateur.setActif(statut);
    }
    static changerRoleUtilisateur(utilisateur, estAdmin) {
      utilisateur.setAdmin(estAdmin);
    }
  }
  
  new Utilisateur('123', '123');
  new Utilisateur('aaaa', '321', true);
  
  const sectionLogin = document.querySelector('#login');
  const sectionDeconnexion = document.querySelector('#deconnexion');
  const sectionProfil = document.querySelector('#profil');
  const sectionAdmin = document.querySelector('#admin');
  
  // Formulaire de connexion
  sectionLogin.querySelector('form').addEventListener('submit', (e) => {
    // Permet d'annuler le comportement par défaut sur un évèment
    e.preventDefault();
    // Récupère les informations de connexion
    const identifiant = e.target.identifiant.value;
    const motDePasse = e.target.motdepasse.value;
    // Récupère l'utilisateur
    // const identifiantsValides = Utilisateur.connexion(identifiant, motDePasse);
    // // L'utilisateur n'existe pas
    // if (!identifiantsValides) {
    if (!Utilisateur.connexion(identifiant, motDePasse)) {
      alert('Cet utilisateur n\'existe pas ou est désactivé');
      return;
    }
    // L'utilisateur existe, on masque le login
    sectionLogin.setAttribute('aria-hidden', true);
    sectionDeconnexion.setAttribute('aria-hidden', false);
    // Rempli le profil
    sectionProfil.setAttribute('aria-hidden', false);
    sectionProfil.querySelector('p > span').innerText = Utilisateur.utilisateurConnecte.prenom ?? '';
    sectionProfil.querySelector('#modifierNom input').value = Utilisateur.utilisateurConnecte.nom ?? '';
    sectionProfil.querySelector('#modifierPrenom input').value = Utilisateur.utilisateurConnecte.prenom ?? '';
    // Rempli l'interface admin
    if (Utilisateur.utilisateurConnecte.estAdmin) {
      sectionAdmin.setAttribute('aria-hidden', false);
      Utilisateur.utilisateurConnecte.admin.listerUtilisateurs()
        .forEach((utilisateur) => {
          const article = document.createElement('article');
          const span = document.createElement('span');
          span.innerText = `${utilisateur.identifiant} (${utilisateur.prenom ?? ''} ${utilisateur.nom ?? ''}) - ${utilisateur.estAdmin ? 'admin' : 'utilisateur'}`;
          const bouton = document.createElement('button');
          bouton.setAttribute('type', 'button');
          bouton.innerText = utilisateur.estAdmin ? 'passer utilisateur' : 'passer admin';
          bouton.onclick = () => {
            Utilisateur.utilisateurConnecte.admin.changerRoleUtilisateur(utilisateur, !utilisateur.estAdmin);
          }
          const checkbox = document.createElement('input');
          checkbox.setAttribute('type', 'checkbox');
          checkbox.checked = utilisateur.actif;
          checkbox.onchange = (e) => {
            Utilisateur.utilisateurConnecte.admin.changerStatutUtilisateur(utilisateur, e.target.checked);
            console.log(e.target.checked);
          };
          article.append(span, bouton, checkbox);
          sectionAdmin.append(article);
        });
    }
  });
  
  // Modifier nom
  document.querySelector('#modifierNom').addEventListener('submit', (e) => {
    e.preventDefault();
    Utilisateur.utilisateurConnecte.setNom(e.target.nom.value);
  })
  // Modifier prenom
  document.querySelector('#modifierPrenom').addEventListener('submit', (e) => {
    e.preventDefault();
    Utilisateur.utilisateurConnecte.setPrenom(e.target.prenom.value);
  })
  // Modifier mot de passe
  document.querySelector('#modifierMDP').addEventListener('submit', (e) => {
    e.preventDefault();
    Utilisateur.utilisateurConnecte.setMotDePasse(e.target.motdepasse.value);
  })
  
  // Déconnexion
  sectionDeconnexion.querySelector('button').addEventListener('click', () => {
    // Oublie l'utilisateur connecté
    Utilisateur.deconnecterUtilisateur();
    // Remettre l'interface dans son état d'origine
    sectionLogin.setAttribute('aria-hidden', false);
    sectionDeconnexion.setAttribute('aria-hidden', true);
    sectionProfil.setAttribute('aria-hidden', true);
    sectionAdmin.setAttribute('aria-hidden', true);
    Array.from(sectionAdmin.children).forEach((el) => (el.remove()));
  })