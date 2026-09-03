import { PrismaClient, Role, SiteStatus, PaymentType, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_CATEGORIES = [
  { name: "AI Agents & Infrastructure", slug: "ai-agents-infrastructure", icon: "Bot", order: 1 },
  { name: "SEO & AI Visibility", slug: "seo-ai-visibility", icon: "Search", order: 2 },
  { name: "Marketing & Advertising", slug: "marketing-advertising", icon: "Megaphone", order: 3 },
  { name: "Crypto, Web3 & Investing", slug: "crypto-web3-investing", icon: "Coins", order: 4 },
  { name: "Developer Tools", slug: "developer-tools", icon: "Code2", order: 5 },
  { name: "Business, Finance & Legal", slug: "business-finance-legal", icon: "Scale", order: 6 },
  { name: "Security, Privacy & Compliance", slug: "security-privacy-compliance", icon: "ShieldCheck", order: 7 },
  { name: "Health, Fitness & Wellness", slug: "health-fitness-wellness", icon: "Heart", order: 8 },
  { name: "Social Media & Creator Tools", slug: "social-media-creator-tools", icon: "Share2", order: 9 },
  { name: "Leaderboards & Attention Markets", slug: "leaderboards-attention-markets", icon: "Trophy", order: 10 },
  { name: "Hiring, Jobs & Careers", slug: "hiring-jobs-careers", icon: "Briefcase", order: 11 },
  { name: "Education & Learning", slug: "education-learning", icon: "GraduationCap", order: 12 },
  { name: "Agencies, Studios & Services", slug: "agencies-studios-services", icon: "Layers", order: 13 },
  { name: "Ecommerce & Retail", slug: "ecommerce-retail", icon: "ShoppingCart", order: 14 },
  { name: "Domains & Web Assets", slug: "domains-web-assets", icon: "Globe", order: 15 },
  { name: "Games & Entertainment", slug: "games-entertainment", icon: "Gamepad2", order: 16 },
  { name: "People & Profiles", slug: "people-profiles", icon: "User", order: 17 },
  { name: "Productivity & Personal Tools", slug: "productivity-personal-tools", icon: "CheckSquare", order: 18 },
  { name: "Design & Creative", slug: "design-creative", icon: "Palette", order: 19 },
  { name: "Writing & Content", slug: "writing-content", icon: "PenTool", order: 20 },
  { name: "Directories, Launch & Discovery", slug: "directories-launch-discovery", icon: "Rocket", order: 21 },
  { name: "AI Media Generation", slug: "ai-media-generation", icon: "Sparkles", order: 22 },
  { name: "Audio, Voice & Podcasting", slug: "audio-voice-podcasting", icon: "Mic", order: 23 },
  { name: "Sales & Lead Generation", slug: "sales-lead-generation", icon: "Target", order: 24 },
]

async function main() {
  console.log('🌱 Iniciando seed de datos para puja.lol con 24 categorías dinámicas...')

  // Limpiar datos previos
  await prisma.payment.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.site.deleteMany()
  await prisma.user.deleteMany()
  await prisma.auctionConfig.deleteMany()
  await prisma.categoryItem.deleteMany()

  // 1. Insertar las 24 Categorías con iconos oficiales
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.categoryItem.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: cat.order,
        isActive: true,
      },
    })
  }

  // Configuración de la subasta
  await prisma.auctionConfig.create({
    data: {
      minIncrement: 5.0,
      maxBidsPerHour: 10,
    },
  })

  // Crear Usuario Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@puja.lol',
      name: 'Admin Puja',
      handle: 'admin',
      role: Role.ADMIN,
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    },
  })

  // Lista de usuarios ficticios
  const usersData = [
    { email: 'sofia@dev.co', name: 'Sofía Romero', handle: 'sofidev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia' },
    { email: 'nico@crypto.lat', name: 'Nico Valenzuela', handle: 'cryptonico', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nico' },
    { email: 'luna@code.io', name: 'Luna Castillo', handle: 'luna_codes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna' },
    { email: 'carlos@saas.es', name: 'Carlos Mendoza', handle: 'carlossaas', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos' },
    { email: 'marina@seo.pro', name: 'Marina Delgado', handle: 'marina_seo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marina' },
    { email: 'alvaro@ia.lat', name: 'Álvaro Gómez', handle: 'alvaro_ia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alvaro' },
    { email: 'elena@growth.dev', name: 'Elena Torres', handle: 'elenagrowth', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena' },
    { email: 'mateo@crypto.xyz', name: 'Mateo Rivas', handle: 'mateorivas', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo' },
    { email: 'lucia@security.net', name: 'Lucía Vega', handle: 'lucia_sec', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia' },
    { email: 'david@b2b.io', name: 'David Peña', handle: 'davidb2b', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' },
  ]

  const createdUsers = []
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        handle: u.handle,
        role: Role.USER,
        image: u.avatar,
      },
    })
    createdUsers.push(user)
  }

  // 20 Sitios Realistas con categorías exactas del listado
  const sitesData = [
    {
      name: 'ChatNode AI',
      slug: 'chatnode-ai',
      url: 'https://chatnode.ai',
      description: 'Entrena chatbots inteligentes con tus propios documentos, webs y bases de conocimiento en 2 minutos.',
      category: 'AI Agents & Infrastructure',
      clicks: 42680,
      winningBid: 17005,
      historyBids: [12000, 14500, 15800, 16500, 17005],
      ownerIdx: 0,
      daysRemaining: 75,
    },
    {
      name: 'KiteSEO Analytics',
      slug: 'kiteseo-analytics',
      url: 'https://kiteseo.com',
      description: 'Plataforma de auditoría técnica SEO, análisis de backlinks y seguimiento de palabras clave en tiempo real.',
      category: 'SEO & AI Visibility',
      clicks: 35120,
      winningBid: 14250,
      historyBids: [8000, 11000, 13000, 14250],
      ownerIdx: 4,
      daysRemaining: 60,
    },
    {
      name: 'PromptLayer Studio',
      slug: 'promptlayer-studio',
      url: 'https://promptlayer.dev',
      description: 'El toolkit definitivo para ingenieros de prompts y desarrolladores de LLMs con versionado colaborativo.',
      category: 'Developer Tools',
      clicks: 29400,
      winningBid: 11800,
      historyBids: [6500, 9200, 10500, 11800],
      ownerIdx: 2,
      daysRemaining: 45,
    },
    {
      name: 'CryptoSniper Pro',
      slug: 'cryptosniper-pro',
      url: 'https://cryptosniper.io',
      description: 'Terminal automatizada de trading descentralizado y alertas instantáneas de liquidez en Solana y Base.',
      category: 'Crypto, Web3 & Investing',
      clicks: 24800,
      winningBid: 9600,
      historyBids: [5000, 7800, 9600],
      ownerIdx: 1,
      daysRemaining: 55,
    },
    {
      name: 'ViralMetrics Growth',
      slug: 'viralmetrics-growth',
      url: 'https://viralmetrics.co',
      description: 'Suite de automatización para creadores de contenido: detecta tendencias antes de que se vuelvan virales.',
      category: 'Marketing & Advertising',
      clicks: 21300,
      winningBid: 8200,
      historyBids: [4200, 6800, 8200],
      ownerIdx: 6,
      daysRemaining: 30,
    },
    {
      name: 'GuardiaCloud Security',
      slug: 'guardiacloud-security',
      url: 'https://guardiacloud.es',
      description: 'Escáner continuo de vulnerabilidades y cumplimiento ISO 27001 para startups y fintechs.',
      category: 'Security, Privacy & Compliance',
      clicks: 18500,
      winningBid: 7150,
      historyBids: [3500, 5400, 7150],
      ownerIdx: 8,
      daysRemaining: 25,
    },
    {
      name: 'FacturaFast SaaS',
      slug: 'facturafast-saas',
      url: 'https://facturafast.com',
      description: 'Facturación electrónica automática para freelancers y agencias en México, Colombia y España.',
      category: 'Business, Finance & Legal',
      clicks: 16200,
      winningBid: 6300,
      historyBids: [3000, 4800, 6300],
      ownerIdx: 9,
      daysRemaining: 80,
    },
    {
      name: 'SubSync Latino',
      slug: 'subsync-latino',
      url: 'https://subsync.la',
      description: 'Generador de subtítulos dinámicos con doblaje de voz IA con acento neutro.',
      category: 'Social Media & Creator Tools',
      clicks: 14750,
      winningBid: 5400,
      historyBids: [2800, 4100, 5400],
      ownerIdx: 0,
      daysRemaining: 40,
    },
    {
      name: 'DevBoilerplate Next',
      slug: 'devboilerplate-next',
      url: 'https://nextboiler.dev',
      description: 'La plantilla definitiva de Next.js 15 con Auth, Pagos, Base de datos y UI moderna lista para lanzar hoy.',
      category: 'Developer Tools',
      clicks: 13200,
      winningBid: 4750,
      historyBids: [2200, 3600, 4750],
      ownerIdx: 2,
      daysRemaining: 65,
    },
    {
      name: 'NeuroVoice Studio',
      slug: 'neurovoice-studio',
      url: 'https://neurovoice.ai',
      description: 'Clonación de voz hiperrealista para podcasts, audiolibros y atención al cliente automatizada.',
      category: 'Audio, Voice & Podcasting',
      clicks: 11900,
      winningBid: 4100,
      historyBids: [1800, 3000, 4100],
      ownerIdx: 5,
      daysRemaining: 18,
    },
    {
      name: 'LeadHunter B2B',
      slug: 'leadhunter-b2b',
      url: 'https://leadhunter.io',
      description: 'Prospector automatizado de leads B2B con validación de correos corporativos en tiempo real.',
      category: 'Sales & Lead Generation',
      clicks: 10400,
      winningBid: 3600,
      historyBids: [1500, 2700, 3600],
      ownerIdx: 4,
      daysRemaining: 50,
    },
    {
      name: 'Synthetix Media AI',
      slug: 'synthetix-media-ai',
      url: 'https://synthetix.art',
      description: 'Generador de imágenes y video publicitario fotorrealista para ecommerce y marcas.',
      category: 'AI Media Generation',
      clicks: 9100,
      winningBid: 3100,
      historyBids: [1200, 2200, 3100],
      ownerIdx: 7,
      daysRemaining: 15,
    },
    {
      name: 'DirectorioSaaS Hub',
      slug: 'directoriosaas-hub',
      url: 'https://directoriosaas.com',
      description: 'Directorio curado de herramientas creadas por desarrolladores independientes y bootstrappers.',
      category: 'Directories, Launch & Discovery',
      clicks: 7800,
      winningBid: 2650,
      historyBids: [1000, 1900, 2650],
      ownerIdx: 6,
      daysRemaining: 22,
    },
    {
      name: 'FitTrack AI',
      slug: 'fittrack-ai',
      url: 'https://fittrack.health',
      description: 'Asistente de nutrición y rutinas de entrenamiento personalizadas con visión computacional.',
      category: 'Health, Fitness & Wellness',
      clicks: 6500,
      winningBid: 2200,
      historyBids: [800, 1500, 2200],
      ownerIdx: 8,
      daysRemaining: 35,
    },
    {
      name: 'TalentoRemoto Jobs',
      slug: 'talentoremoto-jobs',
      url: 'https://talentoremoto.dev',
      description: 'Ofertas de trabajo 100% remotas en dólares para profesionales de tecnología en Latinoamérica.',
      category: 'Hiring, Jobs & Careers',
      clicks: 5300,
      winningBid: 1800,
      historyBids: [600, 1200, 1800],
      ownerIdx: 9,
      daysRemaining: 12,
    },
    {
      name: 'AcademiaCode Online',
      slug: 'academiacode-online',
      url: 'https://academiacode.es',
      description: 'Cursos interactivos de TypeScript, Rust y arquitectura cloud orientados a proyectos reales.',
      category: 'Education & Learning',
      clicks: 4200,
      winningBid: 1450,
      historyBids: [500, 1000, 1450],
      ownerIdx: 2,
      daysRemaining: 28,
    },
    {
      name: 'PixelCraft Studio',
      slug: 'pixelcraft-studio',
      url: 'https://pixelcraft.design',
      description: 'Agencia de diseño de producto digital, sistemas de diseño en Figma y branding para startups.',
      category: 'Agencies, Studios & Services',
      clicks: 3400,
      winningBid: 1100,
      historyBids: [400, 750, 1100],
      ownerIdx: 5,
      daysRemaining: 42,
    },
    {
      name: 'ShopSync Checkout',
      slug: 'shopsync-checkout',
      url: 'https://shopsync.store',
      description: 'Checkout optimizado en un paso con aumento de conversión para tiendas Shopify y WooCommerce.',
      category: 'Ecommerce & Retail',
      clicks: 2700,
      winningBid: 850,
      historyBids: [300, 600, 850],
      ownerIdx: 3,
      daysRemaining: 19,
    },
    {
      name: 'DominioMarketplace',
      slug: 'dominiomarketplace',
      url: 'https://dominios.lat',
      description: 'Compra y venta de dominios .ai, .io y .com con valoración instantánea y custodia segura.',
      category: 'Domains & Web Assets',
      clicks: 1900,
      winningBid: 650,
      historyBids: [200, 450, 650],
      ownerIdx: 4,
      daysRemaining: 14,
    },
    {
      name: 'EscriboAI Copywriter',
      slug: 'escriboai-copywriter',
      url: 'https://escribo.ai',
      description: 'Genera artículos de blog optimizados para SEO y copies de alta conversión para tus campañas.',
      category: 'Writing & Content',
      clicks: 1150,
      winningBid: 500,
      historyBids: [150, 300, 500],
      ownerIdx: 3,
      daysRemaining: 8,
    },
  ]

  const now = new Date()

  for (let i = 0; i < sitesData.length; i++) {
    const s = sitesData[i]
    const owner = createdUsers[s.ownerIdx % createdUsers.length]

    const expiresAt = new Date(now.getTime() + s.daysRemaining * 24 * 60 * 60 * 1000)
    const createdAt = new Date(now.getTime() - (30 - i) * 24 * 60 * 60 * 1000)

    const site = await prisma.site.create({
      data: {
        name: s.name,
        slug: s.slug,
        url: s.url,
        description: s.description,
        category: s.category,
        status: SiteStatus.ACTIVE,
        clicks: s.clicks,
        expiresAt: expiresAt,
        ownerId: owner.id,
        createdAt: createdAt,
      },
    })

    // Pago de publicación
    await prisma.payment.create({
      data: {
        userId: owner.id,
        amount: 25.0,
        type: PaymentType.LISTING,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'MANUAL_TEST',
        siteId: site.id,
        createdAt: createdAt,
      },
    })

    // Pujas históricas
    for (let bIdx = 0; bIdx < s.historyBids.length; bIdx++) {
      const bidAmount = s.historyBids[bIdx]
      const isWinning = bIdx === s.historyBids.length - 1
      const bidder = createdUsers[(s.ownerIdx + bIdx + 1) % createdUsers.length]
      const bidDate = new Date(createdAt.getTime() + (bIdx + 1) * 3 * 24 * 60 * 60 * 1000)

      const bid = await prisma.bid.create({
        data: {
          siteId: site.id,
          userId: bidder.id,
          amount: bidAmount,
          isWinning: isWinning,
          auctionDate: isWinning && i < 5 ? now : bidDate,
          createdAt: bidDate,
        },
      })

      await prisma.payment.create({
        data: {
          userId: bidder.id,
          amount: bidAmount,
          type: PaymentType.BID,
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'MANUAL_TEST',
          siteId: site.id,
          bidId: bid.id,
          createdAt: bidDate,
        },
      })
    }
  }

  console.log('✅ Seed completado con éxito: 24 categorías creadas y 20 sitios asociados.')
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
