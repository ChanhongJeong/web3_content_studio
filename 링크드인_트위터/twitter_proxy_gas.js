// ============================================
// Google Apps Script - Twitter 트윗 프록시
// ============================================
//
// 설정 방법:
// 1. Google Apps Script (https://script.google.com) 에서 새 프로젝트 생성
// 2. 이 코드를 전체 복사하여 붙여넣기
// 3. 배포 > 새 배포 > 웹 앱 선택
//    - 실행 주체: 나
//    - 액세스 권한: 모든 사용자
// 4. 배포 후 나오는 URL을 content_page.html의 TWITTER_PROXY_URL에 붙여넣기
//

const BEARER = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
const BEARER_DECODED = decodeURIComponent(BEARER);
// Gemini API 키는 GAS 프로젝트 설정 > 스크립트 속성 > GEMINI_KEY에 저장
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') || '';

const USER_TWEETS_HASH = 'V1ze5q3ijDS1VeLwLY0m7g';
const USER_BY_SCREEN_NAME_HASH = 'xmU6X_CKVnQ5lSrCbAmJsg';

// 캐시: 같은 요청 반복 방지 (6시간)
const CACHE_DURATION = 6 * 60 * 60; // 초

function doGet(e) {
  const action = e.parameter.action;
  const handle = e.parameter.handle;

  try {
    if (action === 'tweets') {
      if (!handle) return jsonResponse({ error: 'handle parameter required' });
      const tweets = getTweets(handle, parseInt(e.parameter.count) || 5);
      return jsonResponse({ success: true, handle: handle, tweets: tweets });
    } else if (action === 'batch-summarize') {
      // 트윗 요약 별도 호출
      if (!handle) return jsonResponse({ error: 'handle parameter required' });
      var tweets2 = getTweets(handle, parseInt(e.parameter.count) || 5);
      var summaries = batchSummarizeTweets(tweets2, handle);
      return jsonResponse({ success: true, summaries: summaries });
    } else if (action === 'summarize') {
      var text = e.parameter.text || '';
      var h = handle || '';
      if (!text) return jsonResponse({ error: 'text parameter required' });
      var summary = summarizeTweet(text, h);
      return jsonResponse({ success: true, summary: summary });
    } else if (action === 'compose') {
      var text = e.parameter.text || '';
      var source = e.parameter.source || '';
      var link = e.parameter.link || '';
      var type = e.parameter.type || 'news';
      if (!text) return jsonResponse({ error: 'text parameter required' });
      var posts = generateSocialPosts(text, source, link, type);
      return jsonResponse({ success: true, posts: posts });
    } else if (action === 'generate-image') {
      // 별도 이미지 생성
      var prompt = e.parameter.prompt || '';
      if (!prompt) return jsonResponse({ error: 'prompt parameter required' });
      var imageBase64 = generateImage(prompt);
      if (imageBase64) {
        return jsonResponse({ success: true, image: imageBase64 });
      }
      return jsonResponse({ success: false, error: 'Image generation failed' });
    } else if (action === 'multi') {
      if (!handle) return jsonResponse({ error: 'handle parameter required' });
      const handles = handle.split(',');
      const result = {};
      handles.forEach(function(h) {
        try {
          result[h.trim()] = getTweets(h.trim(), parseInt(e.parameter.count) || 5);
        } catch (err) {
          result[h.trim()] = { error: err.message };
        }
      });
      return jsonResponse({ success: true, data: result });
    }
    return jsonResponse({ error: 'action must be "tweets" or "multi"' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// Gemini 일괄 요약 (API 1번 호출로 모든 트윗 요약)
function batchSummarizeTweets(tweets, handle) {
  if (!tweets || tweets.length === 0 || !GEMINI_API_KEY) return [];

  var cache = CacheService.getScriptCache();
  var cacheKey = 'batch_' + handle + '_' + tweets.length;
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var tweetList = tweets.map(function(t, i) {
    return (i + 1) + '. @' + (t.handle || handle) + ': ' + t.text.substring(0, 200);
  }).join('\n\n');

  var prompt = '다음 트윗들을 각각 한국어로 요약+해석해줘. 각 트윗마다 정확히 2줄만:\n요약: [1줄]\n해석: [하드웨어 지갑/Web3 업계 관점 1줄]\n\n트윗 사이에 빈 줄 넣어서 구분해줘.\n\n' + tweetList;

  var resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  if (data.candidates && data.candidates[0]) {
    var text = data.candidates[0].content.parts[0].text;
    // 빈 줄로 분리
    var blocks = text.split(/\n\s*\n/).filter(function(b) { return b.trim().length > 0; });
    var summaries = blocks.map(function(b) { return b.trim(); });
    cache.put(cacheKey, JSON.stringify(summaries), 60 * 10);
    return summaries;
  }
  return [];
}

// Gemini 개별 요약
function summarizeTweet(text, handle) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'summary_' + Utilities.base64Encode(text.substring(0, 100));
  var cached = cache.get(cacheKey);
  if (cached) return cached;

  var prompt = '다음 트윗을 한국어로 1줄 요약 + 하드웨어 지갑/Web3 업계 관점에서 1줄 해석해줘. 각각 1줄씩만, 아주 간결하게.\n형식:\n요약: [내용]\n해석: [내용]\n\n트윗 (@' + handle + '): ' + text;

  var resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  if (data.candidates && data.candidates[0]) {
    var result = data.candidates[0].content.parts[0].text;
    cache.put(cacheKey, result, 60 * 60); // 1시간 캐시
    return result;
  }
  return null;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getGuestToken() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('guest_token');
  if (cached) return cached;

  var resp = UrlFetchApp.fetch('https://api.twitter.com/1.1/guest/activate.json', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + BEARER_DECODED },
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  var token = data.guest_token;
  cache.put('guest_token', token, 60 * 30); // 30분 캐시
  return token;
}

function getUserId(screenName) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'uid_' + screenName.toLowerCase();
  var cached = cache.get(cacheKey);
  if (cached) return cached;

  var guestToken = getGuestToken();
  var variables = JSON.stringify({ screen_name: screenName, withSafetyModeUserFields: true });
  var features = JSON.stringify({ hidden_profile_subscriptions_enabled: true });

  var url = 'https://twitter.com/i/api/graphql/' + USER_BY_SCREEN_NAME_HASH +
    '/UserByScreenName?variables=' + encodeURIComponent(variables) +
    '&features=' + encodeURIComponent(features);

  var resp = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + BEARER_DECODED,
      'x-guest-token': guestToken,
      'User-Agent': 'Mozilla/5.0'
    },
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  var userId = data.data.user.result.rest_id;
  cache.put(cacheKey, userId, CACHE_DURATION);
  return userId;
}

function getTweets(screenName, count) {
  // 캐시 확인
  var cache = CacheService.getScriptCache();
  var cacheKey = 'tweets_' + screenName.toLowerCase() + '_' + count;
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var userId = getUserId(screenName);
  var guestToken = getGuestToken();

  var variables = JSON.stringify({
    userId: userId,
    count: count,
    includePromotedContent: false,
    withVoice: false,
    withV2Timeline: true
  });

  var features = JSON.stringify({
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false
  });

  var url = 'https://twitter.com/i/api/graphql/' + USER_TWEETS_HASH +
    '/UserTweets?variables=' + encodeURIComponent(variables) +
    '&features=' + encodeURIComponent(features);

  var resp = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + BEARER_DECODED,
      'x-guest-token': guestToken,
      'User-Agent': 'Mozilla/5.0'
    },
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  var tweets = [];

  var instructions = data.data.user.result.timeline_v2.timeline.instructions;
  for (var i = 0; i < instructions.length; i++) {
    if (instructions[i].type === 'TimelineAddEntries') {
      var entries = instructions[i].entries;
      for (var j = 0; j < entries.length; j++) {
        try {
          var item = entries[j].content.itemContent.tweet_results.result;
          // Handle TweetWithVisibilityResults wrapper
          if (item.__typename === 'TweetWithVisibilityResults') {
            item = item.tweet || item;
          }
          var legacy = item.legacy || {};
          var userLegacy = (item.core && item.core.user_results && item.core.user_results.result && item.core.user_results.result.legacy) || {};

          // RT인 경우 원본 트윗의 전체 텍스트 사용
          var fullText = legacy.full_text || '';
          if (legacy.retweeted_status_result && legacy.retweeted_status_result.result) {
            var rtItem = legacy.retweeted_status_result.result;
            if (rtItem.__typename === 'TweetWithVisibilityResults') rtItem = rtItem.tweet || rtItem;
            var rtLegacy = rtItem.legacy || {};
            var rtUser = (rtItem.core && rtItem.core.user_results && rtItem.core.user_results.result && rtItem.core.user_results.result.legacy) || {};
            if (rtLegacy.full_text) {
              fullText = 'RT @' + (rtUser.screen_name || '') + ': ' + rtLegacy.full_text;
            }
          }

          if (fullText) {
            tweets.push({
              text: fullText,
              created_at: legacy.created_at,
              id: legacy.id_str,
              name: userLegacy.name || screenName,
              handle: userLegacy.screen_name || screenName,
              retweet_count: legacy.retweet_count || 0,
              favorite_count: legacy.favorite_count || 0,
              reply_count: legacy.reply_count || 0,
              profile_image: userLegacy.profile_image_url_https || '',
              media: extractMedia(legacy),
            });
          }
          if (tweets.length >= count) break;
        } catch (e) {
          // skip non-tweet entries
        }
      }
    }
  }

  // 캐시 저장 (10분)
  cache.put(cacheKey, JSON.stringify(tweets), 60 * 10);
  return tweets;
}

