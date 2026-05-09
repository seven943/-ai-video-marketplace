import { PrismaClient, VideoCategory, UserRole, CreatorStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 清理旧数据
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.work.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  // ========== 买家 ==========
  const buyer1 = await prisma.user.create({
    data: { phone: '13800000001', nickname: '电商小王', role: UserRole.BUYER },
  });
  const buyer2 = await prisma.user.create({
    data: { phone: '13800000003', nickname: '茶饮老板', role: UserRole.BUYER },
  });
  const buyer3 = await prisma.user.create({
    data: { phone: '13800000004', nickname: '美妆品牌', role: UserRole.BUYER },
  });

  // ========== 管理员 ==========
  const admin = await prisma.user.create({
    data: { phone: '13800000000', nickname: '平台管理员', role: UserRole.ADMIN },
  });

  // ========== 创作者 ==========
  const creator1 = await prisma.user.create({
    data: {
      phone: '13800000002', nickname: 'AI视频达人', role: UserRole.CREATOR,
      creatorProfile: {
        create: {
          bio: '专注AI视频创作3年，擅长商品展示和品牌宣传视频。曾服务过50+品牌客户。',
          tags: ['商品展示', '品牌宣传', '短视频'],
          aiTools: ['Kling', 'Runway', 'Flux'],
          priceMin: 100, priceMax: 2000,
          status: CreatorStatus.ONLINE, rating: 4.9, orderCount: 128,
        },
      },
    },
  });

  const creator2 = await prisma.user.create({
    data: {
      phone: '13800000005', nickname: '创意工坊Studio', role: UserRole.CREATOR,
      creatorProfile: {
        create: {
          bio: '4A广告公司出身，擅长品牌视觉和创意短视频制作。风格多变，执行力强。',
          tags: ['品牌宣传', '短视频', '社交媒体'],
          aiTools: ['Sora', 'Midjourney', 'ComfyUI'],
          priceMin: 200, priceMax: 5000,
          status: CreatorStatus.ONLINE, rating: 4.8, orderCount: 86,
        },
      },
    },
  });

  const creator3 = await prisma.user.create({
    data: {
      phone: '13800000006', nickname: '影视后期老张', role: UserRole.CREATOR,
      creatorProfile: {
        create: {
          bio: '10年影视后期经验，转型AI视频制作。擅长解说视频、教育课程和企业宣传片。',
          tags: ['解说视频', '教育培训', '品牌宣传'],
          aiTools: ['Runway', 'Pika', 'Stable Diffusion'],
          priceMin: 150, priceMax: 3000,
          status: CreatorStatus.BUSY, rating: 4.7, orderCount: 203,
        },
      },
    },
  });

  // ========== 作品 ==========
  const videoPool = [
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
    'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
  ];

  const works = [
    {
      creatorId: creator1.id,
      title: '高端护肤品AI展示视频 — 水光肌质感',
      coverUrl: 'https://picsum.photos/seed/skincare/640/360',
      videoUrl: videoPool[0],
      category: VideoCategory.PRODUCT,
      tags: ['护肤品', '高端', '产品展示', 'AI生成'],
      viewCount: 12800, likeCount: 890,
    },
    {
      creatorId: creator2.id,
      title: '科技公司品牌宣传片 — 未来城市概念',
      coverUrl: 'https://picsum.photos/seed/techbrand/640/360',
      videoUrl: videoPool[1],
      category: VideoCategory.BRAND,
      tags: ['科技', '品牌', '宣传片', '未来感'],
      viewCount: 23400, likeCount: 1560,
    },
    {
      creatorId: creator1.id,
      title: '美食探店短视频 — 网红咖啡厅',
      coverUrl: 'https://picsum.photos/seed/foodie/640/360',
      videoUrl: videoPool[2],
      category: VideoCategory.SHORT_VIDEO,
      tags: ['美食', '探店', '短视频', '抖音'],
      viewCount: 56000, likeCount: 3200,
    },
    {
      creatorId: creator3.id,
      title: 'SaaS产品功能解说 — 2分钟看懂核心功能',
      coverUrl: 'https://picsum.photos/seed/saas/640/360',
      videoUrl: videoPool[3],
      category: VideoCategory.EXPLAINER,
      tags: ['SaaS', '解说', '产品介绍', '企业'],
      viewCount: 8900, likeCount: 450,
    },
    {
      creatorId: creator2.id,
      title: 'Instagram风格时尚短视频 — 春季穿搭',
      coverUrl: 'https://picsum.photos/seed/fashion/640/360',
      videoUrl: videoPool[4],
      category: VideoCategory.SOCIAL,
      tags: ['Instagram', '时尚', '穿搭', '社交媒体'],
      viewCount: 32000, likeCount: 2100,
    },
    {
      creatorId: creator3.id,
      title: '在线编程课程片头 — Python入门',
      coverUrl: 'https://picsum.photos/seed/coding/640/360',
      videoUrl: videoPool[0],
      category: VideoCategory.EDUCATION,
      tags: ['教育', '编程', 'Python', '课程'],
      viewCount: 15600, likeCount: 980,
    },
    {
      creatorId: creator1.id,
      title: '新能源汽车展示 — 科技与速度的碰撞',
      coverUrl: 'https://picsum.photos/seed/car/640/360',
      videoUrl: videoPool[1],
      category: VideoCategory.PRODUCT,
      tags: ['汽车', '新能源', '产品展示', '科技'],
      viewCount: 45000, likeCount: 3100,
    },
    {
      creatorId: creator2.id,
      title: '咖啡品牌宣传片 — 从豆到杯的旅程',
      coverUrl: 'https://picsum.photos/seed/coffee/640/360',
      videoUrl: videoPool[2],
      category: VideoCategory.BRAND,
      tags: ['咖啡', '品牌', '生活方式', '质感'],
      viewCount: 18700, likeCount: 1200,
    },
    {
      creatorId: creator3.id,
      title: '小红书美妆种草 — 持妆12小时实测',
      coverUrl: 'https://picsum.photos/seed/beauty/640/360',
      videoUrl: videoPool[3],
      category: VideoCategory.SOCIAL,
      tags: ['美妆', '小红书', '种草', '测评'],
      viewCount: 78000, likeCount: 5600,
    },
    {
      creatorId: creator1.id,
      title: '智能家居产品合集 — 让生活更简单',
      coverUrl: 'https://picsum.photos/seed/smarthome/640/360',
      videoUrl: videoPool[4],
      category: VideoCategory.PRODUCT,
      tags: ['智能家居', '产品', '科技', '生活'],
      viewCount: 21000, likeCount: 1400,
    },
    {
      creatorId: creator2.id,
      title: '旅行Vlog — AI生成的梦幻冰岛',
      coverUrl: 'https://picsum.photos/seed/iceland/640/360',
      videoUrl: videoPool[0],
      category: VideoCategory.ENTERTAINMENT,
      tags: ['旅行', 'Vlog', '冰岛', '风景'],
      viewCount: 92000, likeCount: 7800,
    },
    {
      creatorId: creator3.id,
      title: '企业年会开场视频 — 筑梦前行',
      coverUrl: 'https://picsum.photos/seed/corp/640/360',
      videoUrl: videoPool[1],
      category: VideoCategory.BRAND,
      tags: ['企业', '年会', '宣传片', '大气'],
      viewCount: 5600, likeCount: 320,
    },
  ];

  for (const work of works) {
    await prisma.work.create({ data: work });
  }

  // ========== 订单 ==========
  const orders = [
    {
      buyerId: buyer1.id, title: '淘宝店铺商品展示视频',
      description: '需要3个不同角度的商品展示视频，每个15秒，用于淘宝主图视频。产品是护肤品系列，需要高级感。',
      category: VideoCategory.PRODUCT, budgetMin: 200, budgetMax: 500,
      deadline: new Date(Date.now() + 7 * 86400000), status: 'PENDING' as const,
    },
    {
      buyerId: buyer2.id, title: '奶茶店品牌宣传短视频',
      description: '新开的奶茶店需要一条30秒的品牌宣传视频，风格清新年轻化，适合抖音投放。要有制作过程的镜头。',
      category: VideoCategory.BRAND, budgetMin: 500, budgetMax: 1500,
      deadline: new Date(Date.now() + 14 * 86400000), status: 'PENDING' as const,
    },
    {
      buyerId: buyer3.id, title: '小红书美妆种草视频 x5',
      description: '需要5条不同风格的小红书种草短视频，每条15-30秒，产品是春季彩妆系列。需要年轻女性模特效果。',
      category: VideoCategory.SOCIAL, budgetMin: 800, budgetMax: 2000,
      deadline: new Date(Date.now() + 10 * 86400000), creatorId: creator2.id, status: 'IN_PROGRESS' as const,
    },
    {
      buyerId: buyer1.id, title: '在线教育课程片头动画',
      description: 'Python编程课程需要一个10秒的片头动画，科技感风格，包含课程名称"Python从入门到精通"和讲师信息。',
      category: VideoCategory.EDUCATION, budgetMin: 100, budgetMax: 300,
      deadline: new Date(Date.now() + 5 * 86400000), creatorId: creator3.id, status: 'MATCHED' as const,
    },
    {
      buyerId: buyer2.id, title: '产品功能解说视频',
      description: 'SaaS产品需要一条2分钟的功能解说视频，面向企业客户，风格专业简洁。需要屏幕录制+动画结合。',
      category: VideoCategory.EXPLAINER, budgetMin: 1000, budgetMax: 3000,
      deadline: new Date(Date.now() + 21 * 86400000), creatorId: creator1.id, status: 'COMPLETED' as const,
    },
  ];

  for (const order of orders) {
    await prisma.order.create({ data: order });
  }

  console.log('Seed data created successfully!');
  console.log(`  - ${3} buyers`);
  console.log(`  - ${3} creators`);
  console.log(`  - ${works.length} works`);
  console.log(`  - ${orders.length} orders`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
