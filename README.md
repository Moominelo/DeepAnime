# DeepAnime 🎌

DeepAnime est un moteur de recommandation d'anime de nouvelle génération. Contrairement aux chatbots classiques qui inventent souvent des titres ou des synopsis (hallucinations), DeepAnime utilise le **Google Search Grounding** couplé à **Gemini 2.5** pour vérifier chaque information en temps réel avant de vous la présenter.

## 📱 Aperçu de l'Interface

L'application présente les résultats sous forme de "Cartes Vérifiées". Voici à quoi ressemble une recommandation type dans l'interface :

```text
+-----------------------------------------------------------------------+
|                                                                       |
|   [  IMAGE D'AFFICHE  ]    MONSTER                                    |
|   (Chargée via URL     |   Madhouse  •  2004  •  TV (74 eps)          |
|    vérifiée)           |   Tags: Psychologique, Thriller, Seinen      |
|                        |                                              |
|                        |   ℹ️ SYNOPSIS VÉRIFIÉ                        |
|                        |   Kenzou Tenma, un neurochirurgien d'élite   |
|                        |   japonais exerçant en Allemagne, voit sa    |
|                        |   vie basculer lorsqu'il choisit de sauver   |
|                        |   un jeune garçon plutôt que le maire...     |
|                        |                                              |
|                        |   💡 POURQUOI JE TE LE RECOMMANDE            |
|                        |   "Basé sur ta demande d'une intrigue        |
|                        |   sombre et réaliste, ce titre est la        |
|                        |   référence absolue du genre."               |
|                        |                                              |
|                        |   [ Bouton: Fiche Officielle MAL/AniList ]   |
|                                                                       |
+-----------------------------------------------------------------------+
```

## 🛠️ Comment c'est fait (Architecture Technique)

Cette application n'est pas un simple wrapper autour d'une API de chat. Elle implémente une logique stricte pour garantir la fiabilité des données.

### 1. Stack Technologique
*   **Frontend** : React 19 (TypeScript) pour une interface réactive.
*   **Styling** : Tailwind CSS pour un design moderne, sombre ("Dark Mode") et responsive.
*   **AI Core** : SDK Google GenAI (`@google/genai`) utilisant le modèle **Gemini 2.5 Flash**.

### 2. Le défi technique : "Anti-Hallucination"
Les LLM (Large Language Models) ont tendance à inventer des détails. Pour contrer cela, DeepAnime utilise une architecture spécifique :

*   **Google Search Grounding (Tool Use)** :
    Le modèle a accès à l'outil `googleSearch`. Avant de générer la réponse, il vérifie les années de sortie, les studios et les synopsis exacts via le moteur de recherche Google.

*   **Extraction JSON Manuelle (Parsing Robuste)** :
    L'API Gemini ne permet pas actuellement de combiner "Tools" (Recherche) et "JSON Mode" (`responseMimeType`).
    *   *Solution implémentée* : Nous demandons au modèle de générer du texte, mais structuré strictement. Ensuite, le code TypeScript utilise un algorithme d'extraction (`substring` entre les crochets `[` et `]`) pour isoler les données JSON du texte conversationnel ou des balises Markdown, garantissant que l'application ne plante pas même si le modèle est "bavard".

*   **System Instructions (Prompt Engineering)** :
    Le prompt système est calibré pour agir comme un expert base de données. Il a l'interdiction stricte d'inventer et doit laisser les champs vides s'il n'a pas de source fiable, plutôt que de deviner.

### 3. Flux de Données
1.  L'utilisateur entre une requête (ex: "Anime cyberpunk années 90").
2.  L'application envoie le prompt à Gemini avec l'outil `googleSearch` activé.
3.  Gemini effectue des recherches en arrière-plan pour valider les titres (ex: "Ghost in the Shell", "Akira").
4.  Gemini formate les résultats validés en un tableau JSON brut.
5.  Le service Frontend nettoie la réponse, parse le JSON et hydrate les composants UI.

## 🚀 Installation et Lancement

1.  Assurez-vous d'avoir une clé API valide dans votre environnement (variable `API_KEY`).
2.  L'application est construite pour fonctionner directement dans un environnement web moderne supportant les modules ES.
3.  Ouvrez simplement l'application via votre serveur de développement local habituel (ex: Vite, Parcel ou Webpack).

---
*DeepAnime - La fiabilité avant tout.*