function extractMedia(legacy) {
  var media = [];
  if (legacy.extended_entities && legacy.extended_entities.media) {
    legacy.extended_entities.media.forEach(function(m) {
      media.push({
        type: m.type,
        url: m.media_url_https,
        video_url: (m.video_info && m.video_info.variants) ?
          m.video_info.variants.filter(function(v) { return v.content_type === 'video/mp4'; })
            .sort(function(a, b) { return (b.bitrate || 0) - (a.bitrate || 0); })[0]
            ? m.video_info.variants.filter(function(v) { return v.content_type === 'video/mp4'; })
                .sort(function(a, b) { return (b.bitrate || 0) - (a.bitrate || 0); })[0].url
            : null
          : null
      });
    });
  }
  return media;
}

// 테스트용 함수 (Apps Script 에디터에서 직접 실행)
// X + LinkedIn 글 자동 생성
function generateSocialPosts(text, source, link, type) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'compose_' + Utilities.base64Encode(text.substring(0, 80));
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var sourceContext = type === 'tweet' ? '경쟁사 트윗' : '뉴스 기사';
  var linkText = link ? '\n\nSource link: ' + link : '';

  // 매번 다른 스타일을 위해 랜덤 톤 선택
  var tones = [
    'witty and slightly sarcastic, like commenting to a friend',
    'genuinely curious and exploratory, thinking out loud',
    'passionate and fired up about something you care about',
    'calm and analytical, breaking down what really matters',
    'playful but insightful, mixing humor with a real point',
    'storytelling mode - connect this to something you experienced at work'
  ];
  var randomTone = tones[Math.floor(Math.random() * tones.length)];

  var prompt = `You are Tani (@Tani_9325). You work at D'CENT (hardware wallet company) but you NEVER promote it. You're just a guy who works in the wallet space, has opinions, and posts about crypto/web3 stuff naturally.

Your tone for this post: ${randomTone}

=== SOURCE (${sourceContext}) ===
${text}
${source ? '(Source: ' + source + ')' : ''}${linkText}
=== END SOURCE ===

Feel the vibe of this ${sourceContext}. What's your gut reaction? What would you actually say to your crypto friends about this?

=== POST 1: X (Twitter) - ENGLISH ===
IMPORTANT RULES:
- Write like a REAL PERSON, not a "crypto thought leader". No corporate speak.
- NEVER say "As an industry insider/expert/professional" - just share your take naturally
- Use emojis naturally but don't overdo it (2-4 emojis scattered throughout, not clustered)
- Good line breaks for readability (short punchy lines)
- Your opinion should feel casual but smart: "ngl this is wild" / "been thinking about this all day" / "okay but nobody's talking about..." / "this is exactly what I was worried about"
- DON'T always push hardware wallets or self-custody. Sometimes just comment on the news, share a thought, ask a question, or make an observation
- Twitter Premium = no character limit, but don't ramble. 4-8 lines is ideal.
- End with something engaging (question, hot take, or just a vibe)
- 2-3 hashtags at the very end
- DO NOT include source link (appended automatically)
- VARY your style every time. Don't start every post the same way.

BAD examples (don't write like this):
- "As an industry insider, I see these exploits highlight..."
- "This is why self-custody matters."
- "As a wallet industry professional..."

GOOD examples (write like this):
- "52M lost in March alone 🫠\\n\\nand we're not even halfway through Q1\\n\\nthe scary part? most of these weren't even sophisticated attacks"
- "okay but can we talk about how Drift just got hit for $285M?\\n\\nI work in wallet security and even I'm shook"
- "not a great look for DeFi rn\\n\\nbut honestly this is the kind of stress test the ecosystem needs\\n\\nthe protocols that survive this will be 10x stronger"

=== POST 2: LinkedIn - KOREAN (한국어) ===
IMPORTANT RULES:
- 한국어로 작성. 150-200 단어.
- "전문가로서" "업계 관계자로서" 이런 말 절대 쓰지 마.
- 그냥 자연스럽게 내 생각을 공유하는 느낌으로.
- 업계 동향이나 최근 이슈랑 자연스럽게 연결
- 너무 딱딱하지 않게, 하지만 인사이트는 있게
- 매번 하드웨어 지갑 써야 한다고 하지 마. 가끔은 그냥 시장 분석, 트렌드 얘기, 궁금한 점을 던지는 것도 OK
- 줄바꿈 잘 해서 읽기 편하게
- 마지막에 가볍게 질문이나 생각거리 던지기
- 해시태그 3-4개

=== POST 3: Image prompt for AI image generation ===
Generate a detailed image generation prompt (in English) for a social media post image that matches the mood and content of the posts you wrote above.
The prompt should describe:
- Visual style (e.g. dark futuristic, clean minimal, neon cyberpunk, editorial photo style)
- Key visual elements that represent the topic (e.g. broken shield for security breach, coins flowing for DeFi)
- Color mood matching the content emotion
- Composition suitable for social media card (16:9 ratio)
- Make it look professional and eye-catching, NOT generic stock photo style
- Do NOT include any text/typography in the image - the image should be purely visual

=== OUTPUT (strict JSON only, no markdown, no code fences) ===
{"x": "...", "linkedin": "...", "imagePrompt": "detailed image generation prompt here"}`;

  var resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9 }
    }),
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  if (data.candidates && data.candidates[0]) {
    var raw = data.candidates[0].content.parts[0].text;
    // JSON 추출 (```json ... ``` 감싸져 있을 수 있음)
    var jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      var posts = JSON.parse(jsonMatch[0]);
      cache.put(cacheKey, JSON.stringify(posts), 60 * 30); // 30분 캐시
      return posts;
    }
  }
  return { x: '', linkedin: '', imagePrompt: '' };
}

