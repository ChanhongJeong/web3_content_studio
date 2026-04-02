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

const USER_TWEETS_HASH = 'V1ze5q3ijDS1VeLwLY0m7g';
const USER_BY_SCREEN_NAME_HASH = 'xmU6X_CKVnQ5lSrCbAmJsg';

// 캐시: 같은 요청 반복 방지 (6시간)
const CACHE_DURATION = 6 * 60 * 60; // 초

function doGet(e) {
  const action = e.parameter.action;
  const handle = e.parameter.handle;

  if (!handle) {
    return jsonResponse({ error: 'handle parameter required' });
  }

  try {
    if (action === 'tweets') {
      const tweets = getTweets(handle, parseInt(e.parameter.count) || 5);
      return jsonResponse({ success: true, handle: handle, tweets: tweets });
    } else if (action === 'multi') {
      // 여러 계정 한번에
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

          if (legacy.full_text) {
            tweets.push({
              text: legacy.full_text,
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
function testFetch() {
  var tweets = getTweets('Ledger', 3);
  tweets.forEach(function(t) {
    Logger.log('[' + t.created_at + '] @' + t.handle + ': ' + t.text.substring(0, 100));
  });
}
