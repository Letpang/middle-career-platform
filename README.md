# 커리어 브릿지 (중장년 재취업 지원 플랫폼)

React + Vite 화면과 Cloudflare Worker API, Cloudflare D1 데이터베이스로 구성됩니다.

- 화면: `src/` (페이지는 `src/pages`, 링크·센터 정보는 `src/data/links.ts`)
- 서버: `worker/` (고용24 연동 `work24.ts`, 로그인 `auth.ts`, API 라우터 `index.ts`)
- DB 구조: `migrations/0001_init.sql`

## 주요 화면

| 주소 | 내용 |
|---|---|
| `/jobs` | 고용24 채용정보 (지역+키워드 동시 검색, 직종·조건 필터, 상세 조건 펼치기), 채용행사 달력, 외부 채용사이트 |
| `/education` | 기관이 등록한 교육과정 (지역·비용·방식 비교, 수료 후 연계 일자리), 지역 교육기관 링크 |
| `/counseling` | 방문·전화 상담 신청 (전화상담은 프로필 경력 작성 필요), 신청 내용은 관리자 화면으로 접수 |
| `/profile` | 이 기기에만 저장되는 프로필·이력서 파일, 희망 직종·지역 기반 추천 |
| `/org` | 교육기관 계정 신청·로그인, 교육과정·채용행사 등록/수정 |
| `/admin` | 센터 관리자: 기관 승인, 상담 신청 확인, 등록 항목 공개 관리 |

## 처음 설정 (한 번만)

Node.js 20 이상이 필요합니다.

```bash
npm install
npx wrangler login
npx wrangler d1 create career-bridge-db
```

마지막 명령이 출력한 `database_id`를 `wrangler.jsonc`의 `REPLACE_WITH_DATABASE_ID` 자리에 붙여넣습니다.

```bash
npm run db:migrate
npx wrangler secret list
```

`secret list`에 고용24 인증키가 이미 있는지 확인합니다. 서버는 `WORK24_API_KEY`, `WORKNET_API_KEY`, `API_KEY` 등 흔히 쓰는 이름을 모두 찾아보므로 기존 비밀값이 있으면 그대로 쓰입니다. 없으면 등록합니다.

```bash
npx wrangler secret put WORK24_API_KEY
npx wrangler secret put ADMIN_PASSWORD
```

## 로컬에서 실행

`.dev.vars.example`을 `.dev.vars`로 복사해 값을 채운 뒤:

```bash
npm run db:migrate:local
npm run dev
```

## 배포

```bash
npm run deploy
```

## 운영 방법

1. 기관 담당자가 `/org`에서 계정을 신청합니다.
2. 센터 담당자가 `/admin`에서 관리자 비밀번호로 로그인해 승인합니다.
3. 승인된 기관은 `/org`에서 교육과정·채용행사를 등록하고, 등록 즉시 교육 페이지와 채용행사 달력에 표시됩니다.
4. 상담 신청은 `/admin`의 "상담 신청" 탭에서 센터별로 확인하고 상태(새 신청 → 연락 완료 → 상담 완료)를 바꿉니다.
