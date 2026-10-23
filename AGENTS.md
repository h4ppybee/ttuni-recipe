# 뚜니레시피 (ttuni-recipe)

혼자 폰 한 대로 쓰는 로컬 퍼스트 레시피 PWA. 서버·로그인 없이 브라우저 IndexedDB에만 저장하고, GitHub Pages(`https://h4ppybee.github.io/ttuni-recipe/`)로 배포한다. 주 사용 환경은 iPhone Safari와 홈 화면 PWA다.

작업을 시작하기 전에 이 파일과 `DESIGN.md`를 읽는다. UI를 만들거나 고칠 때는 `DESIGN.md`가 기준이다. 이 저장소에서 `CLAUDE.md`와 `AGENTS.md`는 같은 내용을 유지한다(한쪽을 고치면 다른 쪽도 같이 고친다).

## 기능

- **레시피 저장**: 이름, 대표 사진 1장, 재료(이름+양, 분류 가능), 단계 목록, 메모(URL 자동 링크)
- **검색**: 레시피 이름·재료명으로 검색(양·단계·메모·분류 이름은 검색 대상이 아님)
- **메뉴추천(오저뭐?)**: 가진 재료를 고르면 그 재료가 하나라도 들어간 레시피 중 하나를 랜덤으로 추천. 맨 위에서 당기면 선택 초기화
- **백업**: 레시피와 사진을 JSON 파일 하나로 내보내고, 불러올 때 덮어쓰지 않고 병합
- **목록 스와이프**: 카드를 왼쪽으로 밀면 오른쪽에서 동그라미 버튼(즐겨찾기 별, 삭제)이 들어옴(동작 배열 구조)
- **즐겨찾기**: 스와이프 별이나 상세 상단 바 별로 켜고 끔. 목록 위쪽 "즐겨찾기" 묶음 + 아래 "전체" 묶음(검색 중에도 같은 규칙)

## 기술 스택과 명령

| 구분 | 사용 |
|---|---|
| 빌드 | Vite, React 19, TypeScript, pnpm(10.12.4 고정) |
| 라우팅 | react-router 8.5, `createHashRouter`(GitHub Pages 새로고침 404 방지) |
| 저장소 | Dexie 4 + dexie-react-hooks(`useLiveQuery`) |
| 스타일 | Tailwind CSS v4 `@theme` 토큰(`src/styles/theme.css`), lucide-react, Pretendard(npm) |
| PWA | vite-plugin-pwa(autoUpdate, 폰트는 런타임 캐시) |
| 테스트 | Vitest(environment node) + fake-indexeddb |
| 린트 | oxlint (경고 0 유지) |
| 배포 | GitHub Actions → Pages (`.github/workflows/deploy.yml`, `main` push 시 test → build → deploy) |

```bash
pnpm dev        # 개발 서버 (base: /ttuni-recipe/)
pnpm test       # Vitest 전체
pnpm lint       # oxlint
pnpm build      # tsc -b && vite build
pnpm preview    # 빌드 결과 미리보기
```

변경을 마칠 때는 `pnpm exec tsc -b`, `pnpm test`, `pnpm lint`, `pnpm build`를 모두 통과시킨다.

## 폴더 구조

```
src/
  main.tsx, app/router.tsx         진입점, hash 라우터(errorElement = RouteError)
  types.ts                         Ingredient{name, amount, group?}, Recipe{…, favorite?: true}, Photo, RecipeDraft
  styles/theme.css                 Tailwind v4 토큰(색·radius·shadow·text). 기본 스케일은 지움
  db/
    schema.ts                      Dexie: recipes 'id, *ingredientNames, updatedAt', photos 'id'
    recipeRepo.ts                  저장(사진 keep/remove/replace 한 트랜잭션, 즐겨찾기 유지), setFavorite, 삭제, 조회, 재료명 목록, 후보, dataSize
    backup.ts                      JSON 백업 만들기·병합 불러오기, backupService(기본 db 래퍼)
  lib/                             순수 함수(대부분 단위 테스트 있음)
    parseIngredients.ts            재료 텍스트 ↔ 배열. 줄바꿈 구분, [분류] 제목 줄, groupIngredients
    ingredientCaret.ts             커서 위치 줄, 자동완성 제안·치환
    normalizeIngredients.ts        공백 정리, 빈 재료 제거, ingredientNames 계산
    search.ts, pickRandom.ts, linkify.ts, validateDraft.ts
    backupFormat.ts                백업 형식 검사(validateBackup), 병합 계획(planMerge)
    swipe.ts, pull.ts              스와이프·당겨서 초기화 판정
    favorites.ts                   목록을 즐겨찾기/나머지로 나누기(splitFavorites)
    reorder.ts                     단계 드래그 순서 변경(놓일 자리, 비킬 거리, 범위 제한, 가장자리 자동 스크롤 속도)
    image.ts, deliverFile.ts, prefs.ts, history.ts, dataUrl.ts, date.ts, errors.ts, cx.ts
    steps.ts                       단계 키, 다음 단계 삽입, Cmd/Ctrl+Enter 판정
  hooks/                           useToggleFavorite(토글+토스트), useDebouncedValue, usePhotoUrl/useBlobUrl, usePullToReset, usePrefersReducedMotion
  components/
    ui/                            Card, Button, IconButton, Chip, TextField, TextArea, Dialog, Toast(+toastContext), EmptyState, Banner, TopBar, Fab
    AppShell, TabBar, RecipeCard, RecipeThumb, IngredientInput, IngredientChip, IngredientGroups, StepEditor, PhotoPicker, PickResultCard, LinkifiedText, SwipeRow, RouteError
  pages/                           RecipeListPage, RecipeDetailPage, RecipeEditPage, PickPage, SettingsPage
  test/                            setup(fake-indexeddb), fixtures(makeRecipe), designTokens.test.ts
scripts/make-icons.py              tomato.png → public/ PWA 아이콘 5종 (Pillow)
```

