# **마크다운 파일의 메타 데이터 생성**

[English](https://typhoon-kim.github.io/generate-metadata-of-markdown/) | 한국어

[![npm 버전](https://badgen.net/npm/v/@typh007/markdown-metadata)](https://www.npmjs.com/package/@typh007/markdown-metadata)
[![다운로드](https://badgen.net/npm/dt/@typh007/markdown-metadata)](https://www.npmjs.com/package/@typh007/markdown-metadata)
[![jsDeliver](https://data.jsdelivr.com/v1/package/npm/@typh007/markdown-metadata/badge)](https://www.jsdelivr.com/package/npm/@typh007/markdown-metadata)

이 패키지는 디렉토리를 순회하여 `markdown` 파일에 대한 메타데이터 `JSON`파일을 생성합니다.

이 패키지는 개인 프로젝트에 적용하기 위한 목적으로 만들어졌습니다. [publish-markdown-notebook](https://github.com/typhoon-kim/publish-markdown-notes)
조금 더 다양하게 활용할 수 있도록 확장성을 갖출 예정입니다. 어떤 의견이 있으시면 말씀해주세요. 😉

## 설치

```bash
npm i @typh007/markdown-metadata
```

## 사용법

```javascript
import { generateNoteList } from "@typh007/markdown-metadata";

// 사용 예시
const publishPath = "마크다운 파일이 있는 디렉토리 경로";
generateNoteList(publishPath);
```

`publishPath`에는 `문자열 배열` 또는 `문자열`이 올 수 있습니다.

```javascript
const publishPath = [
    "경로1",
    "경로2"
];

const publishPaht = "경로";
```

`generateNoteList`에 두 번째 인자인 `withOutRoot`를 명시하여 `note_list`의 파일 경로에서 루트 경로를 포함히지 않을 수 있습니다.

```javascript
import { generateNoteList } from "@typh007/markdown-metadata";

// 사용 예시
const publishPath = "마크다운 파일이 있는 디렉토리 경로";
generateNoteList(publishPath, withOutRoot); // true or false -- default: false
```

## 결과

`generateNoteList`함수를 호출하면 기본적으로 `./data`경로에 `note_list.json`, `link_list.json`, `note_list.json`, `tag_list.json` 파일이 생성됩니다.


파일 생성 경로를 수정하려면 `setDataRoot`함수에 경로를 설정하세요.

```javascript
import { generateNoteList, setDataRoot } from "@typh007/markdown-metadata";

setDataRoot("export path");
generateNoteList("target path");
```

`note_list.json`은 노트별 정보를 담고 있습니다. 다음 항목을 포함합니다.

- id: 노트의 MD5 해시 정보
- title: 노트의 이름(파일명)
- route: 노트의 경로(파일경로)
- created: 노트의 생성일시
- updated: 노트의 수정일시
- outline: 노트의 아웃라인 🆕
- tags: 노트가 포함한 태그목록
- links: 노트가 포함한 하이퍼링크
- summary: 300자 이내 문서 요약
- images: 문서 내 이미지 경로

`link_list.json`은 모든 노트들의 옵시디언 백링크 항목을 가지고 있습니다. 다음 항목을 포함합니다.

- from: 노트의 MD5 해시 정보
- type: "obsidian"
- alias: 노트 별칭
- url: 노트의 경로

`tag_list.json`은 모든 파일의 마크다운 태그 목록을 가지고 있습니다.

## 🔭 향후 기능 추가

- [ ] **해시 체크섬을 비교하여 추가, 변경된 노트의 정보만 반영**
- [ ] **예제 생성**
- [ ] **스크립트 생성**
- [ ] **CommonJS, TypeScript d.ts**

## 🤝 기여

컨트리뷰션 요청이 있다면 환영합니다!

## 📝 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

---

*추가적인 질문이나 지원이 필요한 경우 언제든지 문의 주세요!*