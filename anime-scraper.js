import axios from ‘axios’;
import * as cheerio from ‘cheerio’;

class AnimeScraper {
constructor() {
this.jikanAPI = ‘https://api.jikan.moe/v4’;
this.anilistAPI = ‘https://graphql.anilist.co’;
}

async searchAnime(query) {
try {
// Using Jikan API (MyAnimeList unofficial API)
const response = await axios.get(`${this.jikanAPI}/anime`, {
params: {
q: query,
limit: 5
}
});

```
  if (response.data && response.data.data) {
    return this.formatAnimeResults(response.data.data);
  }
  
  return { success: false, error: 'No results found' };
} catch (error) {
  console.error('Error searching anime:', error);
  return { success: false, error: error.message };
}
```

}

async getAnimeById(malId) {
try {
const response = await axios.get(`${this.jikanAPI}/anime/${malId}`);

```
  if (response.data && response.data.data) {
    return this.formatAnimeDetail(response.data.data);
  }
  
  return { success: false, error: 'Anime not found' };
} catch (error) {
  return { success: false, error: error.message };
}
```

}

async getTopAnime(type = ‘tv’, limit = 10) {
try {
const response = await axios.get(`${this.jikanAPI}/top/anime`, {
params: {
type: type,
limit: limit
}
});

```
  if (response.data && response.data.data) {
    return this.formatAnimeResults(response.data.data);
  }
  
  return { success: false, error: 'No results found' };
} catch (error) {
  return { success: false, error: error.message };
}
```

}

async getSeasonalAnime(year, season) {
try {
const response = await axios.get(`${this.jikanAPI}/seasons/${year}/${season}`);

```
  if (response.data && response.data.data) {
    return this.formatAnimeResults(response.data.data);
  }
  
  return { success: false, error: 'No results found' };
} catch (error) {
  return { success: false, error: error.message };
}
```

}

async getCurrentSeason() {
try {
const response = await axios.get(`${this.jikanAPI}/seasons/now`);

```
  if (response.data && response.data.data) {
    return this.formatAnimeResults(response.data.data);
  }
  
  return { success: false, error: 'No results found' };
} catch (error) {
  return { success: false, error: error.message };
}
```

}

async searchCharacter(name) {
try {
const response = await axios.get(`${this.jikanAPI}/characters`, {
params: {
q: name,
limit: 5
}
});

```
  if (response.data && response.data.data) {
    return this.formatCharacterResults(response.data.data);
  }
  
  return { success: false, error: 'No results found' };
} catch (error) {
  return { success: false, error: error.message };
}
```

}

async getAnimeRecommendations(malId) {
try {
const response = await axios.get(`${this.jikanAPI}/anime/${malId}/recommendations`);

```
  if (response.data && response.data.data) {
    return response.data.data.slice(0, 5).map(rec => ({
      title: rec.entry.title,
      malId: rec.entry.mal_id,
      image: rec.entry.images?.jpg?.image_url,
      votes: rec.votes
    }));
  }
  
  return { success: false, error: 'No recommendations found' };
} catch (error) {
  return { success: false, error: error.message };
}
```

}

formatAnimeResults(animeList) {
return {
success: true,
results: animeList.map(anime => ({
malId: anime.mal_id,
title: anime.title,
englishTitle: anime.title_english,
japaneseTitle: anime.title_japanese,
type: anime.type,
episodes: anime.episodes,
status: anime.status,
score: anime.score,
rating: anime.rating,
synopsis: anime.synopsis,
image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
url: anime.url,
year: anime.year,
season: anime.season,
studios: anime.studios?.map(s => s.name).join(’, ‘),
genres: anime.genres?.map(g => g.name).join(’, ’)
}))
};
}

formatAnimeDetail(anime) {
return {
success: true,
malId: anime.mal_id,
title: anime.title,
englishTitle: anime.title_english,
japaneseTitle: anime.title_japanese,
type: anime.type,
episodes: anime.episodes,
status: anime.status,
aired: anime.aired?.string,
score: anime.score,
scoredBy: anime.scored_by,
rank: anime.rank,
popularity: anime.popularity,
members: anime.members,
favorites: anime.favorites,
synopsis: anime.synopsis,
background: anime.background,
season: anime.season,
year: anime.year,
rating: anime.rating,
source: anime.source,
duration: anime.duration,
image: anime.images?.jpg?.large_image_url,
trailer: anime.trailer?.url,
studios: anime.studios?.map(s => s.name).join(’, ‘),
genres: anime.genres?.map(g => g.name).join(’, ‘),
themes: anime.themes?.map(t => t.name).join(’, ‘),
demographics: anime.demographics?.map(d => d.name).join(’, ’)
};
}

formatCharacterResults(characters) {
return {
success: true,
results: characters.map(char => ({
malId: char.mal_id,
name: char.name,
image: char.images?.jpg?.image_url,
url: char.url,
favorites: char.favorites
}))
};
}

formatAnimeMessage(anime) {
return `🎌 *${anime.title}* ${anime.englishTitle ?`📝 English: ${anime.englishTitle}`: ''} ${anime.japaneseTitle ?`🇯🇵 Japanese: ${anime.japaneseTitle}` : ‘’}

📺 Type: ${anime.type || ‘N/A’}
📊 Episodes: ${anime.episodes || ‘Unknown’}
⭐ Score: ${anime.score || ‘N/A’}/10
📈 Status: ${anime.status || ‘Unknown’}
${anime.year ? `📅 Year: ${anime.year}` : ‘’}
${anime.season ? `🌸 Season: ${anime.season}` : ‘’}
${anime.studios ? `🎬 Studios: ${anime.studios}` : ‘’}
${anime.genres ? `🏷️ Genres: ${anime.genres}` : ‘’}

📖 Synopsis:
${anime.synopsis || ‘No synopsis available’}

🔗 MAL: ${anime.url || ‘N/A’}
`.trim();
}

formatSearchResults(results) {
if (!results.success || !results.results.length) {
return ‘❌ No anime found matching your search.’;
}

```
let message = '🔍 *Anime Search Results:*\n\n';

results.results.forEach((anime, index) => {
  message += `${index + 1}. *${anime.title}*\n`;
  message += `   ⭐ Score: ${anime.score || 'N/A'} | 📺 ${anime.type || 'N/A'} | 📊 ${anime.episodes || '?'} eps\n`;
  message += `   🏷️ ${anime.genres || 'N/A'}\n`;
  message += `   ID: ${anime.malId}\n\n`;
});

message += '\n💡 Use !anime info <ID> to get more details';

return message;
```

}
}

export default AnimeScraper;
  
