import fs from "fs";
import path from "path";

const __dirname = path.resolve();
const localesDir = path.join(__dirname, "../frontend/locales");

const staticTranslations = {
  ur: {
    nav_projects: "مقابلے کے شاہکار",
    projects: {
      title_part1: "علی کے کائناتی",
      title_part2: "نامزد شاہکار",
      subtitle: "راجہ محمد علی اصغر نے فیصلہ کیا کہ جی-کوڈ لکھنا بہت آسان ہے، اس لیے انہوں نے ٹیک بریفز کے 'مستقبل بنائیں' 2026 ڈیزائن مقابلے میں پانچ مختلف کیٹیگریز میں خود کو نامزد کر لیا۔ یہ ریاضیاتی اور ڈیجیٹل برتری کا مٹی اور دھول سے پاک ثبوت ہے۔",
      proj1_title: "دی لیجنڈ-الفا: نیکوٹینک آنکولوجی ریورژن",
      proj1_category: "میڈیکل کیٹیگری نامزد",
      proj1_desc: "کینسر سے لڑنے کی کیا ضرورت ہے جب آپ اسے دوبارہ پروگرام کر سکتے ہیں؟ ایک معلق سالماتی انجینئرنگ پلیٹ فارم جو جدید ترین کینسر کے علاج کے لیے CRISPR 'ریسٹوریشن کوڈ' کو مصنوعی نیکوٹین اینالاگ میں لپیٹ کر ڈیزائن کیا گیا ہے۔ یہ لیمونین اور پائنین کے ذائقے والی 2.5 مائکرون کی طبی دھند فراہم کرتا ہے۔ ڈیزائننگ میں استعمال ہوا: خالصتاً دماغ۔",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "دی مالیکیولر بانڈ بریکر: پلازما-واٹر پروپلشن",
      proj2_category: "انرجی، پاور اور پروپلشن نامزد",
      proj2_desc: "پانی کی دھند کو حقیقی وقت میں ہائی انرجی ہائیڈروجن آکسیجن ریڈیکلز (HHO) میں تبدیل کرنے والے مائیکرو پلسڈ پلازما ری ایکٹر کے ذریعے ایندھن کی روایتی رکاوٹوں کو بائی پاس کریں۔ پانی کے مالیکیولز کو N52 میگنےٹس سے ترتیب دیں، پھر انہیں 1 ملی میٹر کے بنفشی پلازما آرک سے توڑ کر صاف مکینیکل ٹارک حاصل کریں۔",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "کرسر آف کیڈ: ایجنٹک سی این سی ویکٹر انجن",
      proj3_category: "روبوٹکس اور آٹومیشن نامزد",
      proj3_desc: "دستی ویکٹر ٹریسنگ کی جان لیوا مشقت کو الوداع کہیں۔ یہ اے آئی نیٹیو جیومیٹرک CAM انجن دستی نوڈ ایڈیٹنگ کو نیچرل لینگویج ورک فلو سے بدل دیتا ہے۔ یہ زبانی ہدایات سے براہ راست جی-کوڈ کے لیے ریاضیاتی طور پر پرفیکٹ، 1 ملی میٹر معیار کے ویکٹر تیار کرتا ہے۔",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "ویکٹر وژن: انفینیٹ ریزولیوشن کوڈیک",
      proj4_category: "الیکٹرانکس کیٹیگری نامزد",
      proj4_desc: "ایک امیج/ویڈیو کوڈیک (.svgc اور .svgv) جو روایتی پکسلز کو ریاضیاتی ویکٹر ڈی این اے سے بدل دیتا ہے۔ یہ بغیر کسی پکسلیشن کے لا محدود زوم فراہم کرتا ہے جبکہ فریموں کو دوبارہ بنانے کے بجائے کوآرڈینیٹ ٹرانسفارمیشنز کو ٹریک کر کے 85% تک بینڈوتھ بچاتا ہے۔",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "بائیو انسپائرڈ فلائٹ: پیرامیٹرک فیدر ونگز",
      proj5_category: "ایرو اسپیس اور ڈیفنس نامزد",
      proj5_desc: "انسانی پیمانے پر پرواز کے لیے Onshape میں 1 ملی میٹر کی درستگی کے ساتھ ماڈل کیا گیا بائیو میمیٹک ونگ سسٹم۔ یہ متغیر اسٹوڈیوز کے ذریعے ریئل ٹائم ایڈجسٹ ایبل ریشوز اور انتہائی مضبوط ونگ ہڈیوں کا استعمال کرتا ہے جو بغیر تھکاوٹ کے بھاری لفٹ لوڈ سنبھال سکتی ہے۔",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "شاہکار دیکھیں اور ووٹ دیں"
    }
  },
  ko: {
    nav_projects: "대회 출품작",
    projects: {
      title_part1: "Ali의 우주적",
      title_part2: "지명된 걸작들",
      subtitle: "Raja Muhammad Ali Asghar는 G-Code 작성이 너무 쉽다고 느껴, Tech Briefs 'Create the Future' 2026 디자인 공모전의 5개 부문에 자신을 지명했습니다. 여기 물리적 톱밥이 전혀 없는 수학적 및 디지털 우월함의 증거가 있습니다.",
      proj1_title: "The Legend-Alpha: 니코틴 표적 암 세포 역전",
      proj1_category: "의료 부문 후보작",
      proj1_desc: "암 세포와 싸울 필요 없이 재프로그래밍해 보세요. CRISPR '복구 코드'를 암 세포가 좋아하는 니코틴 수용체를 표적하기 위해 합성 니코틴 유사체로 포장하여 분무식 분자 공학으로 치료하는 의료 플랫폼입니다. 리모넨과 피넨 향의 2.5미크론 의료 미스트를 제공합니다. 순수하게 뇌를 사용하여 설계됨.",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "The Molecular Bond Breaker: 플라즈마-물 추진",
      proj2_category: "에너지, 동력 및 추진 후보작",
      proj2_desc: "물 미스트를 실시간으로 고에너지 수소-산소 라디칼(HHO)로 변환하는 미세 펄스 플라즈마 반응기를 통해 전통적인 연료 제약을 우회합니다. N52 자석으로 물 분자를 배열하고, 1mm 보라색 플라즈마 아크로 분열시켜 청정 기계식 토크를 생성합니다.",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "Cursor of CAD: 에이전트 기반 CNC 벡터 엔진",
      proj3_category: "로봇공학 및 자동화 후보작",
      proj3_desc: "정신을 좀먹는 수동 벡터 트레이싱의 병목을 끝내세요. 수동 노드 편집을 자연어 대화형 워크플로우로 완전히 대체하는 인공지능 기반 기하 CAM 엔진입니다. 말 한마디로 직접 G-code 툴패스 생성이 가능한 수학적으로 완벽한 1mm 표준 벡터를 출력합니다.",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "VectorVision: 무한 해상도 코덱",
      proj4_category: "전자 제품 부문 후보작",
      proj4_desc: "전통적인 픽셀을 수학적인 벡터 DNA로 대체하는 이미지/비디오 코덱(.svgc & .svgv)입니다. 해상도 저하거나 깨짐이 전혀 없는 무한 줌을 가능하게 하고, 매 프레임을 다시 그리는 대신 좌표 변환만 추적하여 최대 85%의 H.264 데이터 압축을 달성합니다.",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "Bio-Inspired Flight: 파라메트릭 깃털 날개",
      proj5_category: "항공 우주 및 국방 후보작",
      proj5_desc: "인간 크기의 개인용 비행을 위해 Onshape에서 1mm 정밀도로 모델링된 생체 모방 날개 시스템입니다. 가변 스튜디오를 활용한 실시간 조절식 화면 비율과 내구성이 검증된 날개 골격 설계를 통해 엄청난 양력을 안정적으로 지탱합니다.",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "작품 보기 및 투표하기"
    }
  },
  ru: {
    nav_projects: "Конкурсные Шедевры",
    projects: {
      title_part1: "Космические",
      title_part2: "Номинированные Шедевры Али",
      subtitle: "Раджа Мухаммад Али Асгар решил, что писать G-коды слишком легко, и номинировал себя на престижный конкурс дизайна Tech Briefs 'Create the Future' 2026 года сразу в ПЯТИ категориях. Вот математическое и цифровое доказательство превосходства без физической древесной пыли.",
      proj1_title: "The Legend-Alpha: Никотиново-Направленное Лечение Рака",
      proj1_category: "Номинант в категории Медицина",
      proj1_desc: "Зачем бороться с раком, если его можно просто перепрограммировать? Аэрозольная платформа молекулярной инженерии на основе CRISPR «Restoration Code», упакованного в синтетический аналог никотина (потому что раковые клетки обожают никотиновые рецепторы). Доставляет 2,5-микронный туман с ароматом лимонена и пинена. Разработано исключительно силой мысли.",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "The Molecular Bond Breaker: Плазменно-Водный Двигатель",
      proj2_category: "Номинант в категории Энергетика и Двигатели",
      proj2_desc: "Обход традиционных топливных ограничений за счет микроимпульсного плазменного реактора, превращающего водяной туман в высокоэнергетический катализатор (HHO) в реальном времени. Вода выравнивается магнитами N52, а затем расщепляется 1-миллиметровой фиолетовой плазменной дугой для получения чистого крутящего момента.",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "Cursor of CAD: Агентный Векторный CNC-Движок",
      proj3_category: "Номинант в категории Робототехника",
      proj3_desc: "Забудьте о рутинной ручной отрисовке векторов. Этот ИИ-агентный геометрический CAM-движок заменяет ручное редактирование узлов простым текстовым описанием. Генерирует математически идеальные векторы с точностью до 1 мм, готовые для расчета траекторий G-кода непосредственно из ваших слов.",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "VectorVision: Кодек Бесконечного Разрешения",
      proj4_category: "Номинант в категории Электроника",
      proj4_desc: "Кодек изображений и видео (.svgc и .svgv), который заменяет традиционные пиксели математической векторной ДНК. Обеспечивает бесконечное масштабирование без пикселизации и артефактов сжатия, обеспечивая до 85% экономии трафика по сравнению с H.264.",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "Bio-Inspired Flight: Параметрические Перьевые Крылья",
      proj5_category: "Номинант в категории Аэрокосмос и Оборона",
      proj5_desc: "Биомиметическая крыльевая система для индивидуальных полетов человека, смоделированная с точностью до 1 мм в Onshape. Использует параметрические переменные студии для настройки размаха крыла и угла атаки перьев в реальном времени, выдерживая колоссальные нагрузки.",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "Посмотреть и проголосовать"
    }
  },
  ja: {
    nav_projects: "コンテストの業績",
    projects: {
      title_part1: "Aliの宇宙的",
      title_part2: "ノミネートされた傑作群",
      subtitle: "ラジャ・ムハンマド・アリ・アスガルはGコードの作成があまりにも簡単すぎると判断し、Tech Briefs主催の「Create the Future」2026デザインコンテストの5つの異なる部門に自らを推薦しました。実物の木屑が一切出ない、数学的およびデジタル的優位性の証明がここにあります。",
      proj1_title: "The Legend-Alpha: ニコチン標的型がん細胞逆転プラットフォーム",
      proj1_category: "医療部門ノミネート",
      proj1_desc: "がん細胞と戦うのではなく、単に再プログラミングしてみては？がん細胞が愛好するニコチン受容体を標的とする合成ニコチン誘導体で包まれたCRISPR「修復コード」を使用し、末期がんを治療する噴霧式分子工学プラットフォーム。リモネンとピネン風味の2.5ミクロン医療用ミストを提供。純粋に脳のみで設計されました。",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "The Molecular Bond Breaker: プラズマ水 propulsion システム",
      proj2_category: "エネルギー、動力および推進部門ノミネート",
      proj2_desc: "微細パルスプラズマリアクターで水ミストをリアルタイムで高エネルギー水素酸素ラジカル（HHO）に変換し、従来の燃料制約を完全に回避。N52ネオジム磁石で水分子を整列させ、1mmの紫色のプラズマアークで瞬時に破砕してクリーンな機械的トルクを取り出します。",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "Cursor of CAD: 自律型CNC幾何学CADエンジン",
      proj3_category: "ロボット工学および自動化部門ノミネート",
      proj3_desc: "精神を消耗させる手動のベクトル変換のボトルネックに終止符を打ちましょう。手動のノード編集を自然言語による対話型ワークフローに置き換えるAIネイティブ幾何CAMエンジン。言葉の指示から直接、Gコード計算に適した数学的に完璧な1mm標準ベクトルを出力します。",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "VectorVision: 無限解像度コーデック",
      proj4_category: "電子機器部門ノミネート",
      proj4_desc: "従来の画素（ピクセル）を数学的なベクトルDNAで置き換える画像および動画コーデック（.svgcおよび.svgv）です。画質低下やブロックノイズが全く発生しない無限ズームを可能にし、全フレームの再描画ではなく座標変換を追跡することで、最大85%の帯域削減を達成します。",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "Bio-Inspired Flight: パラメトリック多羽式翼システム",
      proj5_category: "宇宙航空および防衛部門ノミネート",
      proj5_desc: "人間規模の個人飛行のために、Onshapeにて1mmの精度でモデリングされた生体模倣翼システムです。変数スタジオ機能を利用したリアルタイム調整可能アスペクト比と耐久性に優れた航空骨格設計により、膨大な揚力を安全にサポートします。",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "エントリーを見て投票する"
    }
  },
  zh: {
    nav_projects: "大赛杰作",
    projects: {
      title_part1: "Ali的宇宙级",
      title_part2: "提名杰作",
      subtitle: "Raja Muhammad Ali Asghar 觉得编写 G代码实在太简单了，因此他在 2026 年 Tech Briefs“创造未来”设计大赛中，自荐提名了五个不同类别的项目。这是数学和数字霸权的纯净无物理粉尘的绝对证明。",
      proj1_title: "The Legend-Alpha: 尼古丁靶向肿瘤逆转平台",
      proj1_category: "医疗类别提名项目",
      proj1_desc: "为什么要对抗癌症，而不是直接重编程它？这是一种基于气雾化分子工程的晚期癌症逆转治疗平台，采用包裹在合成尼古丁类似物（因为癌细胞极度喜爱尼古丁受体）中的 CRISPR“修复代码”。输送柠檬烯和蒎烯气味的 2.5微米医疗级薄雾。纯脑力研发设计。",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "The Molecular Bond Breaker: 等离子体水动力系统",
      proj2_category: "能源、动力与推进提名项目",
      proj2_desc: "通过微脉冲等离子体反应器将 water mist 实时转化为高能氢氧自由基（HHO）催化剂，从而绕过传统燃料限制。利用 N52 钕磁铁整列水分子，然后用 1毫米紫色等离子弧瞬间击碎分子键以释放清洁的机械扭矩。",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "Cursor of CAD: 自适应CNC几何矢量引擎",
      proj3_category: "机器人与自动化提名项目",
      proj3_desc: "告别令人崩溃的传统手动矢量描摹瓶颈。这款 AI 原生几何 CAM 引擎用自适应的自然语言对话取代了繁琐的手动节点编辑，直接通过口头提示输出用于 G代码生成的数学上完美的 1毫米标准矢量。",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "VectorVision: 无限分辨率编解码器",
      proj4_category: "电子类别提名项目",
      proj4_desc: "一种用数学矢量 DNA 代替传统网格像素的图像/视频编解码器（.svgc & .svgv）。实现完全没有模糊和噪点的无级无损放大，并且仅通过追踪坐标变换而非重新绘制逐帧画面即可降低高达 85% 的数据传输带宽需求。",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "Bio-Inspired Flight: 参数化多羽翼系统",
      proj5_category: "航空航天与国防提名项目",
      proj5_desc: "在 Onshape 中以 1毫米高精度建模的仿生人尺度飞行机翼系统。利用变量工作室功能进行实时可调的展弦比和羽毛俯仰角调整，并在结构上进行了 von Mises 应力测试以完美承受强力垂直升力负载。",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "查看条目并投票"
    }
  },
  es: {
    nav_projects: "Logros del Concurso",
    projects: {
      title_part1: "Las Obras",
      title_part2: "Maestras Nominadas de Ali",
      subtitle: "Raja Muhammad Ali Asghar decidió que escribir G-Code era demasiado fácil, por lo que se nominó a sí mismo para el Concurso de Diseño Tech Briefs 'Create the Future' 2026 en CINCO categorías diferentes. Aquí está la prueba matemática y digital de supremacía libre de aserrín físico.",
      proj1_title: "The Legend-Alpha: Reversión Oncológica Dirigida por Nicotina",
      proj1_category: "Nominado en la Categoría Médica",
      proj1_desc: "¿Por qué luchar contra el cáncer cuando puedes reprogramarlo? Plataforma de ingeniería molecular en aerosol diseñada para tratar el cáncer metastásico en etapa avanzada utilizando CRISPR 'Restoration Code' envuelto en un análogo de nicotina sintético (porque a las células tumorales les encantan los receptores nicotínicos). Produce una niebla médica de 2.5 micras saborizada con limoneno y pineno. Diseñado puramente con: Cerebro.",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "The Molecular Bond Breaker: Propulsión de Plasma y Agua",
      proj2_category: "Nominado en Energía, Potencia y Propulsión",
      proj2_desc: "Evite las limitaciones tradicionales de combustible ejecutando un reactor de plasma micropulsado que fragmenta la niebla de agua en radicales de hidrógeno y oxígeno (HHO) en tiempo real. Alinea moléculas de agua con imanes N52, luego las rompe con un arco de plasma de 1 mm para obtener un par mecánico limpio.",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "Cursor of CAD: Motor Vectorial de CNC Autónomo",
      proj3_category: "Nominado en Robótica y Automatización",
      proj3_desc: "Diga adiós al doloroso cuello de botella del trazado de vectores manual. Este motor CAM geométrico nativo de IA reemplaza la edición de nodos manual con un flujo de trabajo autónomo de lenguaje natural. Produce vectores perfectos estándar de 1 mm listos para G-code a partir de comandos de voz.",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "VectorVision: Códec de Resolución Infinita",
      proj4_category: "Nominado en la Categoría de Electrónica",
      proj4_desc: "Un códec de imagen y video (.svgc y .svgv) que reemplaza los píxeles tradicionales con ADN vectorial matemático. Permite un zoom infinito sin pixelación y reduce el ancho de banda necesario hasta en un 85% al rastrear transformaciones de coordenadas en lugar de volver a dibujar fotogramas.",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "Bio-Inspired Flight: Alas de Plumas Paramétricas",
      proj5_category: "Nominado en Aeroespacial y Defensa",
      proj5_desc: "Un sistema de alas biomiméticas para vuelo humano, modelado con precisión de 1 mm en Onshape. Utiliza estudios de variables paramétricas para ajustar la relación de aspecto de las plumas y un diseño óseo probado contra fatiga estructural.",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "Ver entrada y votar"
    }
  },
  de: {
    nav_projects: "Wettbewerbs-Erfolge",
    projects: {
      title_part1: "Alis Kosmische",
      title_part2: "Nominierte Meisterwerke",
      subtitle: "Raja Muhammad Ali Asghar fand G-Code-Schreiben viel zu einfach. Deshalb hat er sich beim Tech Briefs 'Create the Future' Design-Wettbewerb 2026 gleich in FÜNF verschiedenen Kategorien nominiert. Hier ist der mathematische, sägemehlfreie Beweis seiner digitalen Vormachtstellung.",
      proj1_title: "The Legend-Alpha: Nikotin-gesteuerte Krebszellenreversion",
      proj1_category: "Nominiert in der Kategorie Medizin",
      proj1_desc: "Warum Krebs bekämpfen, wenn man ihn einfach umprogrammieren kann? Eine aerosolierte molekulare Plattform, die späte Metastasen mit CRISPR 'Restoration Code' behandelt, verpackt in ein synthetisches Nikotinanalogon (da Krebszellen Nikotinrezeptoren lieben). Erzeugt einen 2,5-Mikrometer-Nebel mit Limonen- und Pinenduft. Ausschließlich mit dem Gehirn entwickelt.",
      proj1_url: "https://contest.techbriefs.com/2026/entries/medical/13990-0508-232739-the-legend-alpha-nicotinic-targeted-universal-oncology-reversion",
      proj2_title: "The Molecular Bond Breaker: Plasma-Wasser-Antrieb",
      proj2_category: "Nominiert in Energie, Kraft & Antrieb",
      proj2_desc: "Umgehen Sie klassische Kraftstoffgrenzen mit einem mikropulsierenden Plasmareaktor, der Wassernebel in Echtzeit in hochenergetische Wasserstoff-Sauerstoff-Radikale (HHO) spaltet. Richtet Wassermoleküle mit N52-Magneten aus und zerschlägt sie mit einem 1-mm-Plasmabogen für sauberes Drehmoment.",
      proj2_url: "https://contest.techbriefs.com/2026/entries/energy-power-and-propulsion/13988-0508-154308-the-molecular-bond-breaker-high-frequency-plasma-water-injection-system",
      proj3_title: "Cursor of CAD: Autonomer CNC-Vektormotor",
      proj3_category: "Nominiert in Robotik & Automatisierung",
      proj3_desc: "Schluss mit dem quälenden manuellen Nachzeichnen von Vektoren. Diese KI-native CAM-Engine ersetzt die manuelle Bearbeitung durch einen sprachgesteuerten Arbeitsablauf. Gibt mathematisch perfekte 1-mm-Vektoren für G-Code-Berechnungen direkt aus gesprochenen Befehlen aus.",
      proj3_url: "https://contest.techbriefs.com/2026/entries/robotics-and-automation/13987-0508-095442-cursor-of-cad-an-ai-native-agentic-engine-for-cnc-geometry",
      proj4_title: "VectorVision: Infinite-Resolution-Codec",
      proj4_category: "Nominiert in der Kategorie Elektronik",
      proj4_desc: "Ein Bild-/Videocodec (.svgc & .svgv), der klassische Pixel durch mathematische Vektor-DNA ersetzt. Ermöglicht unendliches Zoomen ohne Pixelierung und spart bis zu 85% H.264-Bandbreite, indem Koordinatentransformationen verfolgt statt Bilder neu gezeichnet werden.",
      proj4_url: "https://contest.techbriefs.com/2026/entries/electronics/13985-0507-214516-vectorvision-a-geometric-protocol-for-infinite-resolution-digital-media",
      proj5_title: "Bio-Inspired Flight: Parametrisches Federflügelsystem",
      proj5_category: "Luftfahrt & Verteidigung",
      proj5_desc: "Ein biomimetisches Flügelsystem für bemannte Flüge, in Onshape mit 1-mm-Präzision modelliert. Ermöglicht Echtzeit-Flügelanpassung über variable Studios und strukturell optimierte Flügelknochen für maximale Tragkraft.",
      proj5_url: "https://contest.techbriefs.com/2026/entries/aerospace-and-defense/13983-0507-104856-bio-inspired-human-flight-parametric-multi-feather-wing-system",
      vote_action: "Beitrag ansehen & abstimmen"
    }
  }
};

async function main() {
  console.log("Merging static translations of Projects for all locales...");
  
  for (const [langCode, data] of Object.entries(staticTranslations)) {
    const outPath = path.join(localesDir, `${langCode}.json`);
    if (!fs.existsSync(outPath)) {
      console.error(`Destination locale file does not exist: ${outPath}`);
      continue;
    }
    
    try {
      const destData = JSON.parse(fs.readFileSync(outPath, "utf8"));
      
      // Merge
      if (!destData.nav) destData.nav = {};
      destData.nav.projects = data.nav_projects;
      destData.projects = data.projects;
      
      fs.writeFileSync(outPath, JSON.stringify(destData, null, 2), "utf8");
      console.log(`✅ Merged static Projects translation for ${langCode}.json`);
    } catch (e) {
      console.error(`❌ Failed merging static Projects for ${langCode}:`, e.message);
    }
  }
  
  console.log("Static translation merge process completed successfully!");
}

main();
