// 카테고리마다 구분되는 색. 색은 카테고리 id 로 정해서(DB 변경 없음) 칩과 카드 태그가
// 항상 같은 색을 쓴다. Tailwind 가 클래스를 찾을 수 있도록 전체 이름을 그대로 적는다.
// 인디고는 앱 강조색(버튼·포커스)이라 팔레트에서 뺐다.
const PALETTE = [
  {
    tag: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    chip: "border-sky-200 hover:bg-sky-200 dark:border-sky-900 dark:hover:bg-sky-900",
    on: "bg-sky-600 text-white",
  },
  {
    tag: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    chip: "border-emerald-200 hover:bg-emerald-200 dark:border-emerald-900 dark:hover:bg-emerald-900",
    on: "bg-emerald-600 text-white",
  },
  {
    tag: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
    chip: "border-amber-200 hover:bg-amber-200 dark:border-amber-900 dark:hover:bg-amber-900",
    on: "bg-amber-600 text-white",
  },
  {
    tag: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    chip: "border-rose-200 hover:bg-rose-200 dark:border-rose-900 dark:hover:bg-rose-900",
    on: "bg-rose-600 text-white",
  },
  {
    tag: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    chip: "border-violet-200 hover:bg-violet-200 dark:border-violet-900 dark:hover:bg-violet-900",
    on: "bg-violet-600 text-white",
  },
  {
    tag: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    chip: "border-teal-200 hover:bg-teal-200 dark:border-teal-900 dark:hover:bg-teal-900",
    on: "bg-teal-600 text-white",
  },
  {
    tag: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    chip: "border-orange-200 hover:bg-orange-200 dark:border-orange-900 dark:hover:bg-orange-900",
    on: "bg-orange-600 text-white",
  },
  {
    tag: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    chip: "border-fuchsia-200 hover:bg-fuchsia-200 dark:border-fuchsia-900 dark:hover:bg-fuchsia-900",
    on: "bg-fuchsia-600 text-white",
  },
];

export function categoryColor(categoryId: number) {
  return PALETTE[categoryId % PALETTE.length];
}
