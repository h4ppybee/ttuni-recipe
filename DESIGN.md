---
version: 1
name: ttuni-recipe-design
description: 토스 스타일을 따르는 뚜니레시피 디자인 시스템. 회색빛 중립 캔버스(#F7F8FA) 위에 흰 카드를 부드러운 그림자로 띄우고, 토마토 레드(#E5533A) 하나를 브랜드 색으로 아껴 쓴다. 폰트는 Pretendard, 문구는 토스 UX 라이팅(해요체). radius와 그림자는 토큰 몇 개로만 표현해 화면 전체의 일관성을 지킨다.

colors:
  primary: "#E5533A"
  primary-pressed: "#C93E27"
  primary-disabled: "#F6C5BA"
  primary-surface: "#FDECE8"
  primary-text: "#D2452D"   # 연한 배경 위 브랜드색 글자(칩, 강조)
  leaf: "#7C7F3F"           # 아이콘 잎 색. 일러스트·빈 상태 장식에만
  ink: "#191F28"
  body: "#4E5968"
  body-soft: "#6B7684"
  muted: "#8B95A1"
  muted-soft: "#B0B8C1"
  hairline: "#EEF0F3"
  canvas: "#F7F8FA"
  surface-card: "#FFFFFF"
  surface-soft: "#F2F4F6"
  surface-strong: "#E5E8EB"
  on-primary: "#FFFFFF"
  warning-surface: "#FFF7E6"
  warning-text: "#9A6700"

typography:
  fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', Roboto, sans-serif"
  title-lg:      { fontSize: 24px, fontWeight: 700, lineHeight: 1.35, letterSpacing: -0.3px }
  title-md:      { fontSize: 19px, fontWeight: 700, lineHeight: 1.4,  letterSpacing: -0.2px }
  title-sm:      { fontSize: 17px, fontWeight: 600, lineHeight: 1.45, letterSpacing: -0.2px }
  body-lg:       { fontSize: 17px, fontWeight: 400, lineHeight: 1.6,  letterSpacing: -0.2px }
  body-md:       { fontSize: 15px, fontWeight: 400, lineHeight: 1.5,  letterSpacing: -0.1px }
  body-strong:   { fontSize: 15px, fontWeight: 600, lineHeight: 1.5,  letterSpacing: -0.1px }
  caption:       { fontSize: 13px, fontWeight: 400, lineHeight: 1.45 }
  caption-strong:{ fontSize: 12px, fontWeight: 600, lineHeight: 1.4 }
  button:        { fontSize: 17px, fontWeight: 600, lineHeight: 1.2,  letterSpacing: -0.2px }
  tab-label:     { fontSize: 11px, fontWeight: 600, lineHeight: 1.2 }

rounded:
  card: 20px      # 카드, 다이얼로그, 바텀시트, 상세 화면 대표 사진
  control: 12px   # 버튼, 입력, 카드 안 썸네일
  pill: 9999px    # 칩, 원형 아이콘 버튼, FAB

shadows:
  card: "0 1px 4px rgba(0, 23, 51, 0.04), 0 2px 12px rgba(0, 23, 51, 0.04)"
  floating: "0 8px 24px rgba(0, 23, 51, 0.12)"

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 20px
  lg: 24px
  xl: 32px
  xxl: 48px
---

# 뚜니레시피 DESIGN.md

UI를 만들거나 고칠 때는 이 문서를 먼저 읽는다. 여기 없는 색·radius·그림자가 필요하면 컴포넌트에 직접 쓰지 말고 이 문서와 토큰 파일을 먼저 고친다.

## 1. 원칙

- **토스 레이어링**: 회색빛 캔버스(`canvas`) 위에 흰 카드(`surface-card`)를 `shadow-card`로 띄운다. 두꺼운 테두리와 장식용 그림자는 쓰지 않는다.
- **브랜드 색은 하나**: 토마토 레드(`primary`)는 주요 버튼, 선택된 칩, 활성 탭 아이콘, FAB에만 쓴다. 본문이나 넓은 배경에 깔지 않는다.
- **사진이 주인공**: 레시피 사진이 화면에서 가장 눈에 띄도록 나머지 요소는 회색 위계로 차분하게 둔다.
- **모바일 우선**: 한 열 레이아웃, 좌우 여백 16px, 콘텐츠 최대 폭 480px 가운데 정렬.

## 2. 일관성 규칙 (반드시 지킨다)

| 대상 | 쓰는 토큰 | Tailwind 클래스 |
|---|---|---|
| 카드, 다이얼로그, 바텀시트, 상세 대표 사진 | `rounded.card` 20px | `rounded-card` |
| 버튼, 입력, 카드 안 썸네일 | `rounded.control` 12px | `rounded-control` |
| 칩, 원형 버튼, FAB | `rounded.pill` | `rounded-pill` |
| 카드 그림자 | `shadows.card` | `shadow-card` |
| 다이얼로그, FAB, 토스트 | `shadows.floating` | `shadow-floating` |

- 컴포넌트 코드에 `rounded-[..px]`, `rounded-lg`·`rounded-xl` 같은 기본 스케일, `shadow-[...]`, `shadow-md` 같은 기본 그림자, `#hex` 색을 쓰지 않는다. Tailwind 기본 radius·shadow·color 스케일은 테마에서 지워서 실수로도 쓸 수 없게 한다.
- 카드는 반드시 공용 `Card` 컴포넌트로 그린다. 화면마다 카드 스타일을 새로 조합하지 않는다.
- 카드 안쪽 여백은 16px(`p-4`) 하나, 카드 사이 간격은 12px(`gap-3`) 하나로 통일한다.
- 이 규칙은 `src/test/designTokens.test.ts`가 검사한다. 금지 패턴(`rounded-[`, `shadow-[`, Tailwind 기본 radius·shadow 이름, `#hex` 색)이 `src/` 코드에 있거나 `shadow-card`가 `Card.tsx` 밖에 있으면 테스트가 실패한다.

### Tailwind v4 토큰 (`src/styles/theme.css`)

```css
@import "tailwindcss";

@theme {
  --color-*: initial;
  --radius-*: initial;
  --shadow-*: initial;

  --color-primary: #E5533A;
  --color-primary-pressed: #C93E27;
  --color-primary-disabled: #F6C5BA;
  --color-primary-surface: #FDECE8;
  --color-primary-text: #D2452D;
  --color-leaf: #7C7F3F;
  --color-ink: #191F28;
  --color-body: #4E5968;
  --color-body-soft: #6B7684;
  --color-muted: #8B95A1;
  --color-muted-soft: #B0B8C1;
  --color-hairline: #EEF0F3;
  --color-canvas: #F7F8FA;
  --color-surface-card: #FFFFFF;
  --color-surface-soft: #F2F4F6;
  --color-surface-strong: #E5E8EB;
  --color-on-primary: #FFFFFF;
  --color-warning-surface: #FFF7E6;
  --color-warning-text: #9A6700;
  --color-white: #FFFFFF;
  --color-transparent: transparent;
  --color-overlay: rgba(0, 0, 0, 0.4);

  --text-*: initial;
  --text-title-lg: 24px;  --text-title-lg--line-height: 1.35; --text-title-lg--letter-spacing: -0.3px; --text-title-lg--font-weight: 700;
  --text-title-md: 19px;  --text-title-md--line-height: 1.4;  --text-title-md--letter-spacing: -0.2px; --text-title-md--font-weight: 700;
  --text-title-sm: 17px;  --text-title-sm--line-height: 1.45; --text-title-sm--letter-spacing: -0.2px; --text-title-sm--font-weight: 600;
  --text-body-lg: 17px;   --text-body-lg--line-height: 1.6;   --text-body-lg--letter-spacing: -0.2px;
  --text-body-md: 15px;   --text-body-md--line-height: 1.5;   --text-body-md--letter-spacing: -0.1px;
  --text-body-strong: 15px; --text-body-strong--line-height: 1.5; --text-body-strong--letter-spacing: -0.1px; --text-body-strong--font-weight: 600;
  --text-caption: 13px;   --text-caption--line-height: 1.45;
  --text-caption-strong: 12px; --text-caption-strong--line-height: 1.4; --text-caption-strong--font-weight: 600;
  --text-button: 17px;    --text-button--line-height: 1.2;    --text-button--letter-spacing: -0.2px; --text-button--font-weight: 600;
  --text-tab-label: 11px; --text-tab-label--line-height: 1.2; --text-tab-label--font-weight: 600;

  --radius-card: 20px;
  --radius-control: 12px;
  --radius-pill: 9999px;

  --shadow-card: 0 1px 4px rgba(0, 23, 51, 0.04), 0 2px 12px rgba(0, 23, 51, 0.04);
  --shadow-floating: 0 8px 24px rgba(0, 23, 51, 0.12);

  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", Roboto, sans-serif;
}
```

브랜드 색을 바꿀 때는 `--color-primary*` 다섯 줄과 이 문서의 `colors`만 고치면 된다.

## 3. 색

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `primary` | #E5533A | 주요 버튼, FAB, 활성 탭 아이콘, 입력 focus 테두리 |
| `primary-pressed` | #C93E27 | 버튼 누름 상태 |
| `primary-disabled` | #F6C5BA | 비활성 주요 버튼 |
| `primary-surface` | #FDECE8 | 보조 버튼 배경, 선택된 칩 배경, 썸네일 없는 카드의 자리 배경 |
| `primary-text` | #D2452D | 연한 배경 위 브랜드색 글자(선택 칩, 오저뭐에서 겹친 재료) |
| `leaf` | #7C7F3F | 일러스트, 빈 상태 장식. 버튼·글자에는 쓰지 않는다 |
| `ink` | #191F28 | 제목, 레시피 이름, 활성 탭 라벨 |
| `body` | #4E5968 | 본문, 단계 설명 |
| `body-soft` | #6B7684 | 보조 본문, 메모 |
| `muted` | #8B95A1 | 캡션, placeholder, 비활성 탭 |
| `muted-soft` | #B0B8C1 | 비활성 텍스트 |
| `hairline` | #EEF0F3 | 1px 구분선, 탭 바 위 테두리 |
| `canvas` | #F7F8FA | 페이지 바탕 |
| `surface-card` | #FFFFFF | 카드, 탭 바, 다이얼로그 |
| `surface-soft` | #F2F4F6 | 입력 필드 배경, 아이콘 버튼 hover |
| `surface-strong` | #E5E8EB | 약한 버튼, 기본 칩 배경 |

- 삭제 같은 위험 동작도 별도 빨강을 만들지 않는다. 브랜드 색이 이미 빨강이라 "주요 동작"과 "위험 동작"이 겹치기 때문이다. 삭제 버튼은 약한 버튼(`surface-strong` + `body` 글자)으로 두고, 확인 다이얼로그의 "삭제하기"만 주요 버튼으로 둔다.

## 4. 타이포그래피

Pretendard 하나만 쓴다. npm `pretendard` 패키지의 `dist/web/variable/pretendardvariable-dynamic-subset.css`를 `main.tsx`에서 불러온다. 폰트 파일은 같은 출처에서 서빙되므로 서비스 워커가 처음 쓸 때 캐시한다.

크기·굵기·자간은 Tailwind `text-*` 토큰으로 묶어 둔다(`text-title-lg`처럼 쓰면 크기·줄간격·자간·굵기가 함께 적용된다). Tailwind 기본 `text-sm`·`text-lg` 스케일은 지운다.

| 토큰 | 크기 / 굵기 | 쓰임 |
|---|---|---|
| `title-lg` | 24 / 700 | 화면 제목(레시피 상세 이름, 탭 제목) |
| `title-md` | 19 / 700 | 섹션 제목(재료, 만드는 방법), 오저뭐 결과 이름 |
| `title-sm` | 17 / 600 | 목록 카드의 레시피 이름 |
| `body-lg` | 17 / 400 | 입력값, 단계 설명 |
| `body-md` | 15 / 400 | 보조 본문, 메모 |
| `body-strong` | 15 / 600 | 강조 본문 |
| `caption` | 13 / 400 | 카드의 재료 요약, 안내 문구 |
| `caption-strong` | 12 / 600 | 칩, 배지 |
| `button` | 17 / 600 | 버튼 |
| `tab-label` | 11 / 600 | 하단 탭 라벨 |

제목에만 700을 쓰고 본문은 400으로 둔다. 위계는 크기보다 굵기와 색(ink → body → muted)으로 만든다.

## 5. 레이아웃

- 좌우 여백 16px, 콘텐츠 최대 폭 480px.
- 화면 상단: 제목 바 높이 56px, 배경은 `canvas`. (스크롤 시 `surface-card` + 아래 `hairline`으로 바꾸는 동작은 2차에서 검토)
- 하단 탭 바가 있는 화면은 콘텐츠 아래에 `탭 바 높이 + safe-area-inset-bottom + 16px` 여백을 둔다.
- 편집 화면처럼 하단에 고정 버튼이 있으면 탭 바를 숨기고 버튼 영역에 safe-area 패딩을 준다.

## 6. 컴포넌트

### 하단 탭 바 (`TabBar`)
- 탭 3개: 레시피, 메뉴추천(요술봉 아이콘 `WandSparkles`, 화면 제목은 "오저뭐?"), 설정. 아이콘(24px, 단순 stroke) 위, 라벨(`tab-label`) 아래.
- 높이 56px + `env(safe-area-inset-bottom)`, 배경 `surface-card`, 위 테두리 `hairline`, 화면 하단 고정.
- 활성: 아이콘 `primary`, 라벨 `ink`. 비활성: 아이콘·라벨 `muted-soft`. 활성 탭에 `aria-current="page"`.
- 상세·편집 화면에서는 숨긴다.

### 카드 (`Card`)
- `bg-surface-card rounded-card shadow-card p-4`. 이 조합은 `Card` 안에만 존재한다.
- 누를 수 있는 카드는 누르는 동안 `scale-[0.98]`, 120ms. 그림자는 바꾸지 않는다.

### 레시피 카드 (`RecipeCard`)
- `Card` 안에 가로 배치: 썸네일 64×64(`rounded-control`, `object-cover`) + 이름(`title-sm`, 한 줄 말줄임) + 재료명 요약(`caption`, `muted`, 한 줄 말줄임, ` · `로 구분).
- 사진이 없으면 썸네일 자리에 `primary-surface` 배경과 토마토 아이콘(작게)을 둔다.

### 스와이프 동작 (`SwipeRow`)
- 목록의 레시피 카드를 왼쪽으로 밀면 카드 오른쪽에 동작 버튼이 드러난다. 지금은 "삭제" 하나만 두고, 동작 목록은 배열로 받아 나중에 "즐겨찾기" 같은 버튼을 같은 자리에 추가할 수 있게 한다.
- 버튼은 하나당 72px 칸을 차지하고, 그 가운데에 48px 동그라미 버튼을 둔다. 카드와 붙지 않고 12px 떨어져 보인다. 손을 뗄 때 칸 너비의 절반을 넘게 밀었으면 열린 채로 멈추고, 아니면 닫힌다. 판정 로직(`isHorizontalSwipe`, `clampOffset`, `resolveSwipe`)은 `lib/swipe.ts`의 순수 함수로 분리해 단위 테스트한다.
- 가로 이동이 세로보다 크고 8px를 넘을 때만 스와이프로 본다. 세로 스크롤은 막지 않는다(`touch-action: pan-y`).
- 한 번에 한 카드만 열린다. 다른 카드를 밀거나, 열린 카드를 탭하거나, 목록을 스크롤하면 닫힌다. 열린 카드를 탭하면 상세로 가지 않고 닫기만 한다. 다른 카드가 열려 있는 동안 또 다른 카드를 탭하면(밀지 않아도) 그 카드로 바로 이동하지 않고 열려 있던 카드부터 닫는다(iOS 관례).
- 완전히 닫혀 있을 때(오프셋 0, 드래그 중 아님, 열고 닫는 전환 중도 아님) 동작 레이어는 `invisible`로 숨긴다. `Card`의 `active:scale-[0.98]`로 카드가 작아질 때 뒤의 동그라미 버튼이 비치는 것을 막기 위해서다. 드래그가 시작되거나, 열려 있거나, 열고 닫는 애니메이션이 끝나기 전까지는 다시 보여준다.
- 동작 톤은 두 가지다: `danger`(`bg-primary` / `text-on-primary`)와 `neutral`(`bg-surface-strong` / `text-body`). 삭제 버튼은 `danger`를 쓴다 — 스와이프 동작은 iOS 관례대로 빨간(브랜드색) 배경을 쓰는 것이 "삭제는 weak 버튼" 원칙의 유일한 예외다. 동그라미 안에는 아이콘(`lucide-react`, 22px, stroke width 2)만 두고, 라벨은 `aria-label`로 준다. 누르면 `scale-95`.
- 닫혀 있을 때 동작 버튼은 `tabIndex={-1}`, `aria-hidden`으로 숨긴다. 키보드·스크린리더 사용자는 상세 화면의 삭제 버튼을 쓴다.
- 동작 영역 배경은 투명(바탕 `canvas`가 보임)이고 클리핑하지 않는다. 바깥 감싸개도 클리핑하지 않아 `Card`의 `shadow-card`가 그대로 보인다.
- `prefers-reduced-motion`이면 전환 없이 즉시 이동한다. 드래그 중이 아닐 때만 `transform` 200ms `ease-out`을 건다.
- 드래그 중에는 React 상태를 바꾸지 않는다. 위치는 ref로 `translate3d`를 DOM에 직접 쓰고(`requestAnimationFrame`으로 프레임당 한 번), 움직이는 동안에만 `will-change`로 합성 레이어에 올렸다가 멈추면 해제한다. 손을 뗄 때만 `onOpenChange`로 열림·닫힘을 알린다.

### 당겨서 초기화 (메뉴추천 화면)
- 메뉴추천 화면에는 [선택 해제] 버튼을 두지 않는다. 화면 맨 위에서 아래로 당기면 제목 아래에 리프레시 아이콘(`RotateCw`, 22px, `muted`)이 나타나고, 당긴 거리만큼 돌다가 기준 거리(72px, 손가락 이동의 절반만 반영)에서 한 바퀴를 채우며 `primary` 색으로 바뀐다. 그 상태에서 손을 떼면 고른 재료·검색어·결과를 초기화하고 "선택을 초기화했어요." 토스트를 띄운다.
- 당기는 동안에는 React 상태를 바꾸지 않고 ref로 높이·회전을 직접 그린다(`usePullToReset`). 이 화면에서는 `html`·`body`에 `overscroll-behavior-y: none`을 걸어 iOS 고무줄 바운스를 꺼서, 당길 때도 상단 제목("오저뭐?")은 고정되고 그 아래 아이콘만 내려온다. 초기화할 것이 없어도 당기는 모션은 똑같이 보여주고, 실제로 지운 것이 있을 때만 토스트를 띄운다.

### 오저뭐 결과 카드 (`PickResultCard`)
- `Card` 안에 대표 사진(4:3, `rounded-control`), 이름(`title-md`), 재료명 칩 줄. 내가 고른 재료는 선택 칩, 나머지는 기본 칩.
- 아래에 `secondary` "다시 뽑기"와 `primary` "레시피 보기"를 가로로 둔다.

### 버튼 (`Button`)
| 변형 | 배경 / 글자 | 쓰임 |
|---|---|---|
| `primary` | `primary` / `on-primary` | 저장하기, 메뉴 추천 뽑기, 삭제 확인 |
| `secondary` | `primary-surface` / `primary-text` | 다시 뽑기, 레시피 보기 |
| `weak` | `surface-strong` / `body` | 삭제, 닫기, 선택 해제 |
| `text` | 투명 / `primary-text` | 보조 링크성 동작 |

- 높이 52px, `rounded-control`, 글자 `button`. 화면 하단 버튼은 좌우 꽉 채운다.
- 누름: `primary`는 `primary-pressed`, 나머지는 밝기 -4%. 비활성: `primary`는 `primary-disabled`, 나머지는 opacity 40%.

### FAB (새 레시피)
- 56×56, `rounded-pill`, `bg-primary`, `shadow-floating`, 흰 + 아이콘 28px.
- 오른쪽 16px, 탭 바 위 16px. `aria-label="새 레시피 만들기"`.

### 아이콘 버튼
- 44×44, `rounded-pill`, 아이콘 22px `muted`. 누름·hover 시 `surface-soft` 배경. `aria-label` 필수.
- 아이콘은 `lucide-react`, stroke width 2 하나로 통일한다.

### 입력 (`TextField`, `TextArea`)
- 배경 `surface-soft`, 테두리 1px `hairline`, `rounded-control`, 안쪽 여백 14px 16px, 글자 `body-lg`.
- focus: 배경 `surface-card`, 테두리 1.5px `primary`.
- 오류: 입력 아래 `caption`으로 문구를 둔다. 테두리 색은 바꾸지 않는다(브랜드 색이 빨강이라 구분되지 않음). 문구 앞에 경고 아이콘을 붙인다.
- 검색창: 높이 48px, 왼쪽 돋보기 아이콘, 입력이 있으면 오른쪽에 지우기 아이콘 버튼.

### 칩 (`Chip`)
- `rounded-pill`, 여백 6px 14px, 글자 `caption-strong`.
- 기본: `surface-strong` / `body`. 선택: `primary-surface` / `primary-text`.
- 칩은 오저뭐 재료 고르기, 오저뭐 결과 카드, 재료 자동완성 제안, 상세 화면 재료에 쓴다. 목록 카드의 재료 요약은 칩 없이 텍스트로 둔다.
- 상세 재료용 큰 칩(`IngredientChip`)은 `Chip`과 다른 전용 컴포넌트다: `rounded-pill`, `bg-surface-strong`, 여백 가로 14px · 세로 8px(`py-2`). 재료명은 `body-strong` `ink`, 양은 이어서 `body-md` `body-soft`로 적되 양이 없으면 생략한다. 선택 상태는 없다.

### 재료 입력 (`IngredientInput`)
- `TextArea` 하나(최소 4줄). 재료는 한 줄에 하나씩 적는다. placeholder: `Enter로 줄을 바꿔 한 줄에 하나씩 적어 주세요` / `대파 1대` / `[양념장]` / `간장 3큰술`(줄바꿈으로 구분, 대괄호 줄은 재료 대분류 제목 예시).
- 바로 위에 자동완성 제안 칩 줄(가로 스크롤). 제안이 없으면 줄을 숨긴다.
- 바로 아래(12px 간격) 파싱 미리보기: 상세 화면과 같은 `IngredientGroups`(분류 제목 + `IngredientChip` 줄)를 카드 없이 둔다. 재료가 없으면 숨긴다.

### 재료 목록 (상세 화면)
- `Card` 안에 `IngredientGroups`를 둔다(작성 화면 미리보기와 같은 컴포넌트). 분류 없는 재료의 `IngredientChip`을 먼저 놓고, 이어서 분류마다 작은 제목(`body-strong`, `body-soft`)과 그 분류의 칩 줄을 둔다. 분류가 하나도 없으면 지금처럼 칩 한 줄만 보인다.
- 칩은 가로로 나열하고 넘치면 줄바꿈한다(`flex flex-wrap gap-2`).

### 단계 목록 (`StepList`)
- 보기: 번호 원(24px, `primary-surface` 배경, `primary-text` 숫자, `caption-strong`) + 설명(`body-lg`, `body`). 단계 사이 20px.
- 편집: 번호 + `TextArea` + 오른쪽 아이콘 버튼(위로, 아래로, 삭제). 맨 아래 `secondary` 버튼 "단계 추가하기".
- 단계 칸에서 Enter는 줄바꿈이다. 하드웨어 키보드의 Cmd+Enter(Windows는 Ctrl+Enter)는 지금 단계 바로 뒤에 빈 단계를 넣고 그 칸으로 포커스를 옮긴다. 한글 조합 중에는 무시한다.

### 사진
- 상세 대표 사진: 화면 폭 - 32px, 비율 4:3, `rounded-card`, `object-cover`.
- 사진 선택 칸(편집): 같은 크기의 `surface-soft` 영역 + 가운데 카메라 아이콘과 "사진 추가하기". 사진이 있으면 오른쪽 위에 "바꾸기", "빼기" 아이콘 버튼.

### 다이얼로그 (`Dialog`)
- `surface-card`, `rounded-card`, `shadow-floating`, 여백 24px. 바깥은 `rgba(0,0,0,0.4)`.
- 제목 `title-md`, 설명 `body-md` `body-soft`. 버튼 두 개 가로 배치: 왼쪽 `weak` "닫기", 오른쪽 `primary`.

### 토스트 (`Toast`)
- 화면 아래 가운데, `ink` 배경 흰 글자 `body-md`, `rounded-control`, `shadow-floating`, 2.5초 뒤 사라짐.
- 하단 여백은 화면에 따라 다르다(`ToastProvider`의 `withTabBar`로 구분).
  - 탭 바가 있는 화면: `calc(56px + env(safe-area-inset-bottom) + 88px)`. FAB(탭 바 위 16px, 56px 높이) 위에 16px 간격을 두고 뜬다.
  - 탭 바가 없는 화면(편집 화면): `calc(env(safe-area-inset-bottom) + 92px)`. 하단 고정 저장 버튼(52px 버튼 + 위 12px + 아래 12px 패딩) 위에 16px 간격을 두고 뜬다.

### 빈 상태 (`EmptyState`)
- 가운데 토마토 일러스트(80px) + 문구(`body-md`, `body-soft`) + 필요하면 `secondary` 버튼.

### 경고 배너
- `warning-surface` 배경, `warning-text` 글자 `body-md`, `rounded-control`, 여백 14px 16px. 설정 화면의 "홈 화면에 추가해 주세요", "마지막 백업이 30일 넘었어요"에 쓴다.

## 7. 모션

- 기본 전환 150~200ms `ease-out`. transform과 opacity만 바꾼다.
- 오저뭐 결과 카드: 나타날 때 아래에서 8px 올라오며 페이드(200ms). 다시 뽑기도 같은 모션.
- `prefers-reduced-motion`이면 모든 이동 모션을 끄고 페이드만 남긴다.

## 8. 앱 아이콘과 PWA

- 원본: `tomato.png`(1254×1254, 흰 배경 + 크림 그림자).
- 만들 파일: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`(토마토를 가운데 70% 안에 두고 바깥을 흰색으로 채움), `apple-touch-icon.png`(180×180), `favicon.svg` 대신 `favicon-32.png`.
- manifest: `name` "뚜니레시피", `short_name` "뚜니레시피", `theme_color` `#F7F8FA`, `background_color` `#F7F8FA`, `display` `standalone`, `start_url`·`scope` `/ttuni-recipe/`.

## 9. UX 라이팅 (토스 규칙)

- 모든 문구는 해요체. `~시겠어요?` 같은 과한 경어는 쓰지 않는다.
- 능동형·긍정형으로 쓴다. "안 돼요" 대신 "~하면 할 수 있어요".
- 오류는 문제와 해결 방법을 같이 쓴다. 예) "사진을 불러오지 못했어요. 다른 사진을 골라 주세요."
- 다이얼로그 왼쪽 버튼은 "취소"가 아니라 "닫기".
- 버튼은 `~하기`로 끝낸다. 예) "저장하기", "단계 추가하기", "다시 뽑기".
- `되어요` → `돼요`.

### 예시 문구
- 레시피 목록이 비었을 때: "아직 저장한 레시피가 없어요. 첫 레시피를 저장해 보세요."
- 검색 결과 없음: "찾는 레시피가 없어요."
- 오저뭐 재료 미선택: "재료를 1개 이상 골라 주세요."
- 오저뭐 후보 없음: "고른 재료로 만들 수 있는 레시피가 없어요. 다른 재료도 골라 보세요."
- 삭제 확인: 제목 "이 레시피를 삭제할까요?" · 설명 "삭제하면 되돌릴 수 없어요." · 왼쪽 "닫기" · 오른쪽 "삭제하기"
- 저장하지 않고 나가기: 제목 "수정한 내용을 저장하지 않고 나갈까요?" · 왼쪽 "닫기" · 오른쪽 "나가기"
- 백업 완료: "백업 파일을 만들었어요."
- 불러오기 완료: "새로 12개, 바뀐 3개를 불러왔어요."