라우트: `#/` 목록, `#/recipes/new`, `#/recipes/:id`, `#/recipes/:id/edit`, `#/pick` 메뉴추천, `#/settings`. 하단 탭은 `/`, `/pick`, `/settings`에서만 보인다.

## 데이터 규칙

- 재료 입력은 텍스트 칸 하나, **한 줄에 재료 하나**. 쉼표는 구분자가 아니라 그 줄의 내용이다(`물 1,000ml`).
- 양 분리: 첫 글자를 뺀 나머지에서 처음 나오는 숫자부터 끝까지가 양. 숫자가 없으면 마지막 단어가 `약간`·`적당량`·`한…`·`반…` 등이면 양.
- `[양념장]`처럼 대괄호만 있는 줄은 분류 제목. 그 아래 재료에 `group`이 붙는다. 분류 없음은 `group` 필드를 두지 않는다(예전 데이터·백업과 호환).
- `ingredientNames`는 저장할 때 `ingredients`에서 계산하는 검색·추천용 필드다. 백업을 불러올 때도 파일 값을 믿지 않고 다시 계산한다.
- 백업 형식: `{ app: 'ttuni-recipe', version: 1, exportedAt, recipes, photos[{id, full, thumb(data URL)}] }`. 병합 규칙은 `updatedAt`이 더 최근이면 갱신, 같거나 오래되면 그대로.
- 사진은 긴 변 1280px(full)·320px(thumb) JPEG로 줄여 `photos` 테이블에 따로 둔다.
- 즐겨찾기는 `favorite: true`, 아니면 필드를 두지 않는다. 켜고 꺼도 `updatedAt`은 바꾸지 않는다(목록이 최근 수정순이라 카드가 튀지 않게). 그래서 백업 병합에서 즐겨찾기만 바꾼 변경은 "더 최근"으로 치지 않는다. 백업 `toRecipe`는 필드를 골라 새로 만들므로 `favorite`을 꼭 옮겨 담는다.

## 반드시 지킬 것

1. **IndexedDB 커서를 쓰지 않는다.** iOS Safari에서 `orderBy().uniqueKeys()`·`where().anyOf()` 같은 인덱스 커서가 `UnknownError: Unable to open cursor`로 실패해 화면이 멈춘 적이 있다. `toArray()`(getAll)로 읽고 메모리에서 계산한다. `recipeRepo.test.ts`에 커서 미사용 테스트가 있다.
2. **Dexie 트랜잭션 안에서는 DB 작업만 한다.** 사진 변환, data URL ↔ Blob 변환처럼 Dexie가 아닌 await는 트랜잭션 전에 끝낸다.
3. **UI는 `recipeRepo`·`backupService`만 부르고 Dexie(`db`)를 직접 쓰지 않는다.**
4. **디자인 토큰만 쓴다.** `rounded-[..]`, Tailwind 기본 radius·shadow 이름, `#hex` 색, `bg/text/border-[#..]`를 컴포넌트에 쓰지 않는다. `shadow-card`는 `components/ui/Card.tsx`에서만 쓴다. `src/test/designTokens.test.ts`가 검사한다.
5. **제스처는 React 렌더 없이 그린다.** `SwipeRow`·`usePullToReset`·`StepEditor`(단계 드래그)는 드래그 중 ref로 DOM 스타일을 직접 쓰고(rAF로 프레임당 한 번), 움직이는 동안만 `will-change`를 켠다. setState는 손을 뗄 때만.
6. **코드 스타일**: if/else 본문은 한 줄이어도 중괄호, 중첩 if 대신 early return. 컴포넌트 파일에서 컴포넌트 외 값을 export하지 않는다(oxlint `only-export-components`) — 헬퍼·타입은 `src/lib`로.
7. **문구**: 토스 UX 라이팅(해요체, 다이얼로그 왼쪽 버튼은 "닫기", 버튼은 "~하기"). 예시는 `DESIGN.md` 9절.
8. iOS 대응: 상단 바 safe-area는 바깥 패딩 + 안쪽 56px 줄로 분리, 추천 칩을 누를 때 `flushSync` 후 같은 핸들러에서 focus(키보드 유지), 백업 내려받기 object URL은 60초 뒤 해제, `navigator.share`는 탭 직후에만 호출(만들기 → 공유하기 2단계).

