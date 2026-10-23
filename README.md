# 뚜니레시피

나만 쓰는 레시피 저장 앱. 레시피와 사진은 내 브라우저(IndexedDB)에만 저장되고, 서버로 보내지 않습니다.

- 앱: https://h4ppybee.github.io/ttuni-recipe/ (iPhone Safari에서 열고 "홈 화면에 추가"로 앱처럼 사용)
- 레시피 저장(사진, 재료, 만드는 방법, 메모), 이름·재료 검색
- 메뉴추천: 가진 재료를 고르면 레시피를 랜덤으로 추천
- 백업: 설정에서 JSON 파일로 내보내고 불러오기

## 재료 입력 방법

한 줄에 재료 하나씩 적습니다. 대괄호 줄로 분류를 나눌 수 있습니다.

```
돼지고기 300g
양파 1개
[양념장]
고추장 2큰술
간장 1큰술
```

## 개발

```bash
pnpm install
pnpm dev      # http://localhost:5173/ttuni-recipe/
pnpm test
pnpm build
```

`main`에 push하면 GitHub Actions가 테스트·빌드 후 GitHub Pages에 배포합니다. 구조와 규칙은 [CLAUDE.md](./CLAUDE.md), 디자인 시스템은 [DESIGN.md](./DESIGN.md)를 참고하세요.
