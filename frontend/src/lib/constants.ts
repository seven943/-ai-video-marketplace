// 分页
export const DEFAULT_PAGE_SIZE = 20;

// 预算区间
export const PRICE_RANGES = [
  { label: '全部', min: undefined, max: undefined },
  { label: '500以下', min: 0, max: 500 },
  { label: '500-2000', min: 500, max: 2000 },
  { label: '2000-5000', min: 2000, max: 5000 },
  { label: '5000-10000', min: 5000, max: 10000 },
  { label: '10000以上', min: 10000, max: undefined },
];

// 视频标签
export const TAG_OPTIONS = [
  '商品展示', '品牌宣传', '短视频', '解说视频', '社交媒体', '教育培训', '娱乐创意',
  '产品评测', '直播切片', '动画制作', '特效合成', '口播视频',
];

// AI 工具
export const AI_TOOL_OPTIONS = [
  'Kling', 'Runway', 'Flux', 'Pika', 'Sora', 'HeyGen', 'Synthesia',
  'D-ID', 'CapCut', 'Stable Diffusion', 'Midjourney', 'ComfyUI',
];