## 개발 환경 주의

- 홈 디렉터리의 `package.json`이 yarn을 지정하고 있어 저장소 밖에서는 pnpm이 막힌다. 저장소 안에서는 정상 동작한다(필요하면 `COREPACK_ENABLE_STRICT=0`).
- 개발·미리보기 서버를 띄웠으면 **자기 PID만** 종료한다. `pkill -f vite`는 다른 프로젝트의 dev 서버까지 죽인다.
- 브라우저 확인은 Playwright WebKit(모바일 뷰포트, `hasTouch`)로 `pnpm preview` 결과를 열어 한다. 이 WebKit에는 `Touch` 생성자가 없어 터치 이벤트는 `Event`에 `touches`를 정의해 보내고, 포인터 제스처는 `PointerEvent`(pointerType `touch`)를 프레임마다 dispatch한다.
- 서비스 워커가 페이지를 자동 새로고침하지 않으므로, 배포 후 기기에서는 앱을 완전히 종료했다가 다시 열어야 새 버전이 보인다.
- 커밋 작성자 이메일은 GitHub noreply(`62532316+h4ppybee@users.noreply.github.com`)로 저장소 로컬 설정에 지정돼 있다. 바꾸지 않는다.

## 주요 결정 기록

| 날짜 | 결정 | 이유 |
|---|---|---|
| 2026-10-22 | 로컬 전용(IndexedDB), 서버 없음 | 혼자 폰 한 대로 쓰는 앱. 데이터 보호는 JSON 백업으로 |
| 2026-10-22 | Vite + React + Dexie, hash 라우팅, GitHub Pages | 익숙한 스택, 정적 호스팅에서 새로고침 404 방지 |
| 2026-10-22 | 토스 스타일, 브랜드 색 토마토 레드 `#E5533A`, 캔버스 `#F7F8FA` | 앱 아이콘(토마토)과 맞춤. radius 3종·shadow 2종만 허용 |
| 2026-10-22 | 메뉴추천은 고른 재료가 하나라도 들어간 레시피 중 균등 랜덤 | 사용자 선택 |
| 2026-10-22 | 인덱스 커서 대신 getAll | iOS Safari `Unable to open cursor` 오류 |
| 2026-10-23 | 재료 구분을 쉼표 → 줄바꿈 | 사용자 요청. 쉼표가 든 양(1,000ml)과 충돌 없음 |
| 2026-10-23 | 재료 분류는 텍스트 안 `[분류]` 제목 줄 | 입력 칸 하나 유지, 붙여넣기·향후 LLM 정리와 호환 |
| 2026-10-23 | 상세 재료는 알약 칩으로 가로 나열 | 사용자 요청 |
| 2026-10-23 | 목록 스와이프 삭제(동그라미 버튼, 오른쪽에서 진입) | 사용자 요청. 나중에 즐겨찾기 추가 예정 |
| 2026-10-23 | 메뉴추천: 탭 이름 "메뉴추천"(요술봉), 제목 "오저뭐?", [선택 해제] 대신 당겨서 초기화 | 사용자 요청 |
| 2026-10-23 | 설정의 저장 공간은 레시피 데이터(내용+사진)만 표시 | 브라우저 전체 사용량은 앱 파일·폰트 캐시가 대부분이라 혼동 |
| 2026-10-23 | 작성 화면 재료 미리보기도 상세와 같은 칩(`IngredientGroups` 공유) | 사용자 요청. 입력은 텍스트 칸 유지 |
| 2026-10-23 | 단계 칸 Enter는 줄바꿈, Cmd/Ctrl+Enter는 다음 단계 추가·포커스 | 사용자 요청. iPhone 키보드엔 Cmd가 없어 Enter를 줄바꿈으로 둠 |
| 2026-10-23 | 즐겨찾기: `favorite?: true`, 목록 위 묶음, 스와이프·상세 별로 토글, `updatedAt` 유지 | 사용자 요청(묶음 방식·토글 위치 선택) |
| 2026-10-23 | 단계 편집 버튼을 손잡이+X로 줄이고 손잡이 드래그로 순서 변경(라이브러리 없이 직접 구현) | 사용자 요청. 스와이프와 같은 ref+rAF 방식으로 맞춤, 키보드는 손잡이에서 ↑/↓. 화면 가장자리에서 자동 스크롤(하단 바는 `data-bottom-bar`로 찾음) |

## 다음에 할 수 있는 일

- 2차: 캡처·글 붙여넣기를 LLM이 이 앱 형식(분류 제목 줄 포함)으로 정리 → 편집 화면에 미리 채움(API 키는 Cloudflare Worker 등 서버 쪽에만)
- Face ID 잠금(WebAuthn) 검토
- 사진 없는 썸네일의 토마토 아이콘에 흰 배경이 보이는 문제(투명 아이콘 별도 생성)