// Imagen 3 이미지 생성
function generateImage(prompt) {
  if (!GEMINI_API_KEY || !prompt) return null;

  try {
    var resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=' + GEMINI_API_KEY, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: { sampleCount: 1, aspectRatio: '16:9', outputOptions: { mimeType: 'image/jpeg' } }
      }),
      muteHttpExceptions: true
    });

    var data = JSON.parse(resp.getContentText());
    if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
      return data.predictions[0].bytesBase64Encoded;
    }

    // 다른 응답 형식 시도
    if (data.error) {
      Logger.log('Imagen error: ' + data.error.message);
    }
  } catch (e) {
    Logger.log('Image gen error: ' + e.message);
  }
  return null;
}

function testFetch() {
  var tweets = getTweets('Ledger', 3);
  tweets.forEach(function(t) {
    Logger.log('[' + t.created_at + '] @' + t.handle + ': ' + t.text.substring(0, 100));
  });
}

function testGemini() {
  Logger.log('=== Testing Gemini API ===');
  Logger.log('API Key: ' + (GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'EMPTY!'));

  try {
    var result = summarizeTweet('Cash-to-Stablecoin now supports BASE. Stack stablecoins in Ledger Wallet quickly via BASE.', 'Ledger');
    Logger.log('Summary result: ' + result);
  } catch (e) {
    Logger.log('Summary error: ' + e.message);
  }

  try {
    var posts = generateSocialPosts('Crypto hack losses reach $52 million in March according to PeckShield report', 'The Block', 'https://example.com', 'news');
    Logger.log('X post: ' + (posts.x || 'EMPTY').substring(0, 100));
    Logger.log('LinkedIn: ' + (posts.linkedin || 'EMPTY').substring(0, 100));
    Logger.log('ImagePrompt: ' + (posts.imagePrompt || 'EMPTY').substring(0, 100));
  } catch (e) {
    Logger.log('Compose error: ' + e.message);
  }
}

function testDirect() {
  Logger.log('Key: ' + (GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'EMPTY'));
  var resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({contents: [{parts: [{text: 'Say hi in Korean, one word'}]}]}),
    muteHttpExceptions: true
  });
  Logger.log(resp.getContentText().substring(0, 500));
}
