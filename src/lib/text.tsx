import { Fragment, type ReactNode } from 'react';

const PHONE = /(\d{2,4}-\d{3,4}(?:-\d{4})?)/;

// 문장 속 전화번호(031-901-9197, 1588-2282 등)가 폰 화면에서 하이픈 기준으로 끊기지 않게 한 덩어리로 묶습니다.
export function keepPhones(text: string): ReactNode {
  const parts = text.split(PHONE);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
