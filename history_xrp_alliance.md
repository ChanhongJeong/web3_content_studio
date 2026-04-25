# XRP Alliance 티저 페이지 — 작업 history

`xrp_alliance_teaser.html` 의 카피, 디자인, 톤, 룰 누적 기록.
다음 세션/디자이너/카피라이터에게 인계할 때 이 문서 한 장만 보면 모든 결정 맥락을 따라올 수 있게 정리.

라이브 URL: https://chanhongjeong.github.io/web3_content_studio/xrp_alliance_teaser.html
저장소: https://github.com/ChanhongJeong/web3_content_studio

---

## 0. 페이지 목적 + 타겟 오디언스

- **이 페이지를 보는 사람**: D'CENT를 모르고, XRP Alliance도 모르지만 **XRP 자체에 관심 있는** 홀더들. 주로 40~60대.
- **목표**: 이 페이지를 본 XRP 홀더가 "XRP를 D'CENT에 옮기고 싶다"는 충동을 느끼게 하는 것.
- **핵심 메시지**:
  1. D'CENT는 XRP 홀더에게 가장 편한 환경 (보유 → 활용 → 보상까지 A to Z 한 곳에서)
  2. D'CENT가 처음으로 XRP Alliance를 열었음 (역사적 첫 사건)
  3. Alliance 파트너들은 D'CENT XRP 홀더에게 독점 캠페인을 제공
  4. 보유만으로 자동 수령은 아님 — **기회가 계속 열림**

---

## 1. 톤 / 보이스 룰 (필수)

### 1-1. 시네마틱 + 구체적 동시 충족

> "직관적이지만 시적이지 않고, 구체적이지만 과장되지 않은" 좁은 통로.

**OK 예시:**
- "The XRP ecosystem, finally moving as one." (H2 시네마틱)
- "An exchange to buy. A wallet to hold. A separate service to earn." (구체적 페인포인트)
- "The XRP journey has stretched across too many platforms." (cinematic narrative)

**NG 예시 (실제로 거부당함):**
- "Some will surprise you." → 마케팅 카피
- "buy, hold, and grow your XRP" → 유치원생 톤
- "You buy here. You hold there. You earn somewhere else entirely." → 너무 추상적/번역체
- "Different apps. Different logins. A wallet for every move." → 과장/거짓 (말이 안 됨)

### 1-2. 절대 사용 금지 단어/표현

| 금지 | 이유 |
|---|---|
| `quest` (캠페인 의미) | 사용자 명시 거부 — "campaign"으로 통일 |
| `automatic` (자동 수령) | 거짓 약속 — 보유만으로 자동 받는 거 아님 |
| `every drop` | 과장 — 모든 보상을 받는 게 아님 |
| `Nothing to claim` | 절대 거짓 — 청구 액션이 필요한 캠페인도 있음 |
| `Forever` (마케팅 톤) | 너무 마케팅스럽고 가벼움 |
| `Some will surprise you` | 뉴스레터 광고 톤 |
| `coalition` | 너무 어렵고 정치적 |
| 홀더수 / 보유 XRP 수량 / AUM | 정책상 절대 노출 금지 |

### 1-3. 권장 표현

- **"opportunities keep coming"** — 기회가 계속 열린다 (정확한 표현)
- **"in for every drop"** ❌ 금지 → **"in the running"** / **"chances keep arriving"** ✅
- **"finally"** — 시네마틱 + 안도 (Heritage 강조 시 사용)
- **"For the first time"** — 역사적 첫 사건 강조
- **"D'CENT brings it all home"** — 통합 메타포
- **"and that's only the start"** — 추가 가치 reveal pivot

### 1-4. 줄바꿈 룰

- 핵심 문장마다 `<br>` 강제 줄바꿈 (자동 wrap에 맡기지 않음)
- 한 단락 = 3줄 구조 패턴
  - 라인 1: 후킹 (굵게)
  - 라인 2: 메커니즘 / 설명
  - 라인 3: 결론 / 행동 (굵게)
- 단락 간 `margin-top:24px`
- `.proof-head .lede` line-height: 1.75 (숨 쉴 공간)

---

## 2. 디자인 시스템

### 2-1. 컬러 팔레트

