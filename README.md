
# DeepAnime 🎌

DeepAnime est un moteur de recommandation d'anime de nouvelle génération. Contrairement aux chatbots classiques qui inventent souvent des titres ou des synopsis (hallucinations), DeepAnime utilise le **Google Search Grounding** couplé à **Gemini 2.5** pour vérifier les données, et l'API **Jikan (MyAnimeList)** pour récupérer les visuels officiels.

## 📱 Aperçu de l'Interface

L'application présente les résultats sous forme de "Cartes Vérifiées". Voici à quoi ressemble une recommandation type dans l'interface :

```text
+-----------------------------------------------------------------------+
|                                                                       |
|   [  AFFICHE OFFICIELLE  ]   MONSTER                                  |
|   (Source: API Jikan     |   Madhouse  •  2004  •  TV (74 eps)          |
|    MyAnimeList)          |   Tags: Psychologique, Thriller, Seinen      |
|                          |                                              |
|   ★ 8.9/10               |   ℹ️ SYNOPSIS VÉRIFIÉ                        |
|                          |   Kenzou Tenma, un neurochirurgien d'élite   |
|                          |   japonais exerçant en Allemagne, voit sa    |
|                          |   vie basculer lorsqu'il choisit de sauver   |
|                          |   un jeune garçon plutôt que le maire...     |
|                          |                                              |
|                          |   💡 POURQUOI JE TE LE RECOMMANDE            |
|                          |   "Basé sur ta demande d'une intrigue        |
|                          |   sombre et réaliste, ce titre est la        |
|                          |   référence absolue du genre."               |
|                          |                                              |
|                          |   [ Bouton: Fiche Officielle MAL ]           |
|                                                                       |
+-----------------------------------------------------------------------+
```

## 🛠️ Comment c'est fait (Architecture Hybride)

Cette application utilise une approche **"Hybrid AI + Data API"** pour garantir que les images et les liens ne sont jamais cassés.

### 1. Stack Technologique
*   **Frontend** : React 19 (TypeScript).
*   **AI Core** : SDK Google GenAI (`@google/genai`) avec **Gemini 2.5 Flash**.
*   **Data Layer** : **Jikan API (v4)** pour les métadonnées officielles.

### 2. Le flux "Anti-Hallucination"
Le processus se déroule en deux étapes distinctes :

**Étape 1 : Le Raisonnement (Gemini + Grounding)**
*   L'utilisateur envoie sa requête.
*   Gemini 2.5 analyse la demande (psychologique, mood, préférences) et sélectionne les anime les plus pertinents.
*   Il utilise `googleSearch` pour vérifier l'orthographe exacte et l'année de sortie.
*   Il génère un JSON contenant les titres et les raisons de la recommandation, mais laisse les champs `imageUrl` et `score` vides.

**Étape 2 : L'Enrichissement (Jikan API)**
*   Le code TypeScript récupère le JSON de Gemini.
*   Pour chaque titre recommandé, il interroge l'API Jikan (`api.jikan.moe`).
*   **Résultat** : Nous récupérons l'URL de l'image HD (`images.jpg.large_image_url`) et la note exacte (`score`) directement depuis la base de données MyAnimeList.
*   Cela garantit que l'image correspond toujours à l'anime et n'est jamais une hallucination de l'IA.

### 3. Gestion des Erreurs
*   **Parsing JSON** : Extraction robuste via `substring` pour ignorer le texte conversationnel de l'IA.
*   **Rate Limiting** : Un léger délai est ajouté entre les appels API Jikan pour éviter de surcharger le serveur public.
*   **Fallbacks** : Si l'API Jikan échoue, une image placeholder générée avec le titre de l'anime est utilisée.

## 🚀 Installation

1.  Assurez-vous d'avoir une clé API Gemini (`process.env.API_KEY`).
2.  Lancez l'application via votre serveur local. Aucune clé API n'est requise pour Jikan (Open Source).
