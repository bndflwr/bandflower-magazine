// Modal 可及性共用工具（inert 方案）。
// 三個 modal（搜尋 overlay / 圖片 lightbox / 手機 TOC sheet）都標了
// aria-modal="true"，但那只是對輔助技術的「宣稱」——瀏覽器不會替自訂 div
// 強制執行，Tab 照樣穿出去聚焦背景內容。這裡用原生 inert 屬性補上執行面：
// 開啟時把 modal 以外的 body 直屬子元素全部 inert（不可聚焦、不可點擊、
// 對輔助技術隱形），焦點自然被困在 modal 內，免手寫「攔 Tab 算首尾」的
// 經典 focus trap；關閉時解除並把焦點還給開啟前的元素。
// 單一 slot：本站 modal 互斥使用，再開新的會先解除前一個（replace 語意）。
// 使用約定：modal 容器需帶 tabindex="-1"（沒傳 initialFocus 時焦點落在容器）。
// Roadmap：日後改用原生 <dialog> + showModal()（trap／焦點還原／top-layer
// 皆內建）時，整個檔案可直接刪除；動畫要配 @starting-style + allow-discrete 重寫。

let inerted: HTMLElement[] = [];
let restoreTo: HTMLElement | null = null;

export function trapModal(
  modal: HTMLElement,
  opts: { keep?: (Element | null)[]; initialFocus?: HTMLElement | null } = {},
): void {
  releaseModal({ returnFocus: false });
  restoreTo =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  // keep：modal 自身之外還要保持互動的元素（如 TOC sheet 的獨立 backdrop——
  // inert 會吃掉它的點擊事件，「點背景關閉」就壞了）。
  const keep = new Set<Element>([
    modal,
    ...(opts.keep ?? []).filter((el): el is Element => !!el),
  ]);
  for (const el of Array.from(document.body.children)) {
    if (!(el instanceof HTMLElement) || keep.has(el) || el.inert) continue;
    el.inert = true;
    inerted.push(el);
  }
  (opts.initialFocus ?? modal).focus();
}

export function releaseModal(opts: { returnFocus?: boolean } = {}): void {
  const { returnFocus = true } = opts;
  for (const el of inerted) el.inert = false;
  inerted = [];
  if (returnFocus) restoreTo?.focus();
  restoreTo = null;
}

// ClientRouter 換頁保險：<header> 是 transition:persist 的，swap 前若不解除
// inert，殘留的 inert header 會讓新頁面的導覽整組不可用。不還焦點（正在換頁）。
document.addEventListener("astro:before-swap", () =>
  releaseModal({ returnFocus: false }),
);