```css
--bg:#050508          /* 다크 네이비 베이스 */
--panel:#0A0C14       /* 카드 배경 */
--panel-2:#0E1018     /* 카드 내부 */
--ink:#FAFBFF         /* 본문 메인 */
--ink-1:#C6CCDC       /* 본문 보조 */
--ink-2:#7C8297       /* 메타/약함 */
--ink-3:#434959       /* 비활성/딤 */

--xrp:#23A3E0         /* Ripple 공식 블루 */
--xrp-hi:#5DDCFF      /* 하이라이트 시안 */
--xrp-lo:#006097      /* Ripple 딥블루 */
--glow:rgba(93,220,255,.4)

--silver:#C8D4E0      /* 실버 액센트 */
--silver-hi:#E2EAF2

--gold:#E0B768        /* 하드웨어 강조용 */
--gold-hi:#F4CE7B

--green:#7FEAB2       /* LIVE 상태 / 긍정 */
```

**규칙:**
- 메인 액센트: **Ripple 블루 (#5DDCFF)** — 절대 D'CENT 그린 사용 금지 (예전 피드백)
- 하드웨어/프리미엄 강조: 골드
- LIVE/캠페인 진행 상태: 그린

### 2-2. 폰트

- 본문: **Roboto** 100~700 (sans)
- 메타/모노: **Roboto Mono** 400~600

### 2-3. 시네마틱 디스플레이 룰

- H1: clamp(44px, 7.2vw, 96px) / weight 700 / line-height 0.94
- H2: clamp(32px, 5.4vw, 66px) / weight 700
- `.display em` = 그라데이션 강조 (`linear-gradient(135deg, #5DDCFF, #C8D4E0, #5DDCFF)` 클립)
- letter-spacing -0.045em ~ -0.055em (타이트한 헤드라인)

### 2-4. 공통 컴포넌트

- **`.kicker`** — 모노스페이스 라벨 (`— SOMETHING`) + 좌측 리딩 라인
- **`.status`** + `.status.live` — 상태 칩 (그린 도트 펄스)
- **`.btn`** — primary(흰배경) / ghost(테두리) / gold(하드웨어)
- **`.lede`** — 본문 단락 클래스 (line-height 1.6 기본)

---

## 3. 섹션별 결정사항

### 섹션 1 — HERO

#### NAV
- 좌: `XRP × D'CENT` 록업 (Ripple X 마크 + D'CENT 화이트 로고)
- 우상단: `Trusted since 2017` + `Meet D'CENT` 버튼
- `Meet D'CENT` 클릭 → `#proof` 섹션으로 스크롤

#### Status chip
- `● XRP ALLIANCE · LIVE` (그린, status.live 클래스)

#### H1
```
The first Alliance
for XRP.   ← 그라데이션 강조
```

#### Sub
> Opened by D'CENT — the wallet XRP holders have trusted since 2017. **For the first time, the entire XRP ecosystem comes together in one place.**

#### CTA
- Primary: `Meet D'CENT →` (`#proof`)
- Secondary: `See the Alliance` (`#partners`)

#### Stats Bar (4 column grid, 단일 행)
| Since 2017 | 0 Hacks | World's First | First XRP Yield |
|---|---|---|---|
| By XRP holders | Ever | Biometric wallet | On hardware |

> 룰: **홀더수, 보유 XRP 수량, AUM 절대 표기 안 함.**
> 헤리티지 + 보안 + 차별점 + XRP 특화 4축으로 구성.

#### Hero 비주얼 (`.hero-viz`)
- 중앙: **XRP × D'CENT 록업** (Ripple X SVG 56px + D'CENT 로고 28px, 동등 페어링)
- 외곽 반원 2개:
  - 좌측: `INFRASTRUCTURE` (Ripple 블루 1.5px)
  - 우측: `ECOSYSTEM` (Ripple 블루 1.5px, 동일 톤)
- 위성 6개 (모두 bright, dim 차별 없음 — "다 동등하게 좋은 것")
  - 좌측 INFRA: Fiat / Swap
  - 우측 ECO: Yield / Airdrops / Payments / dApps
- `XRP Alliance` 배지 중앙 위
- Ring 트레일 회전 애니메이션 (20s/35s/50s 다른 속도)

#### Hero 하단 Alliance Partners 바
- 실 로고: Ripple, Flare (cryptologos.cc), OSL
- 텍스트 핀: Squid Router, Doppler Finance, XRP Korea
- `+ more coming` 점선 라벨
- 라벨: `Alliance Partners` (← "Backed by" 표현 사용 금지 — Ripple 공식 후원 오해 방지)

---

### 섹션 2 — PARTNERS (Campaign cards)

#### Narrative 흐름 (필수)
1. **공감 (PROBLEM)** — XRP 홀더가 겪는 파편화
2. **해법 (편의성 메인)** — D'CENT가 모든 걸 한 지갑에 모음
3. **반전 (BONUS)** — 캠페인 보상까지 있음
4. **행동 (ACTION)** — Move XRP

#### Kicker
`— THE ALLIANCE`

#### H2
```
The XRP ecosystem,
finally moving as one.   ← 그라데이션
```

#### Sub (3-line + 3-line, 두 단락)

**Para 1 (정의 + 편의):**
> **For years, holding XRP has meant working across too many places.**
> An exchange to buy. A wallet to hold. A separate service to earn.
> **D'CENT brings it all home — the entire XRP ecosystem, under a single wallet.**

**Para 2 (보상 + 행동):**
> **And that's only the start.**
> Every Alliance partner reserves something exclusive for D'CENT XRP holders.
> **Move your XRP — and the opportunities never stop arriving.**

#### Aggregate 카운터 (3 mini stats)
| Paid to XRP holders | Live now | Up next |
|---|---|---|
| $22,500+ in XRP | 1 campaign (그린) | More on the way (블루) |

> 룰: 정확한 코밍 파트너 수는 모름 → "More on the way" 와 같은 미정 표현 사용.

#### 캠페인 카드 6장 (3-state 시각화)

| # | State | 파트너 | 카피 | 보상 |
|---|---|---|---|---|
| 1 | **ENDED** | Ripple | Welcome campaign — 첫 XRP 옮김 | $15,000 in XRP + Alliance Pass NFT |
| 2 | **ENDED** | OSL | Withdrawal bonus — OSL → D'CENT | $7,500 in XRP |
| 3 | **LIVE NOW** | Flare | FXRP Yield Campaign | Up to $25,000 (XRP+FLR), 12 days left |
| 4 | **COMING SOON** | `?` | "A name XRP holders will recognize..." | `???` Q2 2026 |
| 5 | **COMING SOON** | `?` | "Another name from the XRP ecosystem..." | `???` Q2 2026 |
| 6 | **COMING SOON** | `?` | "The third reveal. Bigger pools. Bigger names..." | `???` Q3 2026 |

> 룰: **Coming Soon 카드는 모두 미스터리 처리** (Doppler Finance / Squid Router 같은 이름 노출 금지). 단, Hero 하단 Alliance Partners 바에는 모든 파트너 이름 공개 (다른 레이어).

#### 카드 시각 차별
- ENDED: opacity 0.62, 회색 배지
- LIVE: 그린 글로우 + 상단 펄스 라이트 + 깜빡 도트
- COMING SOON: 점선 테두리 + 블루

#### 풋터
> Hold XRP in D'CENT — **and the opportunities keep coming.**

---

### 섹션 3 — BENEFITS (6 카드 그리드)

#### Kicker
`— WHAT'S INCLUDED`

#### H2
```
Hold XRP in D'CENT.
This is what comes with it.   ← 그라데이션
```

#### Sub
> **Six built-in advantages.**
> No other XRP wallet ships them all together.

#### 6 카드 (3×2 그리드)

| # | 타이틀 | 본문 |
|---|---|---|
| **+01** | Hold or send. Always free. | No matter the size of your XRP — D'CENT charges nothing to hold it, nothing to send it. |
| **+02** | The cheapest swap on XRPL. | When XRP needs to move, D'CENT routes it cheaper than any other wallet on the ledger. |
| **+03** | The XRPL ecosystem, native. | Every leading XRPL dApp, connected directly inside D'CENT. |
| **+04** | XRP that earns more XRP. | Yield. Deposits. Ways for your stack to grow — while it stays in your wallet. |
| **+05** | Airdrop chances, on repeat. | Hold XRP in D'CENT — and opportunities keep arriving across the XRPL ecosystem and the Alliance. |
| **+06** *(GOLD)* | Hardware unlocks more. | Everything above — plus exclusive Alliance rewards that keep arriving for D'CENT hardware holders. |

#### 누적 시각화
- 카드 번호: `+01` ~ `+06` (`+` 기호로 더하는 느낌)
- inset glow 점진 강화: 0.04 → 0.16 (1번부터 5번까지 선형 증가)
- 6번(Gold)이 폭발적으로 강조

#### 풋터
> Six advantages. **One wallet.** *That's D'CENT.*

> 룰: 이전 "Five come standard. The sixth is reserved for hardware..." 표현 거부됨. 합산 결론 톤으로.

---

### 섹션 4 — PROOF (Meet D'CENT)

> 위치: BENEFITS 다음, HARDWARE 앞.
> Hero "Meet D'CENT" CTA 클릭 시 여기 도착.

#### 3-블록 구조

**[A] Meet D'CENT 정체성 소개**
- Kicker: `— MEET D'CENT`
- H2: `Meet D'CENT.` / `The #1 wallet for XRP holders.` (em)
- Sub:
  > World's first biometric hardware wallet. EAL5+ certified.
  > Native to the XRP Ledger since 2017.
  > **Built by IoTrust — and now home to the XRP Alliance.**

**[B] XRP & D'CENT in the wild** (활동 갤러리)
- Kicker: `— XRP & D'CENT IN THE WILD`
- 한 줄 무한 스크롤 카루셀 (인플루언서 카루셀과 동일 패턴)
- 6장 placeholder 카드 + 6장 중복 (seamless loop)
- 카드: 16:10 썸네일 + 카테고리 + 제목 + 날짜
- placeholder URL 형식: `placehold.co/600x375/{bg}/{fg}/png?text=...&font=roboto`
- 카드 폭 380px (모바일 300px), 55s 1바퀴, hover paused
- 카테고리 예시: Conference / Event / Partnership / Community / AMA / Campaign

**[C] What XRP holders say** (인플루언서 카루셀)
- Kicker: `— WHAT XRP HOLDERS SAY`
- 기존 카루셀 (`.tcard` 인용 카드)
- 한 줄 무한 스크롤, 40s 1바퀴

> 룰: 사진(B) 먼저, quote(C) 나중. 시각 자료 → 음성 자료 점층 흐름.

---

### 섹션 5 — HARDWARE (골드)

- `id="hw"` (Hero 사용 안 함, 현재는 #proof 사용)
- H2: "The Alliance keeps giving. *To hardware first.*"
- 4가지 ALWAYS 약속:
  - × 2 on every reward
  - First in line for every partner drop
  - Hardware-only campaigns
  - EAL5+ signing
- CTA: "Get D'CENT Hardware" (gold) + "Move XRP to D'CENT" (ghost)
- 우측: D'CENT Biometric 디바이스 이미지

---

### 섹션 6 — COMPARE

- H2: "Same XRP. *Entirely different experience.*"
- 4행 비교 테이블: D'CENT vs Other wallets vs Exchanges
  - XRP yield
  - Transaction fees
  - Self-custody
  - Hardware + rewards
- 하단 "Why D'CENT" 피쳐 스트립 (Biometric / 100+ Networks / Lowest Fees / XRPL Native / EAL5+)

---

### 섹션 7 — EMAIL CAPTURE

- Standalone short section, max-width 560px center
- "Stay ahead. Be the first to know."
- 이메일 input + Sign Up 버튼
- 라벨: `Alliance updates · Partner reveals · Early supporter perks`

---

### 섹션 8 — FINAL CTA

- "Join the Alliance" kicker
- "Ready to see what your XRP can really do?" H2
- 카운트다운 위젯 (D-day to 2026-05-08)
- "Get D'CENT Wallet" + "Download App" 버튼

---

## 4. 섹션 순서

```
1. HERO + Stats Bar
2. PARTNERS — Campaign cards (Alliance 정의 + 6 캠페인)
3. BENEFITS — 6 card grid (D'CENT 6가지 혜택)
4. PROOF — Meet D'CENT + 활동 갤러리 + 인플루언서 카루셀
5. HARDWARE — 골드 sales card
6. COMPARE — 비교 테이블
7. EMAIL CAPTURE
8. FINAL CTA + Footer
```

> 룰: 섹션 간 padding 100~120px (이전 160px 너무 넓다는 피드백). 섹션 head margin-bottom 48px.

---

## 5. 사용자 협업 룰 (대화 결정사항)

### 5-1. 일하는 방식
- **로컬 우선 모드**: "이제부터 로컬로 작업하자" 명시 시 푸시/PR 금지. 로컬 commit만.
- **배포 명시 시**: "올려/배포해/깃허브에 올려줘" → 풀 워크플로 (브랜치/커밋/푸시/PR/머지) 한 번에.
- 디자인 반복 단계는 로컬 누적 후 한 번에 푸시 권장 (squash-merge 충돌 방지).

### 5-2. 검증 룰
- **모든 약속은 product 실제 capability에 맞는지 자가검증** ("automatic", "every drop" 같은 표현 거부됨)
- **추상 표현 금지** (here/there 등). 항상 명사 anchor 붙이기 (exchange/wallet/service)
- **가격/숫자**: 캠페인 보상 금액은 placeholder ($15K/$7.5K/$25K) — 실제 값으로 swap 예정

### 5-3. 디자인 원칙 (사용자 직접 표명)
- "디센트 그린 액센트 ❌" — Ripple 블루 톤만
- "기관급 프리미엄, 시네마틱 선언형" — xrp-seoul.com / xrp-tokyo.io 류
- "다른 지갑 은근 저격" — 경쟁사명 직접 노출 금지
- "웨이트리스트, 실루엣 티저 박스, 포인트 시즌 금지"
- "분명히 정의" + "기대감" 동시 충족
- "유치원생 ❌" + "포트레이 ❌"

---

## 6. 외부 자산

### 사용 중인 로고/이미지 URL

```
D'CENT 화이트 로고:
  https://cdn.prod.website-files.com/668b3a82199c56fe12067652/668b3a82199c56fe12067681_logo_white.svg

Ripple 로고:
  https://cdn.prod.website-files.com/668b3a82199c56fe12067652/669505197fd5bb5873a41a17_ripple.svg

Banxa, MoonPay, OSL (D'CENT CDN):
  /668b3a82199c56fe12067652/66950519da06b7e5b6e31c20_banxa.svg
  /668b3a82199c56fe12067652/6695051abdba0ef08fa2baaa_moonpay.svg
  /668b3a82199c56fe12067652/6695051920a67d8ee3be1a07_osl.svg

Flare:
  https://cryptologos.cc/logos/flare-flr-logo.svg

D'CENT Biometric Device:
  https://cdn.prod.website-files.com/668b3a82199c56fe12067652/669e1fa168365e119da14a01_biometric%401-570x640.webp
```

### 활동 갤러리 placeholder (디자이너 swap 대상)
6장 모두 `placehold.co` URL 사용. 구조:
```html
<img src="https://placehold.co/600x375/{bg-hex}/{fg-hex}/png?text={label}&font=roboto" />
```

---

## 7. 파일 구조

- 단일 HTML 파일: `xrp_alliance_teaser.html`
- 모든 CSS 인라인 (`<style>` 블록)
- 모든 JS 인라인 (`<script>` 블록 — 카운트다운, fade observer)
- 외부 의존성: Google Fonts (Roboto), 위 6개 외부 이미지 URL

---

## 8. 다음 작업 후보

지금까지 완료:
- [x] 섹션 1 HERO — 카피, 비주얼, stats, 록업
- [x] 섹션 2 PARTNERS — Campaign cards 신설
- [x] 섹션 3 BENEFITS — 6 card grid 갈아엎기
- [x] 섹션 4 PROOF — Meet D'CENT + 활동 갤러리 + 인플루언서 카루셀

다음 가능한 작업:
- [ ] 섹션 5 HARDWARE — 카피 톤 점검
- [ ] 섹션 6 COMPARE — 7.5% APY 같은 거짓 약속 점검 (APY 언급 금지 규칙 위반 가능성)
- [ ] 섹션 7 EMAIL CAPTURE — 카피 다듬기
- [ ] 섹션 8 FINAL CTA — 카운트다운 vs 라이브 톤 일관성
- [ ] 활동 갤러리 placeholder → 실제 썸네일 swap (디자이너 작업)
- [ ] 모바일 반응형 QA

---

## 9. 작업 commit 히스토리 요약 (PR #8 + #10 머지 기준)

### PR #8 (1차 — 2026-04-25)
- HERO 카피 재설계 (The first Alliance for XRP)
- 비주얼 록업 (XRP × D'CENT)
- INFRASTRUCTURE / ECOSYSTEM 외곽 반원
- PARTNERS 섹션 Venn → Campaign timeline 카드 전환
- HARDWARE 섹션 신설, 섹션 순서 재정렬

### PR #10 (2차 — 2026-04-26)
- PARTNERS narrative 재구성 (파편화 → 통합 → 캠페인 → 행동)
- Coming Soon 카드 미스터리 처리
- BENEFITS 갈아엎기 (stack chart → 6 card grid + 누적 시각화)
- PROOF 섹션 신설 (Meet D'CENT + 활동 갤러리 + 인플루언서 카루셀)
- 다수 카피 정정 (automatic / every drop / claim / quest 등 금지어 제거)
